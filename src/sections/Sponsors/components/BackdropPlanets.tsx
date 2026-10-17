"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "@/src/utils/gsapSetup";

// How far each body shifts with the cursor (px at the section edge): nearer
// bodies move more, which reads as depth.
const PLANET_DEPTH = { sun: 10, ringed: 26, moon: 36, giant: 16, blackhole: 8 } as const;

/**
 * Decorative sun and planets for the backdrop, lit from the sun's side.
 *
 * Layers per body, each owning one transform so they never fight:
 * `.bg-planet` (GSAP intro/exit) > `.bg-planet__parallax` (cursor parallax)
 * > `.bg-planet__body` (hover, click spin, sun flare) > `.bg-planet__art`
 * (slow CSS drift). Hover hit-testing uses the painted shapes only.
 */
export default function BackdropPlanets(): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const bodies = Array.from(root.querySelectorAll<HTMLElement>(".bg-planet__body"));
    const sunBody = root.querySelector<HTMLElement>(".bg-planet--sun .bg-planet__body");
    const sunWave = root.querySelector<HTMLElement>(".bg-sun-wave");
    const holeBody = root.querySelector<HTMLElement>(".bg-planet--blackhole .bg-planet__body");
    const holeWave = root.querySelector<HTMLElement>(".bg-bh-wave");
    const cleanups: Array<() => void> = [];

    // Cursor parallax, eased, and only while the section is on screen.
    if (!reduceMotion && !coarse) {
      const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));
      const target = { x: 0, y: 0 };
      const current = { x: 0, y: 0 };
      let raf = 0;
      let visible = false;
      const tick = () => {
        raf = 0;
        current.x += (target.x - current.x) * 0.08;
        current.y += (target.y - current.y) * 0.08;
        for (const layer of layers) {
          const depth = Number(layer.dataset.depth);
          layer.style.transform = `translate3d(${(-current.x * depth).toFixed(2)}px, ${(-current.y * depth).toFixed(2)}px, 0)`;
        }
        if (Math.abs(target.x - current.x) > 0.0005 || Math.abs(target.y - current.y) > 0.0005) {
          raf = requestAnimationFrame(tick);
        }
      };
      const onMove = (e: PointerEvent) => {
        if (!visible) return;
        const rect = root.getBoundingClientRect();
        target.x = (e.clientX - rect.left) / rect.width - 0.5;
        target.y = (e.clientY - rect.top) / rect.height - 0.5;
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(root);
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        io.disconnect();
        cancelAnimationFrame(raf);
      });
    }

    // Click a planet: it spins once.
    const onPlanetClick = (e: Event) => {
      if (reduceMotion) return;
      gsap.to(e.currentTarget as HTMLElement, { rotation: "+=360", duration: 1.4, ease: "power3.inOut" });
    };

    // Click the sun to switch it off and on. Light takes time to travel:
    // each planet goes dark (or lights up again) only once the change
    // reaches it, nearest first. Turning it on also sends out a light wave.
    const artOf = (body: HTMLElement) => body.querySelector<SVGSVGElement>(".bg-planet__art");
    let sunOn = true;
    const onSunClick = () => {
      if (!sunBody) return;
      sunOn = !sunOn;
      const sun = sunBody.getBoundingClientRect();
      const sx = sun.left + sun.width / 2;
      const sy = sun.top + sun.height / 2;
      for (const body of bodies) {
        if (body === sunBody || body === holeBody) continue;
        const r = body.getBoundingClientRect();
        const dist = Math.hypot(r.left + r.width / 2 - sx, r.top + r.height / 2 - sy);
        const delay = reduceMotion ? 0 : dist / 900;
        body.parentElement?.style.setProperty("--light-delay", `${delay.toFixed(2)}s`);
        const art = artOf(body);
        if (sunOn && art) {
          // The flash goes on the art, not the body, so it doesn't fight the
          // body's CSS hover transition on `filter`.
          gsap.fromTo(art, { filter: "brightness(1)" }, {
            filter: "brightness(1.9) drop-shadow(0 0 16px rgba(255, 241, 214, 0.55))",
            duration: 0.35,
            delay,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
            clearProps: "filter",
          });
        }
      }
      root.classList.toggle("is-sun-off", !sunOn);
      // Relighting flares the sun itself, so it visibly glows again.
      const sunArt = artOf(sunBody);
      if (sunOn && sunArt) {
        gsap.fromTo(sunArt, { filter: "brightness(1)" }, {
          filter: "brightness(1.6) drop-shadow(0 0 24px rgba(255, 241, 214, 0.6))",
          duration: 0.45,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
          clearProps: "filter",
        });
      }
      if (sunOn && sunWave && !reduceMotion) {
        gsap.fromTo(sunWave, { scale: 0.3, opacity: 0.9 }, { scale: 26, opacity: 0, duration: 2.2, ease: "power2.out" });
      }
    };

    // Click the black hole: it swallows the sun, planets, stars and star
    // figures, nearest first, each curving in as it falls (x and y use
    // different eases). Click again and it spits them all back out.
    const field = root.parentElement;
    let devoured = false;
    let prey: Array<{ el: Element; opacity: number; twinkles: boolean }> = [];
    const onHoleClick = () => {
      const holeArt = holeBody && artOf(holeBody);
      if (!field || !holeArt) return;
      devoured = !devoured;
      root.classList.toggle("is-devouring", devoured);
      const a = holeArt.getBoundingClientRect();
      // The event horizon sits at (50%, 55%) of the black hole artwork.
      const hx = a.left + a.width * 0.5;
      const hy = a.top + a.height * 0.55;

      if (devoured) {
        prey = Array.from(
          field.querySelectorAll(".bg-planet:not(.bg-planet--blackhole), .backdrop-star, .constellation-star, .bg-constellation")
        ).map((el) => ({
          el,
          opacity: Number(gsap.getProperty(el, "opacity")) || 1,
          twinkles: el.classList.contains("backdrop-star") || el.classList.contains("constellation-star"),
        }));
        for (const p of prey) {
          // Twinkling is a CSS animation on transform/opacity, which would
          // override the tween, so it is switched off until they come back.
          if (p.twinkles) (p.el as HTMLElement).style.animation = "none";
          if (reduceMotion) {
            gsap.to(p.el, { opacity: 0, duration: 0.4, overwrite: "auto" });
            continue;
          }
          const r = p.el.getBoundingClientRect();
          const dx = hx - (r.left + r.width / 2);
          const dy = hy - (r.top + r.height / 2);
          const dist = Math.hypot(dx, dy);
          const duration = 0.9 + dist / 1400;
          const delay = dist / 2600 + Math.random() * 0.2;
          gsap.to(p.el, { x: `+=${dx}`, duration, delay, ease: "power2.in", overwrite: "auto" });
          gsap.to(p.el, { y: `+=${dy}`, duration, delay, ease: "power4.in", overwrite: "auto" });
          gsap.to(p.el, {
            scale: 0,
            rotation: `+=${dx < 0 ? -540 : 540}`,
            opacity: 0,
            duration,
            delay,
            ease: "power3.in",
            overwrite: "auto",
          });
        }
        // A satisfied gulp once most of it has gone in.
        gsap.fromTo(holeArt, { scale: 1 }, {
          scale: 1.1,
          duration: 0.35,
          delay: reduceMotion ? 0 : 1.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
          transformOrigin: "50% 55%",
        });
      } else {
        if (holeWave && !reduceMotion) {
          gsap.fromTo(holeWave, { scale: 0.3, opacity: 0.9 }, { scale: 24, opacity: 0, duration: 1.8, ease: "power2.out" });
        }
        for (const p of prey) {
          const restoreTwinkle = () => {
            if (p.twinkles) (p.el as HTMLElement).style.animation = "";
          };
          if (reduceMotion) {
            gsap.to(p.el, { opacity: p.opacity, duration: 0.4, overwrite: "auto", onComplete: restoreTwinkle });
            continue;
          }
          gsap.to(p.el, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: p.opacity,
            duration: 1.1 + Math.random() * 0.6,
            delay: Math.random() * 0.15,
            ease: "expo.out",
            overwrite: "auto",
            onComplete: restoreTwinkle,
          });
        }
        prey = [];
      }
    };

    // Leaving the section with everything swallowed quietly puts it all back,
    // so the section's intro does not later replay on bodies still bunched
    // up at the black hole.
    const restoreIo = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || !devoured) return;
      devoured = false;
      root.classList.remove("is-devouring");
      for (const p of prey) {
        gsap.killTweensOf(p.el);
        gsap.set(p.el, { x: 0, y: 0, scale: 1, rotation: 0, opacity: p.opacity });
        if (p.twinkles) (p.el as HTMLElement).style.animation = "";
      }
      prey = [];
    });
    restoreIo.observe(root);
    cleanups.push(() => restoreIo.disconnect());

    for (const body of bodies) {
      const handler = body === sunBody ? onSunClick : body === holeBody ? onHoleClick : onPlanetClick;
      body.addEventListener("click", handler);
      cleanups.push(() => body.removeEventListener("click", handler));
    }

    return () => {
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf([...bodies, ...bodies.map(artOf), sunWave, holeWave, ...prey.map((p) => p.el)].filter(Boolean));
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-planets">
      {/* Sun: the light source the planets are shaded from */}
      <div className="bg-planet bg-planet--sun">
        <div className="bg-planet__parallax" data-depth={PLANET_DEPTH.sun}>
          <span className="bg-sun-wave" />
          <div className="bg-planet__body">
            <svg className="bg-planet__art" viewBox="0 0 200 200" fill="none">
              <defs>
                {/* Cream-white, like the hero nebula's core, with a faint warm edge */}
                <radialGradient id="sp-sun-core" cx="44%" cy="40%" r="62%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#fffaf0" />
                  <stop offset="80%" stopColor="#fff1d6" />
                  <stop offset="100%" stopColor="#ecd2b0" />
                </radialGradient>
                {/* Cream glow with a whisper of ECell red at its outer edge */}
                <radialGradient id="sp-sun-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff1d6" stopOpacity="0.5" />
                  <stop offset="45%" stopColor="#fff1d6" stopOpacity="0.14" />
                  <stop offset="75%" stopColor="#ff001a" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#ff001a" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle className="bg-sun__glow" cx="100" cy="100" r="98" fill="url(#sp-sun-glow)" />
              <g className="bg-sun__rays" stroke="#fff1d6" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round">
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  const outer = i % 2 === 0 ? 64 : 54;
                  return (
                    <line
                      key={i}
                      x1={(100 + Math.cos(a) * 44).toFixed(2)}
                      y1={(100 + Math.sin(a) * 44).toFixed(2)}
                      x2={(100 + Math.cos(a) * outer).toFixed(2)}
                      y2={(100 + Math.sin(a) * outer).toFixed(2)}
                    />
                  );
                })}
              </g>
              <circle cx="100" cy="100" r="36" fill="url(#sp-sun-core)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Ringed planet: the ring passes behind the body, then in front of it */}
      <div className="bg-planet bg-planet--ringed">
        <div className="bg-planet__parallax" data-depth={PLANET_DEPTH.ringed}>
          <div className="bg-planet__body">
            <svg className="bg-planet__art" viewBox="0 0 200 140" fill="none">
              <defs>
                <radialGradient id="sp-ringed-body" cx="36%" cy="30%" r="78%">
                  <stop offset="0%" stopColor="#fff1d6" />
                  <stop offset="45%" stopColor="#b89f86" />
                  <stop offset="100%" stopColor="#1a1716" />
                </radialGradient>
                <linearGradient id="sp-ring" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f4f4f2" stopOpacity="0" />
                  <stop offset="50%" stopColor="#f4f4f2" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#f4f4f2" stopOpacity="0" />
                </linearGradient>
                <clipPath id="sp-ring-front">
                  <rect x="0" y="70" width="200" height="70" />
                </clipPath>
                <clipPath id="sp-ringed-clip">
                  <circle cx="100" cy="70" r="40" />
                </clipPath>
              </defs>
              <g transform="rotate(-16 100 70)">
                <ellipse cx="100" cy="70" rx="90" ry="19" stroke="url(#sp-ring)" strokeWidth="1.6" opacity="0.55" />
                <ellipse cx="100" cy="70" rx="76" ry="15" stroke="url(#sp-ring)" strokeWidth="0.8" opacity="0.4" />
              </g>
              <circle cx="100" cy="70" r="40" fill="url(#sp-ringed-body)" />
              <g clipPath="url(#sp-ringed-clip)" opacity="0.22">
                <ellipse cx="100" cy="56" rx="48" ry="4" fill="#fff1d6" />
                <ellipse cx="100" cy="72" rx="48" ry="2.5" fill="#1a1716" />
                <ellipse cx="100" cy="84" rx="48" ry="3.5" fill="#fff1d6" />
              </g>
              <g transform="rotate(-16 100 70)" clipPath="url(#sp-ring-front)">
                <ellipse cx="100" cy="70" rx="90" ry="19" stroke="url(#sp-ring)" strokeWidth="2" />
                <ellipse cx="100" cy="70" rx="76" ry="15" stroke="url(#sp-ring)" strokeWidth="1" opacity="0.7" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Small cratered moon, lit from the sun at its upper right */}
      <div className="bg-planet bg-planet--moon">
        <div className="bg-planet__parallax" data-depth={PLANET_DEPTH.moon}>
          <div className="bg-planet__body">
            <svg className="bg-planet__art" viewBox="0 0 60 60" fill="none">
              <defs>
                <radialGradient id="sp-moon" cx="64%" cy="30%" r="80%">
                  <stop offset="0%" stopColor="#f4f4f2" />
                  <stop offset="55%" stopColor="#8a8a8e" />
                  <stop offset="100%" stopColor="#151517" />
                </radialGradient>
              </defs>
              <circle cx="30" cy="30" r="24" fill="url(#sp-moon)" />
              <g fill="#151517" opacity="0.28">
                <circle cx="24" cy="24" r="4" />
                <circle cx="36" cy="36" r="5.5" />
                <circle cx="37" cy="19" r="2.2" />
                <circle cx="20" cy="38" r="2" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Black hole half off the right edge, low down: event horizon with a thin photon
          ring, an accretion disk whose far side passes behind it, and light
          bent over the top. Click to feed it; click again to make it spit. */}
      <div className="bg-planet bg-planet--blackhole">
        <div className="bg-planet__parallax" data-depth={PLANET_DEPTH.blackhole}>
          <span className="bg-bh-wave" />
          <div className="bg-planet__body">
            <svg className="bg-planet__art" viewBox="0 0 300 200" fill="none">
              <defs>
                <radialGradient id="sp-bh-glow" cx="50%" cy="55%" r="50%">
                  <stop offset="0%" stopColor="#fff1d6" stopOpacity="0.22" />
                  <stop offset="50%" stopColor="#fff1d6" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#fff1d6" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="sp-bh-disk" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ecd2b0" stopOpacity="0" />
                  <stop offset="22%" stopColor="#ecd2b0" stopOpacity="0.5" />
                  <stop offset="50%" stopColor="#fffaf0" stopOpacity="0.95" />
                  <stop offset="78%" stopColor="#ecd2b0" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ecd2b0" stopOpacity="0" />
                </linearGradient>
                <clipPath id="sp-bh-back">
                  <rect x="0" y="0" width="300" height="110" />
                </clipPath>
                <clipPath id="sp-bh-front">
                  <rect x="0" y="110" width="300" height="90" />
                </clipPath>
              </defs>
              {/* Tilted like the ringed planet; the clips rotate with it */}
              <g transform="rotate(-18 150 110)">
                <ellipse cx="150" cy="110" rx="150" ry="95" fill="url(#sp-bh-glow)" />
                <ellipse className="bg-bh__disk" cx="150" cy="110" rx="128" ry="22" stroke="url(#sp-bh-disk)" strokeWidth="7" opacity="0.6" clipPath="url(#sp-bh-back)" />
                <circle cx="150" cy="110" r="57" stroke="url(#sp-bh-disk)" strokeWidth="3" opacity="0.65" clipPath="url(#sp-bh-back)" />
                <circle cx="150" cy="110" r="46" fill="#000000" stroke="#fff1d6" strokeOpacity="0.55" strokeWidth="1.2" />
                <ellipse className="bg-bh__disk" cx="150" cy="110" rx="128" ry="22" stroke="url(#sp-bh-disk)" strokeWidth="9" clipPath="url(#sp-bh-front)" />
                <ellipse cx="150" cy="110" rx="100" ry="15" stroke="#fffaf0" strokeOpacity="0.3" strokeWidth="1" clipPath="url(#sp-bh-front)" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Large dim planet half off the left edge, with a thin atmosphere */}
      <div className="bg-planet bg-planet--giant">
        <div className="bg-planet__parallax" data-depth={PLANET_DEPTH.giant}>
          <div className="bg-planet__body">
            <svg className="bg-planet__art" viewBox="0 0 200 200" fill="none">
              <defs>
                <radialGradient id="sp-giant" cx="62%" cy="34%" r="80%">
                  <stop offset="0%" stopColor="#7d8cff" />
                  <stop offset="40%" stopColor="#2f45ff" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#07081a" />
                </radialGradient>
                <clipPath id="sp-giant-clip">
                  <circle cx="100" cy="100" r="80" />
                </clipPath>
              </defs>
              <circle cx="100" cy="100" r="86" stroke="#7d8cff" strokeOpacity="0.18" strokeWidth="6" />
              <circle cx="100" cy="100" r="80" fill="url(#sp-giant)" />
              <g clipPath="url(#sp-giant-clip)" opacity="0.16">
                <path d="M10 78 C 60 70, 140 92, 190 80" stroke="#c9d0ff" strokeWidth="5" />
                <path d="M10 112 C 70 104, 130 124, 190 110" stroke="#c9d0ff" strokeWidth="3" />
                <path d="M10 140 C 60 134, 140 150, 190 138" stroke="#c9d0ff" strokeWidth="4" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
