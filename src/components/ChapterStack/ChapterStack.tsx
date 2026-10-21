"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/src/utils/gsapSetup";
import "./ChapterStack.css";

/**
 * Stacks homepage chapters like cards: when a chapter reaches the bottom of
 * the screen it holds still and sinks back (shrinks, tips away, dims) while
 * the next one slides up over it with rounded top corners that square off as
 * it lands. Once covered, the old chapter is plain again.
 *
 * Styles live only on the two chapters of the seam in progress, and are
 * removed during every ScrollTrigger refresh so the sections' own triggers
 * always measure an untouched page.
 */

// In page order. Story hands off to Team inside its own pin, and the
// horizontal track reveals the footer itself, so the stack ends at Story.
const CHAIN = [
  "main > section.hero",
  "#aboutSection",
  "#eventsSection",
  "#speakers",
  "#sponsors",
  "#why-join",
  "#storyReveal",
];

const DESKTOP = { tilt: 4, scale: 0.9, radius: 32, perspective: 1400 };
const MOBILE = { tilt: 2, scale: 0.94, radius: 20, perspective: 1000 };
const DIM = 0.55;
const sinkEase = gsap.parseEase("power1.out");

// A pinned chapter sits in a spacer that holds its scroll length.
function host(el: HTMLElement): HTMLElement {
  const parent = el.parentElement;
  return parent?.classList.contains("pin-spacer") ? parent : el;
}

function absTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

export default function ChapterStack(): null {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const look = context.conditions?.desktop ? DESKTOP : MOBILE;
        const chapters = CHAIN.map((selector) => document.querySelector<HTMLElement>(selector));
        const flatteners: (() => void)[] = [];

        chapters.slice(0, -1).forEach((under, i) => {
          const over = chapters[i + 1];
          if (!under || !over) return;

          let start = 0;
          let end = 0;
          let underTop = 0;
          let active = false;

          const flatten = () => {
            if (!active) return;
            active = false;
            under.style.transform = "";
            under.style.transformOrigin = "";
            under.style.clipPath = "";
            under.style.opacity = "";
            over.style.zIndex = "";
            over.style.clipPath = "";
          };

          const render = (y: number) => {
            const p = end > start ? (y - start) / (end - start) : 0;
            if (p <= 0 || p >= 1) {
              flatten();
              return;
            }
            active = true;

            const vh = window.innerHeight;
            const eased = sinkEase(p);
            // Where the viewport sat over `under` when it stopped moving.
            const visibleTop = start - underTop;

            under.style.transformOrigin = `50% ${visibleTop + vh / 2}px`;
            under.style.transform =
              `translate3d(0, ${y - start}px, 0) perspective(${look.perspective}px) ` +
              `rotateX(${look.tilt * eased}deg) scale(${1 - (1 - look.scale) * eased})`;
            under.style.clipPath = `inset(${visibleTop}px 0 0 0 round ${look.radius * Math.min(1, p * 4)}px)`;
            under.style.opacity = String(1 - DIM * p);

            over.style.zIndex = "3";
            over.style.clipPath = `inset(0 round ${look.radius * (1 - p)}px ${look.radius * (1 - p)}px 0 0)`;
          };

          ScrollTrigger.create({
            // Run after every section's own triggers so their pin spacers exist.
            refreshPriority: -1,
            start: () => {
              const seam = absTop(host(over));
              underTop = seam - under.offsetHeight;
              // A chapter shorter than the screen holds once its top reaches the top.
              start = Math.max(seam - window.innerHeight, absTop(host(under)));
              end = seam;
              return start;
            },
            end: () => end,
            onRefresh: (self) => render(self.scroll()),
            onUpdate: (self) => render(self.scroll()),
            onLeave: flatten,
            onLeaveBack: flatten,
          });
          flatteners.push(flatten);
        });

        const flattenAll = () => flatteners.forEach((flatten) => flatten());
        ScrollTrigger.addEventListener("refreshInit", flattenAll);
        document.documentElement.classList.add("has-chapter-stack");

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", flattenAll);
          document.documentElement.classList.remove("has-chapter-stack");
          flattenAll();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return null;
}
