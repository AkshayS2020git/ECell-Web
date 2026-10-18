"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  ADVECT_FRAG,
  DIVERGENCE_FRAG,
  FINAL_FRAG,
  GRADIENT_FRAG,
  PRESSURE_FRAG,
  SPLAT_FRAG,
  VERT,
} from "@/src/sections/Hero/webgl/shaders";
import { CREDIT_TEXT, drawFlatText, layoutText } from "@/src/sections/Hero/webgl/text";
import { buildLetter, type Letter } from "@/src/sections/Hero/webgl/letters";
import { GALAXY_FRAG, GALAXY_VERT, buildGalaxy } from "@/src/sections/Hero/webgl/galaxy";
import { isPageScrollLocked } from "@/src/utils/scrollLock";

// Fraction of the hero height the nebula's core is raised above centre
// (0.3 puts it ~20% from the top).
const GALAXY_SHIFT_UP = 0.3;

// Ink fluid, tuned to match noth.in's hero. Dissipation is per 60Hz frame.
//
// noth.in runs a square 256 / 512 grid over a canvas three viewports tall
// (their whole hero wrapper). To get the same ink at the same pixel scale on
// a one-viewport hero, the grids here keep their width but only a third of
// their height, and the brush and vertical force are scaled to match.
const DOMAIN_SCALE = 3;
const FLUID = {
  simWidth: 256,
  simHeight: Math.round(256 / DOMAIN_SCALE),
  dyeWidth: 512,
  dyeHeight: Math.round(512 / DOMAIN_SCALE),
  // Slows how fast the ink flows outward (1 = noth.in's speed). Fading is
  // unchanged, so slower ink also travels less far before it fades.
  timeScale: 0.35,
  velocityDissipation: 0.962,
  // Once the pointer pauses, leftover momentum dies a little sooner so the
  // ink settles instead of drifting further out.
  idleVelocityDissipation: 0.94,
  // How long after the last splat the pointer counts as paused.
  idleAfterMs: 120,
  dyeDissipation: 0.988,
  // Ink clears faster once the hero has scrolled into the card.
  scrolledDyeDissipation: 0.97,
  pressureIterations: 20,
  // Gaussian radius (squared, in hero heights).
  splatRadius: 6e-5 * DOMAIN_SCALE * DOMAIN_SCALE,
  splatForce: 5900,
  // Dye * revealSize above 0.5 is ink.
  revealSize: 3.9,
  edgeWidth: 0.01,
};
// Dye is visible once it exceeds this level.
const INK_THRESHOLD = 0.5 / FLUID.revealSize;

type DoubleTarget = {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;
  swap: () => void;
};

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
    const sceneRT = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: true, samples: coarse ? 0 : 2 });
    renderer.autoClear = false;

    // --- Ink fluid ---
    type Filter = typeof THREE.LinearFilter | typeof THREE.NearestFilter;
    const fluidTarget = (w: number, h: number, filter: Filter) =>
      new THREE.WebGLRenderTarget(w, h, { ...rtOpts, minFilter: filter, magFilter: filter });
    const doubleTarget = (w: number, h: number, filter: Filter): DoubleTarget => ({
      read: fluidTarget(w, h, filter),
      write: fluidTarget(w, h, filter),
      swap() {
        [this.read, this.write] = [this.write, this.read];
      },
    });
    const { simWidth, simHeight, dyeWidth, dyeHeight } = FLUID;
    const velocity = doubleTarget(simWidth, simHeight, THREE.LinearFilter);
    const pressure = doubleTarget(simWidth, simHeight, THREE.NearestFilter);
    const dye = doubleTarget(dyeWidth, dyeHeight, THREE.LinearFilter);
    const divergenceRT = fluidTarget(simWidth, simHeight, THREE.NearestFilter);
    const fluidTargets = [velocity.read, velocity.write, pressure.read, pressure.write, dye.read, dye.write, divergenceRT];
    const simTexel = new THREE.Vector2(1 / simWidth, 1 / simHeight);
    const dyeTexel = new THREE.Vector2(1 / dyeWidth, 1 / dyeHeight);
    renderer.setClearColor(0x000000, 1);
    for (const target of fluidTargets) {
      renderer.setRenderTarget(target);
      renderer.clear();
    }
    renderer.setRenderTarget(null);

    const passMaterial = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader, uniforms, depthTest: false, depthWrite: false });
    const splatMaterial = passMaterial(SPLAT_FRAG, {
      uTarget: { value: null },
      uAspect: { value: 1 },
      uPoint: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Vector3() },
      uRadius: { value: FLUID.splatRadius },
    });
    const advectMaterial = passMaterial(ADVECT_FRAG, {
      uVelocity: { value: null },
      uSource: { value: null },
      uTexel: { value: simTexel },
      uDt: { value: 1 },
      uDissipation: { value: 1 },
    });
    const divergenceMaterial = passMaterial(DIVERGENCE_FRAG, {
      uVelocity: { value: null },
      uTexel: { value: simTexel },
    });
    const pressureMaterial = passMaterial(PRESSURE_FRAG, {
      uPressure: { value: null },
      uDivergence: { value: divergenceRT.texture },
      uTexel: { value: simTexel },
    });
    const gradientMaterial = passMaterial(GRADIENT_FRAG, {
      uPressure: { value: null },
      uVelocity: { value: null },
      uTexel: { value: simTexel },
    });
    const fluidMaterials = [splatMaterial, advectMaterial, divergenceMaterial, pressureMaterial, gradientMaterial];
    const passMesh = new THREE.Mesh(quad, splatMaterial);
    const passScene = new THREE.Scene();
    passScene.add(passMesh);
    const renderPass = (material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget) => {
      passMesh.material = material;
      renderer.setRenderTarget(target);
      renderer.render(passScene, quadCamera);
    };
    const splat = (target: DoubleTarget, x: number, y: number, r: number, g: number, b: number) => {
      const u = splatMaterial.uniforms;
      u.uTarget.value = target.read.texture;
      u.uPoint.value.set(x, y);
      u.uColor.value.set(r, g, b);
      renderPass(splatMaterial, target.write);
      target.swap();
    };
    // One step of stable fluids: advect velocity and dye, then project the
    // velocity back to divergence-free so the ink swirls instead of spreading.
    const stepFluid = (frames: number, velocityDissipation: number, dyeDissipation: number) => {
      const a = advectMaterial.uniforms;
      a.uVelocity.value = velocity.read.texture;
      a.uSource.value = velocity.read.texture;
      a.uTexel.value = simTexel;
      a.uDt.value = frames * FLUID.timeScale;
      a.uDissipation.value = Math.pow(velocityDissipation, frames);
      renderPass(advectMaterial, velocity.write);
      velocity.swap();

      a.uVelocity.value = velocity.read.texture;
      a.uSource.value = dye.read.texture;
      a.uTexel.value = dyeTexel;
      a.uDissipation.value = dyeDissipation;
      renderPass(advectMaterial, dye.write);
      dye.swap();

      divergenceMaterial.uniforms.uVelocity.value = velocity.read.texture;
      renderPass(divergenceMaterial, divergenceRT);
      renderer.setRenderTarget(pressure.read);
      renderer.clear();
      for (let i = 0; i < FLUID.pressureIterations; i++) {
        pressureMaterial.uniforms.uPressure.value = pressure.read.texture;
        renderPass(pressureMaterial, pressure.write);
        pressure.swap();
      }
      gradientMaterial.uniforms.uPressure.value = pressure.read.texture;
      gradientMaterial.uniforms.uVelocity.value = velocity.read.texture;
      renderPass(gradientMaterial, velocity.write);
      velocity.swap();
    };

    const textCanvas = document.createElement("canvas");
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.generateMipmaps = false;

    const finalMaterial = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FINAL_FRAG,
      uniforms: {
        uText: { value: textTexture },
        uScene: { value: sceneRT.texture },
        uDye: { value: dye.read.texture },
        uRevealSize: { value: FLUID.revealSize },
        uEdge: { value: FLUID.edgeWidth },
        uDark: { value: 0 },
        uTitleFade: { value: 0 },
        uInk: { value: 1 },
      },
    });
    const finalScene = new THREE.Scene();
    finalScene.add(new THREE.Mesh(quad, finalMaterial));

    let fontFamily = getComputedStyle(host).getPropertyValue("--font-archivo").trim() || "Archivo";
    let cssW = 0;
    let cssH = 0;
    // Once the ink has fully faded there is nothing to draw, so the loop idles.
    // An upper bound on the densest dye in the fluid: advection never raises
    // the peak, so it only grows by what is splatted and decays like the dye.
    let inkLevel = 0;
    let aspect = 1;
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
          // compileAsync logs a warning where the parallel-compile extension
          // is missing (e.g. Firefox), and is synchronous there anyway.
          const parallel = renderer.extensions.has("KHR_parallel_shader_compile");
          const warm = (obj: THREE.Object3D, cam: THREE.Camera, target: THREE.Scene) =>
            parallel ? renderer.compileAsync(obj, cam, target) : Promise.resolve(renderer.compile(obj, cam, target));
          Promise.all([warm(warmMesh, letterCamera, letterScene), warm(galaxy, camera, scene)])
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
      host.classList.add("hero-reveal--ready");
      layoutSize = layout.size;
      // The credit is drawn with the title so the ink can uncover the easter egg under it.
      const creditFamily = getComputedStyle(host).getPropertyValue("--font-inter").trim() || "Inter";
      drawFlatText(textCanvas, layout, cssW, cssH, Math.min(pixelRatio, 2560 / cssW), creditFamily);
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

      aspect = w / h;
      splatMaterial.uniforms.uAspect.value = aspect;
      buildText();
    };

    // Pointer state in UV space of the canvas (accounts for the scroll scale).
    const pointer = new THREE.Vector2(-10, -10);
    const smoothed = new THREE.Vector2(-10, -10);
    const lastStamp = new THREE.Vector2(-10, -10);
    // Where the last fluid splat landed; each new splat pushes along the move.
    const lastSplat = new THREE.Vector2(-10, -10);
    let lastSplatAt = -Infinity;
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

    const movePointer = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.set((clientX - rect.left) / rect.width, 1 - (clientY - rect.top) / rect.height);
      if (!hasPointer) {
        smoothed.copy(pointer);
        lastStamp.copy(pointer);
        lastSplat.copy(pointer);
        hasPointer = true;
      }
      lastInput = performance.now();
      wanderUntil = lastInput + 1500 + WANDER_MS;
    };
    const onPointerMove = (e: PointerEvent) => movePointer(e.clientX, e.clientY);
    // A new touch starts a fresh stroke where the finger lands.
    const onPointerDown = (e: PointerEvent) => {
      movePointer(e.clientX, e.clientY);
      lastSplat.copy(pointer);
    };
    // Pointer events stop (pointercancel) once a finger starts scrolling the
    // page; touch events keep coming, so swiping through the hero still
    // drags ink on phones.
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) movePointer(touch.clientX, touch.clientY);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    // Pulling down at the top of the page would reload it (pull-to-refresh).
    // On the hero that drag pours ink instead.
    const root = document.documentElement;
    const savedOverscrollY = root.style.overscrollBehaviorY;
    if (coarse) root.style.overscrollBehaviorY = "none";

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
    let lastPaper = -1;
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
    // The title's font, and the credit's (now drawn on the canvas too).
    const creditFont = getComputedStyle(host).getPropertyValue("--font-inter").trim() || "Inter";
    document.fonts
      ?.load(`900 100px ${fontFamily}`)
      .then(() => document.fonts.load(`600 15px ${creditFont}`))
      .then(onFontsReady, onFontsReady);
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
      if (!visible || document.hidden) return;
      // Covered by the entry loader or a modal (both hold the scroll lock):
      // skip the ink and 3D work, but still draw the flat title once, so it is
      // already there as the loader's curtain lifts instead of popping in after.
      if (isPageScrollLocked()) {
        if (dirty) {
          dirty = false;
          finalMaterial.uniforms.uInk.value = 0;
          finalMaterial.uniforms.uDark.value = dark;
          finalMaterial.uniforms.uTitleFade.value = titleFade;
          renderer.setRenderTarget(null);
          renderer.render(finalScene, quadCamera);
        }
        return;
      }
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
      // Ink is splatted at the raw pointer (or the wandering blob), unsmoothed,
      // so it follows the stroke exactly; null while nothing is moving it.
      let brush: THREE.Vector2 | null = hasPointer ? pointer : null;
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
            lastSplat.copy(target);
            hasPointer = true;
          }
          brush = wander;
        } else {
          target = smoothed;
          brush = null;
        }
      }

      smoothed.lerp(target, 1 - Math.pow(0.00001, dt));
      // Smoothed pointer speed drives the nebula and letters.
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

      // The container behind the canvas must match the card colour: when the
      // card is scaled, its anti-aliased edges sample this, and a white
      // background showed up as thin white lines around the card.
      const paper = Math.round(255 + (11 - 255) * dark);
      if (paper !== lastPaper) {
        lastPaper = paper;
        host.style.backgroundColor = `rgb(${paper}, ${paper}, ${paper})`;
      }

      // As the hero scrolls into the card, new ink weakens and old ink clears
      // faster (as on noth.in).
      const scrolled = dark * dark;
      const strength = 1 - scrolled;
      // The sim moves in 60Hz frames; fading follows real time, so slow
      // devices don't keep the ink (and the 3D scene) around for longer.
      const frames = dt * 60;
      const dyeDecay = Math.pow(
        FLUID.dyeDissipation + (FLUID.scrolledDyeDissipation - FLUID.dyeDissipation) * scrolled,
        realDt * 60,
      );
      let splatDx = 0;
      let splatDy = 0;
      let dyeAmount = 0;
      if (brush) {
        splatDx = brush.x - lastSplat.x;
        splatDy = brush.y - lastSplat.y;
        // A jump (finger lifted and put down elsewhere, the wander resuming)
        // restarts the stroke instead of flinging ink across the hero.
        const jump = Math.hypot(splatDx * aspect, splatDy) > 0.3;
        if ((splatDx || splatDy) && !jump && strength > 0.001) {
          dyeAmount = strength * Math.min(frames, 2);
        }
      }

      // The fluid only runs while ink is moving or still visible; then only
      // the flat title is drawn (cheap), and nothing at all once the theme
      // has settled, so scrolling the hero stays smooth.
      const inkVisible = dyeAmount > 0 || inkLevel > INK_THRESHOLD;
      if (inkVisible) prepareScene();
      if (!inkVisible && !dirty && !themeMoving) {
        if (brush) lastSplat.copy(brush);
        lastStamp.copy(smoothed);
        return;
      }
      dirty = false;
      if (brush) lastSplat.copy(brush);

      if (inkVisible) {
        if (brush && dyeAmount > 0) {
          const force = (FLUID.splatForce * strength) / frames;
          splat(velocity, brush.x, brush.y, splatDx * force, (splatDy * force) / DOMAIN_SCALE, 0);
          splat(dye, brush.x, brush.y, dyeAmount, dyeAmount, dyeAmount);
          lastSplatAt = performance.now();
        }
        const idle = performance.now() - lastSplatAt > FLUID.idleAfterMs;
        stepFluid(frames, idle ? FLUID.idleVelocityDissipation : FLUID.velocityDissipation, dyeDecay);
        inkLevel = (inkLevel + dyeAmount) * dyeDecay;
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

      finalMaterial.uniforms.uDye.value = dye.read.texture;
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
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("touchmove", onTouchMove);
      if (coarse) root.style.overscrollBehaviorY = savedOverscrollY;
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
      for (const target of fluidTargets) target.dispose();
      for (const material of fluidMaterials) material.dispose();
      sceneRT.dispose();
      textTexture.dispose();
      finalMaterial.dispose();
      quad.dispose();
      timer.dispose();
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.dispose();
      // Release the GL context now instead of at GC: browsers cap live
      // contexts per page and drop the oldest (e.g. the WhatsApp laser) when
      // remounts pile them up.
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className="hero-reveal">
      <span className="hero-reveal__fallback" aria-hidden="true">
        ECELL RVU
      </span>
      {/* Drawn on the canvas (see drawFlatText); kept here for screen readers. */}
      <p className="hero-reveal__credit">{CREDIT_TEXT}</p>
    </div>
  );
}
