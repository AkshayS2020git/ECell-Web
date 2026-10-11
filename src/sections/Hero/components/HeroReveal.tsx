"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { FINAL_FRAG, SIM_FRAG, VERT } from "../webgl/shaders";
import { drawFlatText, layoutText } from "../webgl/text";
import { buildLetter, type Letter } from "../webgl/letters";
import { GALAXY_FRAG, GALAXY_VERT, buildGalaxy } from "../webgl/galaxy";
import { isPageScrollLocked } from "@/src/utils/scrollLock";

// Fraction of the hero height the nebula's core is raised above centre
// (0.3 puts it ~20% from the top).
const GALAXY_SHIFT_UP = 0.3;

/**
 * Hero title with a liquid ink reveal. Moving the pointer pours ink over the
 * flat title; inside it, glass balloon letters float over a particle nebula.
 */
export default function HeroReveal(): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    } catch {
      host.classList.add("hero-reveal--fallback");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Render at up to 1.5x, but cap the total pixel count so 4K/ultrawide
    // monitors and phones stay smooth. Recomputed on every resize.
    const maxPixels = coarse ? 1.2e6 : 3.7e6;
    let pixelRatio = 1;
    renderer.domElement.className = "hero-reveal__canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.PlaneGeometry(2, 2);

    // --- Nebula ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    const galaxyMaterial = new THREE.ShaderMaterial({
      vertexShader: GALAXY_VERT,
      fragmentShader: GALAXY_FRAG,
      uniforms: {
        uSpin: { value: 0 },
        uTime: { value: 0 },
        uSizeScale: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    // Particles are generated later, in idle time (see prepareScene).
    const galaxy = new THREE.Points(new THREE.BufferGeometry(), galaxyMaterial);
    galaxy.visible = false;
    galaxy.rotation.z = 0.28;
    galaxy.scale.setScalar(1.6);
    scene.add(galaxy);
    let spin = 0;

    // --- Glass balloon letters, drawn over the nebula ---
    const letterScene = new THREE.Scene();
    // Reflection environment is generated later, in idle time (prepareScene).
    let envTexture: THREE.Texture | null = null;
    letterScene.environmentIntensity = 1.1;

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-0.6, 0.9, 1);
    letterScene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(1, -0.4, 0.6);
    letterScene.add(rim);

    // Tinted glass: the shaded colour (reflections, highlights) is added at
    // full strength while only `opacity` of the nebula behind is blocked.
    const letterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x151515,
      metalness: 1,
      roughness: 0.18,
      // alphaTest runs after opacity is applied: half of 0.3 trims at the outline.
      alphaTest: 0.15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    });

    const letterCamera = new THREE.PerspectiveCamera(30, 1, 1, 20000);
    const letterGroup = new THREE.Group();
    letterScene.add(letterGroup);
    let letters: Letter[] = [];
    let layoutSize = 100;

    const disposeLetters = () => {
      for (const l of letters) {
        letterGroup.remove(l.mesh);
        l.mesh.geometry.dispose();
        l.mesh.material.dispose();
        l.alphaTexture.dispose();
      }
      letters = [];
    };

    // --- Render targets ---
    const rtOpts = {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
    };
    let simA = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    let simB = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    const sceneRT = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: true, samples: coarse ? 0 : 2 });
    renderer.autoClear = false;

    const textCanvas = document.createElement("canvas");
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.generateMipmaps = false;

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: SIM_FRAG,
      uniforms: {
        uPrev: { value: null },
        uMouse: { value: new THREE.Vector2(-10, -10) },
        uPrevMouse: { value: new THREE.Vector2(-10, -10) },
        uMouseVel: { value: new THREE.Vector2() },
        uTexel: { value: new THREE.Vector2(1, 1) },
        uAspect: { value: 1 },
        uRadius: { value: 0.1 },
        uStrength: { value: 0 },
        uDecay: { value: 0.97 },
        uVelDecay: { value: 0.93 },
        uDt: { value: 1 / 60 },
        uTime: { value: 0 },
      },
    });
    const finalMaterial = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FINAL_FRAG,
      uniforms: {
        uText: { value: textTexture },
        uScene: { value: sceneRT.texture },
        uMask: { value: null },
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uDark: { value: 0 },
        uTitleFade: { value: 0 },
        uInk: { value: 1 },
      },
    });
    const simScene = new THREE.Scene();
    simScene.add(new THREE.Mesh(quad, simMaterial));
    const finalScene = new THREE.Scene();
    finalScene.add(new THREE.Mesh(quad, finalMaterial));

    let fontFamily = getComputedStyle(host).getPropertyValue("--font-archivo").trim() || "Archivo";
    let cssW = 0;
    let cssH = 0;
    // Once the ink has fully faded there is nothing to draw, so the loop idles.
    // Tracks the strongest ink left on screen, decayed exactly like the sim.
    let inkLevel = 0;
    let dirty = true;
    let disposed = false;
    // Glass letters are only needed once ink appears, and building them is
    // CPU-heavy (a distance transform per glyph). So they are built once the
    // real font has loaded (not twice, before and after), one glyph per idle
    // callback, instead of in one multi-second block during startup.
    let fontsReady = typeof document === "undefined" || !document.fonts;
    let letterBuild = 0;
    const whenIdle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 400 });
      else window.setTimeout(cb, 16);
    };

    // The 3D side of the reveal (nebula particles, glass reflections, shader
    // programs) is only seen inside the ink, so it is prepared off the
    // critical path: on first need or a few seconds after mount, in idle
    // slices, with shaders compiled asynchronously where the driver allows.
    // Until it is ready, ink reveals plain black.
    let sceneReady = false;
    let preparing = false;
    const prepareScene = () => {
      if (preparing || disposed) return;
      preparing = true;
      whenIdle(() => {
        if (disposed) return;
        galaxy.geometry.dispose();
        galaxy.geometry = buildGalaxy(coarse ? 18000 : 42000);
        galaxy.visible = true;
        whenIdle(() => {
          if (disposed) return;
          const pmrem = new THREE.PMREMGenerator(renderer);
          const room = new RoomEnvironment();
          envTexture = pmrem.fromScene(room, 0.04).texture;
          room.dispose();
          pmrem.dispose();
          letterScene.environment = envTexture;
          // Warm up the glass program with the same defines as real letters.
          const warmAlpha = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
          warmAlpha.needsUpdate = true;
          const warmMaterial = letterMaterial.clone();
          warmMaterial.alphaMap = warmAlpha;
          const warmMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), warmMaterial);
          Promise.all([
            renderer.compileAsync(warmMesh, letterCamera, letterScene),
            renderer.compileAsync(galaxy, camera, scene),
          ])
            .catch(() => {})
            .finally(() => {
              warmMesh.geometry.dispose();
              warmMaterial.dispose();
              warmAlpha.dispose();
              if (!disposed) sceneReady = true;
            });
        });
      });
    };
    const prepareTimer = window.setTimeout(prepareScene, 4000);

    const buildText = () => {
      if (!cssW || !cssH) return;
      const layout = layoutText(cssW, cssH, fontFamily);
      // Anchor the DOM credit right-aligned just under the end of the title.
      host.style.setProperty("--credit-right", `${cssW - layout.right}px`);
      host.style.setProperty("--credit-top", `${layout.baseline + layout.size * 0.13}px`);
      host.style.setProperty("--credit-size", `${Math.min(15, Math.max(10, layout.size * 0.042))}px`);
      host.classList.add("hero-reveal--ready");
      layoutSize = layout.size;
      drawFlatText(textCanvas, layout, cssW, cssH, Math.min(pixelRatio, 2560 / cssW));
      textTexture.needsUpdate = true;
      dirty = true;

      disposeLetters();
      const build = ++letterBuild;
      if (!fontsReady) return;
      const queue = layout.glyphs
        .map((g, i) => ({ g, i }))
        .filter(({ g }) => g.char.trim() !== "");
      const buildNext = () => {
        // A newer layout (resize, font swap) or unmount supersedes this one.
        if (disposed || build !== letterBuild) return;
        const item = queue.shift();
        if (!item) return;
        const letter = buildLetter(item.g, layout, cssW, cssH, letterMaterial, item.i, coarse ? 110 : 150);
        if (letter) {
          letters.push(letter);
          letterGroup.add(letter.mesh);
        }
        if (queue.length) whenIdle(buildNext);
      };
      whenIdle(buildNext);
    };

    const resize = () => {
      // offsetWidth ignores the scroll scale transform on the stage.
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      if (!w || !h || (w === cssW && h === cssH)) return;
      cssW = w;
      cssH = h;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(maxPixels / (w * h)));
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(w, h, false);
      sceneRT.setSize(Math.round(w * pixelRatio), Math.round(h * pixelRatio));
      renderer.setClearColor(0x000000, 1);
      renderer.setRenderTarget(sceneRT);
      renderer.clear();
      renderer.setRenderTarget(null);
      const sw = Math.max(2, Math.round(w / 2));
      const sh = Math.max(2, Math.round(h / 2));
      simA.setSize(sw, sh);
      simB.setSize(sw, sh);
      simMaterial.uniforms.uTexel.value.set(1 / sw, 1 / sh);
      renderer.setClearColor(0x000000, 1);
      renderer.setRenderTarget(simA);
      renderer.clear();
      renderer.setRenderTarget(simB);
      renderer.clear();
      renderer.setRenderTarget(null);

      camera.aspect = w / h;
      // Pull back on narrow screens so the disc still reads as a spiral.
      camera.position.setLength(w / h < 1 ? 4.2 : 2.9);
      // Lens-shift the nebula up so its core sits at the top centre of the
      // hero instead of the middle (the camera still orbits the origin).
      camera.setViewOffset(w, h, 0, h * GALAXY_SHIFT_UP, w, h);
      galaxyMaterial.uniforms.uSizeScale.value = h * pixelRatio * 0.0045;

      // World units are CSS pixels at z = 0, so letters line up with the flat text.
      letterCamera.aspect = w / h;
      letterCamera.position.set(0, 0, h / 2 / Math.tan(THREE.MathUtils.degToRad(letterCamera.fov / 2)));
      letterCamera.near = letterCamera.position.z * 0.1;
      letterCamera.far = letterCamera.position.z * 4;
      letterCamera.updateProjectionMatrix();

      simMaterial.uniforms.uAspect.value = w / h;
      finalMaterial.uniforms.uAspect.value = w / h;
      buildText();
    };

    // Pointer state in UV space of the canvas (accounts for the scroll scale).
    const pointer = new THREE.Vector2(-10, -10);
    const smoothed = new THREE.Vector2(-10, -10);
    const lastStamp = new THREE.Vector2(-10, -10);
    const tilt = new THREE.Vector2();
    const tiltTarget = new THREE.Vector2();
    const wander = new THREE.Vector2();
    const rawVel = new THREE.Vector2();
    const vel = new THREE.Vector2();
    const orbit = new THREE.Spherical();
    let hasPointer = false;
    let lastInput = -Infinity;
    // Phones: the blob wanders in ~7s bursts (on arrival, after each touch,
    // and on returning to the top) and otherwise rests, instead of running the
    // whole WebGL pipeline for as long as the hero is on screen.
    const WANDER_MS = 7000;
    let wanderUntil = performance.now() + WANDER_MS;
    let atTop = true;

    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.set((e.clientX - rect.left) / rect.width, 1 - (e.clientY - rect.top) / rect.height);
      if (!hasPointer) {
        smoothed.copy(pointer);
        lastStamp.copy(pointer);
        hasPointer = true;
      }
      lastInput = performance.now();
      wanderUntil = lastInput + 1500 + WANDER_MS;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });

    // Scroll progress through the pinned hero drives the light -> dark theme
    // blend, timed with the card forming in HeroAnimations.
    // Measured on resize only, so scrolling never forces a layout read.
    const heroSection = host.closest<HTMLElement>(".hero");
    let heroTop = 0;
    let heroTravel = 0;
    let darkTarget = 0;
    let dark = 0;
    // The floating logo fades in over the card at ~15-35% of the hero
    // scroll; the title (and its credit) step aside over the same window so
    // the logo is the single focus instead of stacking on top of the text.
    let fadeTarget = 0;
    let titleFade = 0;
    let lastCreditFade = -1;
    let creditShade = -1;
    const onScroll = () => {
      if (heroTravel <= 0) return;
      const progress = THREE.MathUtils.clamp((window.scrollY - heroTop) / heroTravel, 0, 1);
      darkTarget = THREE.MathUtils.smoothstep(progress, 0.1, 0.42);
      const nowAtTop = darkTarget < 0.05;
      if (nowAtTop && !atTop) wanderUntil = performance.now() + WANDER_MS;
      atTop = nowAtTop;
      fadeTarget = THREE.MathUtils.smoothstep(progress, 0.14, 0.36);
    };
    const measureHero = () => {
      if (!heroSection) return;
      heroTop = heroSection.getBoundingClientRect().top + window.scrollY;
      heroTravel = heroSection.offsetHeight - window.innerHeight;
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureHero, { passive: true });
    measureHero();

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(host);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, cssW ? 150 : 0);
    });
    ro.observe(host);
    camera.position.set(0, 1, 1);
    resize();

    const onFontsReady = () => {
      if (disposed || fontsReady) return;
      fontsReady = true;
      fontFamily = getComputedStyle(host).getPropertyValue("--font-archivo").trim() || fontFamily;
      buildText();
    };
    document.fonts?.load(`900 100px ${fontFamily}`).then(onFontsReady, onFontsReady);
    // Never leave the hero without letters if the font request stalls.
    const fontTimeout = window.setTimeout(onFontsReady, 3000);

    const timer = new THREE.Timer();
    let raf = 0;
    // Phones render the hero at ~30fps: the slow ink looks the same and it
    // halves GPU work and battery drain while the wandering blob runs.
    const minFrame = coarse ? 1 / 31 : 0;
    let pending = 0;
    const tick = (timestamp: number) => {
      raf = requestAnimationFrame(tick);
      timer.update(timestamp);
      // Covered by the entry loader or a modal (both hold the scroll lock):
      // nothing to show, so do no work.
      if (!visible || document.hidden || isPageScrollLocked()) return;
      pending += timer.getDelta();
      if (pending < minFrame) return;
      // Real elapsed time drives fading; the motion sim gets a capped step so
      // a long frame can't fling the ink. (Using the capped step for fading
      // made slow devices keep the full scene rendering long after the ink
      // was gone: at 4fps, "2.5s" took ~12s.)
      const realDt = Math.min(pending, 1);
      const dt = Math.min(pending, 1 / 20);
      pending = 0;
      const t = timer.getElapsed();

      // Touch screens have no hover: a blob wanders on its own, and a finger
      // dragging across the hero takes over until it lifts for a moment.
      let target = pointer;
      const touching = performance.now() - lastInput < 1500;
      if (coarse && !touching) {
        // Only wander during a burst while the hero is at the top; otherwise
        // the blob holds still (no new ink), the ink fades and the loop idles.
        if (!reduceMotion && atTop && performance.now() < wanderUntil) {
          target = wander.set(
            0.5 + Math.sin(t * 0.43) * 0.32 + Math.sin(t * 0.17) * 0.08,
            0.5 + Math.sin(t * 0.61 + 1.3) * 0.22,
          );
          if (!hasPointer) {
            smoothed.copy(target);
            lastStamp.copy(target);
            hasPointer = true;
          }
        } else {
          target = smoothed;
        }
      }

      smoothed.lerp(target, 1 - Math.pow(0.00001, dt));
      const aspect = simMaterial.uniforms.uAspect.value as number;
      // Ink only flows while the pointer moves: a resting cursor lets it fade.
      rawVel.copy(smoothed).sub(lastStamp).divideScalar(Math.max(dt, 1e-3)).clampLength(0, 8);
      vel.lerp(rawVel, 1 - Math.pow(0.0005, dt));
      const speed = Math.hypot(vel.x * aspect, vel.y);
      const flow = THREE.MathUtils.smoothstep(speed, 0.03, 1.0);

      // Ease the theme so it never pops, and keep rendering while it moves.
      const ease = 1 - Math.pow(0.0005, dt);
      const darkMoving = Math.abs(darkTarget - dark) > 0.001;
      dark = darkMoving ? dark + (darkTarget - dark) * ease : darkTarget;
      const fadeMoving = Math.abs(fadeTarget - titleFade) > 0.001;
      titleFade = fadeMoving ? titleFade + (fadeTarget - titleFade) * ease : fadeTarget;
      const themeMoving = darkMoving || fadeMoving;
      const creditFade = Math.round(titleFade * 100);
      if (creditFade !== lastCreditFade) {
        lastCreditFade = creditFade;
        host.style.setProperty("--title-fade", String(creditFade / 100));
      }

      // The credit and backdrop follow the theme: black on white, light on the dark card.
      const shade = Math.round(dark * 237);
      if (shade !== creditShade) {
        creditShade = shade;
        host.style.setProperty("--credit-ink", `rgb(${shade}, ${shade}, ${shade - Math.round(dark * 5)})`);
        // The container behind the canvas must match the card colour too:
        // when the card is scaled, its anti-aliased edges sample this, and a
        // white background showed up as thin white lines around the card.
        const paper = Math.round(255 + (11 - 255) * dark);
        host.style.backgroundColor = `rgb(${paper}, ${paper}, ${paper})`;
      }

      // Ink decays below the visible threshold ~2.3s after the pointer stops.
      // From then on only the flat title is drawn (cheap), and nothing at all
      // once the theme has settled, so scrolling the hero stays smooth.
      const inkDecay = Math.pow(0.982, realDt * 60);
      inkLevel = flow > 0.01 ? 1 : inkLevel * inkDecay;
      const inkVisible = inkLevel > 0.08;
      if (inkVisible) prepareScene();
      if (!inkVisible && !dirty && !themeMoving) {
        lastStamp.copy(smoothed);
        return;
      }
      dirty = false;

      if (inkVisible) {
        // Mask simulation
        simMaterial.uniforms.uPrev.value = simA.texture;
        simMaterial.uniforms.uPrevMouse.value.copy(lastStamp);
        simMaterial.uniforms.uMouse.value.copy(smoothed);
        simMaterial.uniforms.uMouseVel.value.copy(vel).multiplyScalar(0.45);
        simMaterial.uniforms.uRadius.value = 0.07 + Math.min(speed * 0.06, 0.15);
        simMaterial.uniforms.uStrength.value = hasPointer ? flow * Math.min(dt * 60, 1.5) * 0.5 : 0;
        simMaterial.uniforms.uDecay.value = inkDecay;
        simMaterial.uniforms.uVelDecay.value = Math.pow(0.93, dt * 60);
        simMaterial.uniforms.uDt.value = dt;
        simMaterial.uniforms.uTime.value = t;
        renderer.setRenderTarget(simB);
        renderer.render(simScene, quadCamera);
        [simA, simB] = [simB, simA];
        lastStamp.copy(smoothed);

        // Nebula: spins faster while the ink is moving, camera leans to the cursor.
        const motion = reduceMotion ? 0 : 1;
        spin += dt * (0.12 + flow * 1.1) * motion;
        galaxyMaterial.uniforms.uSpin.value = spin;
        galaxyMaterial.uniforms.uTime.value = t * motion;
        tilt.lerp(tiltTarget.set(smoothed.x - 0.5, smoothed.y - 0.5), 1 - Math.pow(0.05, dt));
        const dist = camera.position.length();
        orbit.set(dist, 1.0 - tilt.y * 0.5 * motion, tilt.x * 0.9 * motion);
        camera.position.setFromSpherical(orbit);
        camera.lookAt(0, 0, 0);

        // Letters: tilt toward the cursor, puff up as it passes.
        letterGroup.rotation.y = tilt.x * 0.35 * motion;
        letterGroup.rotation.x = -tilt.y * 0.3 * motion;
        const px = smoothed.x * cssW;
        const py = (1 - smoothed.y) * cssH;
        for (const l of letters) {
          const near = flow > 0.05 && Math.hypot(px - l.cx, py - l.cy) < layoutSize * 0.85 ? 1 : 0;
          l.heat = Math.max(l.heat * Math.pow(0.975, dt * 60), near);
          const targetInflate = 0.55 + 0.45 * l.heat;
          // Under-damped spring so letters overshoot and wobble like balloons.
          l.inflateVel += ((targetInflate - l.inflate) * 90 - l.inflateVel * 9) * dt;
          l.inflate += l.inflateVel * dt;

          const p = l.phase;
          const swell = 1 + (l.inflate - 0.55) * 0.06;
          l.mesh.scale.set(swell, swell, Math.max(0.05, l.inflate));
          l.mesh.position.set(
            l.baseX,
            l.baseY + Math.sin(t * 1.1 + p) * layoutSize * 0.015 * motion,
            Math.sin(t * 0.8 + p) * layoutSize * 0.04 * motion,
          );
          l.mesh.rotation.set(
            Math.sin(t * 0.9 + p) * 0.08 * motion,
            Math.sin(t * 0.7 + p * 1.7) * 0.12 * motion,
            Math.sin(t * 0.6 + p * 0.6) * 0.04 * motion,
          );
        }

        if (sceneReady) {
          renderer.setRenderTarget(sceneRT);
          renderer.setClearColor(0x000000, 1);
          renderer.clear();
          renderer.render(scene, camera);
          renderer.clearDepth();
          renderer.render(letterScene, letterCamera);
          renderer.setRenderTarget(null);
        }
      } else {
        lastStamp.copy(smoothed);
      }
      finalMaterial.uniforms.uInk.value = inkVisible ? 1 : 0;

      finalMaterial.uniforms.uMask.value = simA.texture;
      finalMaterial.uniforms.uTime.value = t;
      finalMaterial.uniforms.uDark.value = dark;
      finalMaterial.uniforms.uTitleFade.value = titleFade;
      renderer.render(finalScene, quadCamera);
    };
    raf = requestAnimationFrame(tick);

    // If the GPU drops the context (driver reset, too many tabs), fall back to
    // the static title instead of leaving a blank canvas.
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      host.classList.add("hero-reveal--fallback");
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(fontTimeout);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureHero);
      io.disconnect();
      ro.disconnect();
      disposeLetters();
      letterMaterial.dispose();
      window.clearTimeout(prepareTimer);
      envTexture?.dispose();
      galaxy.geometry.dispose();
      galaxyMaterial.dispose();
      simA.dispose();
      simB.dispose();
      sceneRT.dispose();
      textTexture.dispose();
      simMaterial.dispose();
      finalMaterial.dispose();
      quad.dispose();
      timer.dispose();
      renderer.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className="hero-reveal">
      <span className="hero-reveal__fallback" aria-hidden="true">
        ECELL RVU
      </span>
      <p className="hero-reveal__credit">
        <span className="hero-reveal__credit-rule" aria-hidden="true" />
        Built by ECell Tech Team
      </p>
    </div>
  );
}
