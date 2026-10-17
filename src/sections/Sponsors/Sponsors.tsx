"use client";
import React, { useState, useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { gsap } from "../../utils/gsapSetup";
import attysLogo from "../../assets/logos/attys.webp";
import runanywhereLogo from "../../assets/logos/runanywhere.webp";
import easyBitesLogo from "../../assets/logos/easybites.webp";
import herodyLogo from "../../assets/logos/herody.webp";
import justvendLogo from "../../assets/logos/justvend.webp";
import mercLogo from "../../assets/logos/merc.webp";
import mileLogo from "../../assets/logos/mile.webp";
import nokiaLogo from "../../assets/logos/nokia.webp";
import tvsLogo from "../../assets/logos/tvs.webp";
import waffleLogo from "../../assets/logos/waffle.svg";
import redbull from "../../assets/logos/redbull.webp";
import arkLogo from "../../assets/logos/ARK LOGO-01 .webp";
import fitMuscleLogo from "../../assets/logos/fit-muscle.webp";
import fiveSpeedLogo from "../../assets/logos/fivespeed bike rental.webp";
import hoogwayLogo from "../../assets/logos/hoogway.webp";
import hpLogo from "../../assets/logos/hp.webp";
import ixigoLogo from "../../assets/logos/ixigo.webp";
import mahindraLogo from "../../assets/logos/mahindra.webp";
import studio11Logo from "../../assets/logos/studio 11.svg";
import tazishLogo from "../../assets/logos/tazish.webp";
import technosportLogo from "../../assets/logos/technosport.webp";
import ccLogo from "../../assets/logos/codechief.webp";
import wafflingStationLogo from "../../assets/logos/waffling station.webp";
import "./Sponsors.css";

export interface SponsorItem {
  id: string;
  name: string;
  logo: StaticImageData | string;
  logoKey?: string;
  tier?: "featured" | "core";
  row: number;
  url?: string;
}

const SPONSORS_CONSTELLATION: SponsorItem[] = [
  // Row 1: 3 items (North Pioneers)
  { id: "node-nokia", name: "Nokia", logo: nokiaLogo, logoKey: "nokia", tier: "featured", row: 1, url: "https://www.nokia.com/" },
  { id: "node-redbull", name: "Red Bull", logo: redbull, tier: "featured", row: 1, url: "https://www.redbull.com/" },
  { id: "node-hoogway", name: "Hoogway", logo: hoogwayLogo, tier: "core", row: 1, url:"https://hoogway.ai/" },

  // Row 2: 5 items (Mid-North Anchors)
  { id: "node-waffle", name: "The Belgian Waffle Co.", logo: waffleLogo, tier: "core", row: 2, url: "https://thebelgianwaffle.co/" },
  { id: "node-tvs", name: "TVS Prakruthi Bikes", logo: tvsLogo, tier: "core", row: 2, url: "https://tvsmotor.com" },
  { id: "node-herody", name: "Herody", logo: herodyLogo, logoKey: "herody", tier: "featured", row: 2, url: "https://herody.in" },
  { id: "node-merc", name: "Akshaya Motors", logo: mercLogo, tier: "featured", row: 2, url: "https://www.mercedes-benz.co.in/" },
  { id: "node-waffling-station", name: "Waffling Station", logo: wafflingStationLogo, tier: "core", row: 2, url:"https://www.instagram.com/thewafflingstation" },

  // Row 3: 3 items (Mid-South Growth Network)
  { id: "node-attys", name: "Atty's Bakery & Confectionery", logo: attysLogo, tier: "core", row: 3, url: "https://attysbakery.dotpe.in/" },
  { id: "node-cube", name: "Runanywhere", logo: runanywhereLogo, tier: "core", row: 3,url:"https://www.runanywhere.ai/" },
  { id: "node-justvend", name: "Justvend", logo: justvendLogo, tier: "core", row: 3, url: "https://www.justvend.in" },

  // Row 4: 2 items (South Base Connectors)
  { id: "node-easybites", name: "EasyBites", logo: easyBitesLogo, tier: "core", row: 4, url: "https://easybites.in/" },
  { id: "node-mile", name: "mile", logo: mileLogo, tier: "core", row: 4, url: "https://www.mile.tech/" },

  // Additional partner logos — add each respective URL here when available.
  { id: "node-fit-muscle", name: "Fit Muscle", logo: fitMuscleLogo, tier: "core", row: 3, url: "https://www.fitmusclepremiumfitness.store/" },
  { id: "node-ark", name: "ARK", logo: arkLogo, tier: "core", row: 4, url:"https://www.arkinfo.in/" },
  { id: "node-fivespeed", name: "FiveSpeed Bike Rental", logo: fiveSpeedLogo, tier: "core", row: 5, url: "https://fivespeedbike.com/" },
  { id: "node-hp", name: "HP", logo: hpLogo, tier: "core", row: 5, url: "https://www.hp.com/in-en/home.html" },
  { id: "node-ixigo", name: "ixigo", logo: ixigoLogo, tier: "core", row: 5, url: "https://www.ixigo.com/" },
  { id: "node-mahindra", name: "Mahindra", logo: mahindraLogo, tier: "core", row: 5, url: "https://www.mahindra.com/" },
  { id: "node-studio-11", name: "Studio 11", logo: studio11Logo, tier: "core", row: 5, url: "https://www.studio11.in/" },
  { id: "node-tazish", name: "Tazish", logo: tazishLogo, tier: "core", row: 5,url:"https://www.instagram.com/tazishpoket" },
  { id: "node-technosport", name: "Technosport", logo: technosportLogo, tier: "core", row: 5, url:"https://www.technosport.in/" },
  { id: "codechief",name :"codechief",logo: ccLogo, tier:"core", row: 5, url:"https://www.codechef.com/" }
];

const SPONSOR_ROWS = [
  SPONSORS_CONSTELLATION.slice(0, 3),
  SPONSORS_CONSTELLATION.slice(3, 8),
  SPONSORS_CONSTELLATION.slice(8, 15),
  SPONSORS_CONSTELLATION.slice(15, 20),
  SPONSORS_CONSTELLATION.slice(20, 23),
];

// Deterministic so the server and client render the same backdrop.
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(20260611);
// Extra twinkling stars layered on top of the six hand-placed ones.
const BACKDROP_STARS = Array.from({ length: 56 }, () => ({
  top: (rand() * 100).toFixed(2),
  left: (rand() * 100).toFixed(2),
  size: (1 + rand() * 1.8).toFixed(2),
  delay: (rand() * 5).toFixed(2),
  duration: (3 + rand() * 4).toFixed(2),
  dim: rand() < 0.45,
}));

// Small star figures drawn faintly in the margins (points in a 100 x 70 box).
const BACKDROP_CONSTELLATIONS: Array<{
  id: string;
  points: Array<[number, number]>;
  edges: Array<[number, number]>;
}> = [
  { id: "ml", points: [[14, 10], [22, 34], [12, 58], [46, 46], [70, 62]], edges: [[0, 1], [1, 2], [1, 3], [3, 4]] },
  { id: "mr", points: [[20, 56], [38, 36], [62, 40], [80, 16], [90, 52]], edges: [[0, 1], [1, 2], [2, 3], [2, 4]] },
];

// "ECELL" and "RVU" spelled in stars across the top margins, one word on each
// side of the header. Points sit in a box 31 high and 20 wide per letter, so
// both words share one letter size. Corners are nudged off-grid so they read
// as constellations, not a font; the first star of each letter is the bright
// one. Letters trace in reading order, ECELL then RVU.
type WordmarkLetter = {
  points: Array<[number, number]>;
  edges: Array<[number, number]>;
};

const WORDMARKS: Array<{ id: string; width: number; letters: WordmarkLetter[] }> = [
  {
    id: "ecell",
    width: 100,
    letters: [
      // E
      { points: [[2.5, 4], [14, 4.6], [2, 15], [11, 15.6], [2.6, 26], [14.4, 25.4]], edges: [[1, 0], [0, 2], [2, 3], [2, 4], [4, 5]] },
      // C
      { points: [[35, 6.4], [27, 4], [23, 10.6], [23.2, 19.6], [27.2, 26], [35.4, 24]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
      // E
      { points: [[44, 4.2], [56.4, 5], [44.4, 15.4], [52.6, 15], [44, 26.4], [56, 26]], edges: [[1, 0], [0, 2], [2, 3], [2, 4], [4, 5]] },
      // L
      { points: [[65.4, 4], [65, 26], [76, 25.6]], edges: [[0, 1], [1, 2]] },
      // L
      { points: [[84.4, 4.4], [84, 26.2], [95.6, 26.6]], edges: [[0, 1], [1, 2]] },
    ],
  },
  {
    id: "rvu",
    width: 60,
    letters: [
      // R
      { points: [[2.4, 4], [11, 4.6], [14.2, 9.6], [11.2, 14.8], [2, 15], [2.6, 26], [14.4, 26]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4], [4, 5], [3, 6]] },
      // V
      { points: [[23, 4.4], [26.2, 15.4], [29.2, 26], [32.4, 15], [35.4, 4]], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
      // U
      { points: [[44.2, 4], [44, 19], [47.6, 26], [52.8, 26.2], [56.4, 19.4], [56, 4.4]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
    ],
  },
];

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
function BackdropPlanets(): React.ReactElement {
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

export default function Sponsors(): React.ReactElement {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const sponsorsSectionRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const constellationRef = useRef<HTMLDivElement | null>(null);
  const wipeBarRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isConnected = (...nodes: string[]) => {
    if (!hoveredNode) return false;
    return nodes.includes(hoveredNode);
  };

  // Decorative CSS loops (twinkling stars, planet drift, sun rays) pause
  // whenever the section is off screen, so they cost nothing elsewhere.
  useEffect(() => {
    const section = sponsorsSectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-offscreen", !entry.isIntersecting),
      { rootMargin: "100px 0px" }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const section = sponsorsSectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      if (headerRef.current) gsap.set(headerRef.current, { opacity: 1, y: 0 });
      if (constellationRef.current) gsap.set(constellationRef.current, { opacity: 1, y: 0 });
      if (glowRef.current) gsap.set(glowRef.current, { opacity: 0.35, scale: 1 });
      return;
    }

const wipeCtx = gsap.context(() => {
      // ── Luminous Wipe Bar Sweep (Scroll Scrub) ──
      if (wipeBarRef.current) {
        gsap.fromTo(
          wipeBarRef.current,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              end: "top 55%",
              scrub: 0.5,
            },
          }
        );
        gsap.to(wipeBarRef.current, {
          opacity: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 50%",
            end: "top 30%",
            scrub: 0.5,
          },
        });
      }
    }, section);

    const headerCtx = gsap.context(() => {
      // ── Kinetic Typography: Partners slides from left, & stays center, Sponsors from right ──
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 88%",
          end: "top 35%",
          scrub: 0.8,
        },
      });

      // Badge enters from top
      headerTl.fromTo(
        ".sponsors-badge-container",
        { y: -20, opacity: 0, scale: 0.92, filter: "blur(6px)" },
        { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", ease: "power3.out" },
        0
      );

      // "Partners" slides in with momentum from the left
      headerTl.fromTo(
        ".sponsors-word-left",
        { x: -110, opacity: 0, filter: "blur(10px)", letterSpacing: "0.08em" },
        { x: 0, opacity: 1, filter: "blur(0px)", letterSpacing: "-0.03em", ease: "power3.out" },
        0.05
      );

      // "&" stays anchored in center, scaling from a luminous focal spark
      headerTl.fromTo(
        ".sponsors-headline-amp",
        { scale: 0, opacity: 0, filter: "blur(8px)" },
        { scale: 1, opacity: 0.65, filter: "blur(0px)", ease: "back.out(2.2)" },
        0.1
      );

      // "Sponsors" slides in with momentum from the right
      headerTl.fromTo(
        ".sponsors-word-right",
        { x: 110, opacity: 0, filter: "blur(10px)", letterSpacing: "0.08em" },
        { x: 0, opacity: 1, filter: "blur(0px)", letterSpacing: "-0.03em", ease: "power3.out" },
        0.05
      );

      // Subtitle unmasks as the headline locks together
      headerTl.fromTo(
        ".sponsors-intro",
        { y: 22, opacity: 0, filter: "blur(6px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", ease: "power3.out" },
        0.2
      );
    }, section);

    const glowCtx = gsap.context(() => {
      // ── Ambient Radial Glow Expansion ──
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.3, opacity: 0 },
          {
            scale: 1.25,
            opacity: 0.4,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 92%",
              end: "top 20%",
              scrub: 0.8,
            },
          }
        );
      }
    }, section);

    const storyCtx = gsap.context(() => {
      // ══════════════════════════════════════════════════════════════
      // ── AWWWARDS STORYTELLING TIMELINE: NODES → PATHS → CARDS → LOGOS ──
      // ══════════════════════════════════════════════════════════════
      const storyTl = gsap.timeline({
        scrollTrigger: {
          trigger: constellationRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });

      // Prepare SVG path lengths for clean line-drawing
      const pathElements = gsap.utils.toArray<SVGPathElement>(".constellation-line-path");
      pathElements.forEach((path) => {
        const length = path.getTotalLength ? path.getTotalLength() : 300;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0,
        });
      });

      // ── PHASE 1: NODES (Seed Origin & Constellation Ignition) ──
      // 1.1 Origin seed beacon dots ignite with scale bounce & shockwave ripple
      const anchorNodes = gsap.utils.toArray<SVGElement>(".constellation-anchor-node");
      const junctionDots = gsap.utils.toArray<SVGElement>(".constellation-junction-dot");
      const pingRings = gsap.utils.toArray<SVGElement>(".node-ping-ring");
      const stars = gsap.utils.toArray<HTMLElement>(".constellation-star");

      // Stars in backdrop awaken
      if (stars.length > 0) {
        storyTl.fromTo(
          stars,
          { opacity: 0, scale: 0 },
          { opacity: 0.7, scale: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" },
          0
        );
      }

      // Extra backdrop stars fade up, and the faint margin constellations
      // trace themselves in, behind the main network
      const backdropStars = gsap.utils.toArray<HTMLElement>(".backdrop-star");
      if (backdropStars.length > 0) {
        storyTl.fromTo(
          backdropStars,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: { amount: 0.8, from: "random" }, ease: "power2.out" },
          0
        );
      }

      const planets = gsap.utils.toArray<HTMLElement>(".bg-planet");
      if (planets.length > 0) {
        storyTl.fromTo(
          planets,
          { opacity: 0, y: 24, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.15, ease: "power3.out" },
          0
        );
      }

      const backdropLines = gsap.utils.toArray<SVGPathElement>(".bg-constellation-line");
      backdropLines.forEach((path) => {
        const length = path.getTotalLength ? path.getTotalLength() : 40;
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      const backdropFigureStars = gsap.utils.toArray<SVGElement>(".bg-constellation-star");
      if (backdropFigureStars.length > 0) {
        storyTl.fromTo(
          backdropFigureStars,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.4, stagger: { amount: 0.6, from: "random" }, ease: "back.out(2)" },
          0.05
        );
      }
      if (backdropLines.length > 0) {
        storyTl.to(
          backdropLines,
          { strokeDashoffset: 0, duration: 0.6, stagger: { amount: 0.9 }, ease: "power2.inOut" },
          0.2
        );
      }

      // The ECELL RVU wordmark spells itself out: each letter's stars light up,
      // then its strokes trace, before the next letter begins.
      gsap.utils.toArray<SVGGElement>(".bg-wordmark-letter").forEach((letter, i) => {
        const at = 0.15 + i * 0.28;
        const letterStars = letter.querySelectorAll<SVGCircleElement>(".bg-wordmark-star");
        const letterLines = Array.from(letter.querySelectorAll<SVGPathElement>(".bg-wordmark-line"));
        letterLines.forEach((path) => {
          const length = path.getTotalLength ? path.getTotalLength() : 20;
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        });
        storyTl.fromTo(
          letterStars,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.3, stagger: 0.04, ease: "back.out(2)" },
          at
        );
        storyTl.to(
          letterLines,
          { strokeDashoffset: 0, duration: 0.22, stagger: 0.07, ease: "power1.inOut" },
          at + 0.08
        );
      });

      // Top anchor nodes & central hub ignite first
      if (anchorNodes.length > 0) {
        storyTl.fromTo(
          anchorNodes,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 0.9,
            duration: 0.45,
            stagger: {
              each: 0.05,
              from: "start",
            },
            ease: "back.out(2.4)",
          },
          0.05
        );
      }

      // Radar ping rings expand out from origin nodes
      if (pingRings.length > 0) {
        storyTl.fromTo(
          pingRings,
          { r: 2, opacity: 0.9, strokeWidth: 1.5 },
          {
            r: 18,
            opacity: 0,
            strokeWidth: 0.2,
            duration: 0.7,
            stagger: 0.06,
            ease: "power2.out",
          },
          0.1
        );
      }

      // Junction points appear
      if (junctionDots.length > 0) {
        storyTl.fromTo(
          junctionDots,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 0.65,
            duration: 0.35,
            stagger: 0.04,
            ease: "back.out(2)",
          },
          0.2
        );
      }

      // ── PHASE 2: PATHS (Vector Circuit Propagation) ──
      // The paths draw in organized cascading waves down the network tree
      const branchTier1 = gsap.utils.toArray<SVGPathElement>(".path-tier-1");
      const branchTier2 = gsap.utils.toArray<SVGPathElement>(".path-tier-2");
      const branchTier3 = gsap.utils.toArray<SVGPathElement>(".path-tier-3");
      const branchTier4 = gsap.utils.toArray<SVGPathElement>(".path-tier-4");

      // Tier 1 branches (North anchors down/up: Nokia->Waffle, Herody->RedBull)
      if (branchTier1.length > 0) {
        storyTl.to(
          branchTier1,
          {
            strokeDashoffset: 0,
            opacity: 0.45,
            duration: 0.55,
            stagger: 0.08,
            ease: "power2.inOut",
          },
          0.3
        );
      }

      // Tier 2 branches (Horizontal bridge: Waffle->TVS, Herody->Mercedes)
      if (branchTier2.length > 0) {
        storyTl.to(
          branchTier2,
          {
            strokeDashoffset: 0,
            opacity: 0.45,
            duration: 0.4,
            stagger: 0.06,
            ease: "power2.inOut",
          },
          0.5
        );
      }

      // Tier 3 branches (Mid down to Core: TVS->Attys, Herody->Cube, Merc->Justvend)
      if (branchTier3.length > 0) {
        storyTl.to(
          branchTier3,
          {
            strokeDashoffset: 0,
            opacity: 0.45,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.inOut",
          },
          0.68
        );
      }

      // Tier 4 branches (Core down to Base: Attys->EasyBites, Justvend->Mile)
      if (branchTier4.length > 0) {
        storyTl.to(
          branchTier4,
          {
            strokeDashoffset: 0,
            opacity: 0.45,
            duration: 0.45,
            stagger: 0.06,
            ease: "power2.inOut",
          },
          0.88
        );
      }

      // ── PHASE 3: CARDS (Materializing Along The Network) ──
      // Once paths illuminate, cards blossom into existence row by row
      const row1Cards = gsap.utils.toArray<HTMLElement>(".row-1 .sponsor-card-inner");
      const row2Cards = gsap.utils.toArray<HTMLElement>(".row-2 .sponsor-card-inner");
      const row3Cards = gsap.utils.toArray<HTMLElement>(".row-3 .sponsor-card-inner");
      const row4Cards = gsap.utils.toArray<HTMLElement>(".row-4 .sponsor-card-inner");
      const row5Cards = gsap.utils.toArray<HTMLElement>(".row-5 .sponsor-card-inner");

      // Row 1 Cards (Pioneers) materialize
      if (row1Cards.length > 0) {
        storyTl.fromTo(
          row1Cards,
          {
            opacity: 0,
            scale: 0.84,
            y: 18,
            filter: "blur(8px)",
            borderColor: "rgba(255, 255, 255, 0.45)",
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            borderColor: "rgba(244, 244, 242, 0.16)",
            duration: 0.55,
            stagger: 0.08,
            ease: "power3.out",
          },
          0.55
        );
      }

      // Row 2 Cards materialize
      if (row2Cards.length > 0) {
        storyTl.fromTo(
          row2Cards,
          {
            opacity: 0,
            scale: 0.86,
            y: 16,
            filter: "blur(6px)",
            borderColor: "rgba(255, 255, 255, 0.4)",
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            borderColor: "rgba(244, 244, 242, 0.12)",
            duration: 0.5,
            stagger: 0.06,
            ease: "power3.out",
          },
          0.8
        );
      }

      // Row 3 Cards materialize
      if (row3Cards.length > 0) {
        storyTl.fromTo(
          row3Cards,
          {
            opacity: 0,
            scale: 0.88,
            y: 14,
            filter: "blur(6px)",
            borderColor: "rgba(255, 255, 255, 0.35)",
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            borderColor: "rgba(244, 244, 242, 0.12)",
            duration: 0.45,
            stagger: 0.06,
            ease: "power3.out",
          },
          1.05
        );
      }

      // Row 4 Cards materialize
      if (row4Cards.length > 0) {
        storyTl.fromTo(
          row4Cards,
          {
            opacity: 0,
            scale: 0.88,
            y: 12,
            filter: "blur(6px)",
            borderColor: "rgba(255, 255, 255, 0.35)",
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            borderColor: "rgba(244, 244, 242, 0.12)",
            duration: 0.45,
            stagger: 0.06,
            ease: "power3.out",
          },
          1.25
        );
      }

      if (row5Cards.length > 0) {
        storyTl.fromTo(
          row5Cards,
          { opacity: 0, scale: 0.88, y: 12, filter: "blur(6px)" },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.45,
            stagger: 0.06,
            ease: "power3.out",
          },
          1.45
        );
      }

      // ══════════════════════════════════════════════════════════════
      // ── PHASE 4: LOGOS (Living Signal Lock-In) ──
      // Logos surge with exposure/contrast before settling into crisp clarity
      const logos = gsap.utils.toArray<HTMLElement>(".sponsor-logo");
      if (logos.length > 0) {
        storyTl.fromTo(
          logos,
          {
            opacity: 0,
            filter: "brightness(2) contrast(1.2)",
            scale: 0.94,
          },
          {
            opacity: 1,
            filter: "brightness(1) contrast(1.02)",
            scale: 1,
            duration: 0.5,
            stagger: 0.04,
            ease: "power2.out",
          },
          0.9
        );
      }
    }, section);

    const exitCtx = gsap.context(() => {
      // ═══════════════════════════════════════════════════════════════
      // ── MORPHIC TRANSITION: ONLY FIRES ON SECTION EXIT ──
      // ══════════════════════════════════════════════════════════════
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "bottom 85%",
          end: "bottom 10%",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      // 1. Left and right cards collapse towards center axis with blur & scale down
      exitTl.to(
        ".constellation-col:nth-child(odd)",
        {
          x: 140,
          scale: 0.2,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.5,
          ease: "power2.in",
        },
        0
      );

      exitTl.to(
        ".constellation-col:nth-child(even)",
        {
          x: -140,
          scale: 0.2,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.5,
          ease: "power2.in",
        },
        0
      );

      // 2. Nodes and dots implode to center
      exitTl.to(
        ".constellation-anchor-node, .constellation-junction-dot, .node-ping-ring, .constellation-star, .backdrop-star, .bg-constellation, .bg-planet:not(.bg-planet--blackhole)",
        {
          scale: 0,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
        },
        0
      );

      // 3. Constellation network lines stretch and collapse into center vertical conduit
      exitTl.to(
        ".constellation-line-path",
        {
          scaleX: 0.02,
          transformOrigin: "50% 50%",
          opacity: 0.7,
          duration: 0.45,
          ease: "power2.inOut",
        },
        0.05
      );

      // 4. Central vertical spine ignites and shoots down rapidly into bottom boundary
      exitTl.fromTo(
        ".morphic-central-spine",
        { scaleY: 0, opacity: 0 },
        {
          scaleY: 1,
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
          transformOrigin: "top center",
        },
        0.05
      );

      // 5. The spine strikes the bottom and immediately erupts horizontally into the horizon divider
      exitTl.fromTo(
        ".morphic-horizon-divider",
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          transformOrigin: "center center",
        },
        0.25
      );
    }, section);

    return () => {
      wipeCtx.revert();
      headerCtx.revert();
      glowCtx.revert();
      storyCtx.revert();
      exitCtx.revert();
    };
  }, []);

  return (
    <section ref={sponsorsSectionRef} className="sponsors-section" id="sponsors">
      {/* Constellation Emergence transition elements */}
      <div ref={wipeBarRef} className="section-wipe-bar" aria-hidden="true" />
      <div ref={glowRef} className="sponsors-glow" />
      <div className="sponsors-divider-line" />

      {/* Morphic Conduit Spine & Horizon Divider */}
      <div className="morphic-central-spine" aria-hidden="true" />
      <div className="morphic-horizon-divider" aria-hidden="true" />

      {/* Constellation Backdrop Star Field */}
      <div className="constellation-star-field" aria-hidden="true">
        <span className="constellation-star star-1" />
        <span className="constellation-star star-2" />
        <span className="constellation-star star-3" />
        <span className="constellation-star star-4" />
        <span className="constellation-star star-5" />
        <span className="constellation-star star-6" />
        {BACKDROP_STARS.map((star, i) => (
          <span
            key={i}
            className={`backdrop-star${star.dim ? " is-dim" : ""}`}
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
        <BackdropPlanets />
        {BACKDROP_CONSTELLATIONS.map((figure) => (
          <svg
            key={figure.id}
            className={`bg-constellation bg-constellation--${figure.id}`}
            viewBox="0 0 100 70"
            fill="none"
          >
            {figure.edges.map(([from, to]) => (
              <path
                key={`${from}-${to}`}
                className="bg-constellation-line"
                d={`M ${figure.points[from][0]} ${figure.points[from][1]} L ${figure.points[to][0]} ${figure.points[to][1]}`}
              />
            ))}
            {figure.points.map(([cx, cy], i) => (
              <circle key={i} className="bg-constellation-star" cx={cx} cy={cy} r={i === 0 ? 1.6 : 1.1} />
            ))}
          </svg>
        ))}
        {WORDMARKS.map((word) => (
          <svg
            key={word.id}
            className={`bg-constellation bg-wordmark bg-wordmark--${word.id}`}
            viewBox={`0 0 ${word.width} 31`}
            fill="none"
          >
            {word.letters.map((letter, li) => (
              <g key={li} className="bg-wordmark-letter">
                {letter.edges.map(([from, to]) => (
                  <path
                    key={`${from}-${to}`}
                    className="bg-wordmark-line"
                    d={`M ${letter.points[from][0]} ${letter.points[from][1]} L ${letter.points[to][0]} ${letter.points[to][1]}`}
                  />
                ))}
                {letter.points.map(([cx, cy], i) => (
                  <circle key={i} className="bg-wordmark-star" cx={cx} cy={cy} r={i === 0 ? 0.95 : 0.65} />
                ))}
              </g>
            ))}
          </svg>
        ))}
      </div>

      <div ref={headerRef} className="wrap sponsors-header">
        <div className="sponsors-badge-container">
          <span className="sponsors-kicker">SUPPORTED BY</span>
        </div>
        <h2 className="sponsors-headline" aria-label="Partners &amp; Sponsors">
          <span className="sponsors-headline-word sponsors-word-left">Partners</span>
          <span className="sponsors-headline-amp" aria-hidden="true">&amp;</span>
          <span className="sponsors-headline-word sponsors-word-right">Sponsors</span>
        </h2>
        <p className="sponsors-intro">
          The organisations helping us turn ideas into action.
        </p>
      </div>

      <div ref={constellationRef} className="wrap constellation-container">
        {/* Constellation Vector Network mapped across the grid */}
        <svg
          ref={svgRef}
          className="constellation-svg"
          viewBox="0 0 1000 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(244, 244, 242, 0.06)" />
              <stop offset="50%" stopColor="rgba(244, 244, 242, 0.35)" />
              <stop offset="100%" stopColor="rgba(244, 244, 242, 0.06)" />
            </linearGradient>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── PATH TIER 1: North connections ── */}
          {/* Nokia down to Belgian Waffle */}
          <path
            d="M 290 115 V 160 H 190"
            className={`constellation-line-path path-tier-1${isConnected("node-nokia", "node-waffle") ? " is-active" : ""}`}
          />

          {/* Center Hub (Herody) up to Red Bull */}
          <path
            d="M 625 185 V 70 H 685"
            className={`constellation-line-path path-tier-1${isConnected("node-herody", "node-redbull") ? " is-active" : ""}`}
          />

          {/* ── PATH TIER 2: Mid-North horizontal bridges ── */}
          {/* Belgian Waffle to TVS */}
          <path
            d="M 230 205 H 280"
            className={`constellation-line-path path-tier-2${isConnected("node-waffle", "node-tvs") ? " is-active" : ""}`}
          />

          {/* Herody to Mercedes */}
          <path
            d="M 720 205 H 770"
            className={`constellation-line-path path-tier-2${isConnected("node-herody", "node-merc") ? " is-active" : ""}`}
          />

          {/* ── PATH TIER 3: Mid-North down to Growth tier ── */}
          {/* TVS down to Atty's */}
          <path
            d="M 375 240 V 325 H 330"
            className={`constellation-line-path path-tier-3${isConnected("node-tvs", "node-attys") ? " is-active" : ""}`}
          />

          {/* Herody down to Cube */}
          <path
            d="M 625 240 V 325 H 580"
            className={`constellation-line-path path-tier-3${isConnected("node-herody", "node-cube") ? " is-active" : ""}`}
          />

          {/* Mercedes down to Justvend */}
          <path
            d="M 870 240 V 325 H 825"
            className={`constellation-line-path path-tier-3${isConnected("node-merc", "node-justvend") ? " is-active" : ""}`}
          />

          {/* ── PATH TIER 4: Growth down to Base anchors ── */}
          {/* Justvend down to Mile */}
          <path
            d="M 765 365 V 450 H 695"
            className={`constellation-line-path path-tier-4${isConnected("node-justvend", "node-mile") ? " is-active" : ""}`}
          />

          {/* Atty's down to EasyBites */}
          <path
            d="M 235 365 V 450 H 305"
            className={`constellation-line-path path-tier-4${isConnected("node-attys", "node-easybites") ? " is-active" : ""}`}
          />

          {/* ── SPONSOR ANCHOR NODES (Where cards dock) ── */}
          <g className="anchor-nodes-group">
            {/* Nokia Anchor */}
            <circle cx="290" cy="115" r="3" className="constellation-anchor-node" />
            <circle cx="290" cy="115" r="2" className="node-ping-ring" />

            {/* Red Bull Anchor */}
            <circle cx="685" cy="70" r="3" className="constellation-anchor-node" />
            <circle cx="685" cy="70" r="2" className="node-ping-ring" />

            {/* Waffle Anchor */}
            <circle cx="190" cy="160" r="3" className="constellation-anchor-node" />
            <circle cx="190" cy="160" r="2" className="node-ping-ring" />

            {/* TVS Anchor */}
            <circle cx="375" cy="240" r="3" className="constellation-anchor-node" />
            <circle cx="375" cy="240" r="2" className="node-ping-ring" />

            {/* Herody Hub Anchor */}
            <circle cx="625" cy="185" r="3.5" className="constellation-anchor-node anchor-hub" />
            <circle cx="625" cy="185" r="2" className="node-ping-ring" />

            {/* Mercedes Anchor */}
            <circle cx="870" cy="240" r="3" className="constellation-anchor-node" />
            <circle cx="870" cy="240" r="2" className="node-ping-ring" />

            {/* Atty's Anchor */}
            <circle cx="235" cy="365" r="3" className="constellation-anchor-node" />
            <circle cx="235" cy="365" r="2" className="node-ping-ring" />

            {/* Cube Anchor */}
            <circle cx="580" cy="325" r="3" className="constellation-anchor-node" />
            <circle cx="580" cy="325" r="2" className="node-ping-ring" />

            {/* Justvend Anchor */}
            <circle cx="765" cy="365" r="3" className="constellation-anchor-node" />
            <circle cx="765" cy="365" r="2" className="node-ping-ring" />

            {/* EasyBites Anchor */}
            <circle cx="305" cy="450" r="3" className="constellation-anchor-node" />
            <circle cx="305" cy="450" r="2" className="node-ping-ring" />

            {/* Mile Anchor */}
            <circle cx="695" cy="450" r="3" className="constellation-anchor-node" />
            <circle cx="695" cy="450" r="2" className="node-ping-ring" />
          </g>

          {/* ── JUNCTION INTERSECTION DOTS ── */}
          <circle
            cx="290"
            cy="160"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-nokia", "node-waffle") ? " is-active" : ""}`}
          />
          <circle
            cx="625"
            cy="70"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-herody", "node-redbull") ? " is-active" : ""}`}
          />
          <circle
            cx="625"
            cy="185"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-herody", "node-redbull", "node-merc") ? " is-active" : ""}`}
          />
          <circle
            cx="375"
            cy="325"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-tvs", "node-attys") ? " is-active" : ""}`}
          />
          <circle
            cx="625"
            cy="325"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-herody", "node-cube") ? " is-active" : ""}`}
          />
          <circle
            cx="870"
            cy="325"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-merc", "node-justvend") ? " is-active" : ""}`}
          />
          <circle
            cx="765"
            cy="450"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-justvend", "node-mile") ? " is-active" : ""}`}
          />
          <circle
            cx="235"
            cy="450"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-attys", "node-easybites") ? " is-active" : ""}`}
          />
        </svg>

        {/* Sponsor rows: 3 / 5 / 6 / 5 / 3 logos */}
        <div className="constellation-grid">
          {SPONSOR_ROWS.map((row, rowIndex) => (
            <div className={`constellation-row row-${rowIndex + 1}`} key={rowIndex}>
              {row.map((item) => (
                <div className="constellation-col" key={item.id}>
                  <div className={`constellation-node ${item.id}`}>
                    <SponsorCard
                      item={item}
                      isHovered={hoveredNode === item.id}
                      onMouseEnter={() => setHoveredNode(item.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsorCard({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  item: SponsorItem;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}): React.ReactElement {
  const cardContent = (
    <div
      className={`sponsor-card-inner tier-${item.tier || "core"}${isHovered ? " is-hovered" : ""}${item.url ? " has-link" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Subtle radial glow behind the logo on hover */}
      <span className="sponsor-logo-glow" aria-hidden="true" />

      {/* High-end corner constellation ticks */}
      <span className="card-corner corner-tl" aria-hidden="true" />
      <span className="card-corner corner-tr" aria-hidden="true" />
      <span className="card-corner corner-bl" aria-hidden="true" />
      <span className="card-corner corner-br" aria-hidden="true" />

      {/* Coordinate beacon */}
      <span className="card-beacon" aria-hidden="true" />

      <div className="sponsor-logo-frame">
        <Image
          className={`sponsor-logo${item.logoKey ? ` sponsor-logo--${item.logoKey}` : ""}`}
          src={item.logo}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 112px, 132px"
          style={{ objectFit: "contain" }}
          loading="lazy"
        />
      </div>
    </div>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="sponsor-card-link"
        aria-label={`Visit ${item.name} website`}
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

