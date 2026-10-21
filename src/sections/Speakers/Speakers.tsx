"use client";

import { useEffect, useRef, type ReactElement } from "react";
import { CircularTestimonials } from "@/src/components/CircularTestimonials/CircularTestimonials";
import { PREVIOUS_SPEAKERS } from "@/src/content/speakers";
import { gsap, SplitText } from "@/src/utils/gsapSetup";
import "./styles/Speakers.css";

export type { Speaker } from "@/src/content/speakers";

export default function Speakers(): ReactElement {
  const headerRef = useRef<HTMLElement>(null);

  // Header entrance: kicker letter-spacing settles, headline letters rise out
  // of a clip mask, subheading follows. Plays once; skipped for reduced motion.
  useEffect(() => {
    const header = headerRef.current;
    if (!header || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    // Split after the webfont lands, or the character boxes are measured on the fallback face.
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const split = SplitText.create(".speakers-headline", { type: "words,chars", mask: "chars" });

        gsap
          .timeline({
            scrollTrigger: { trigger: header, start: "top 82%", once: true },
            defaults: { ease: "expo.out" },
            // The masks would clip descenders at this tight line-height; unwrap once the letters are home.
            onComplete: () => split.revert(),
          })
          .from(".speakers-kicker-text", { autoAlpha: 0, letterSpacing: "0.6em", duration: 1.2 })
          .from(split.chars, { yPercent: 115, rotate: 6, duration: 1.1, stagger: 0.028 }, 0.1)
          .from(".speakers-subheading", { autoAlpha: 0, y: 18, duration: 1 }, 0.45);
      }, header);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section className="speakers-section" id="speakers" aria-labelledby="speakers-heading">
      <div className="speakers-reveal-panel">
        <div className="wrap">
          <header ref={headerRef} className="speakers-header">
            <span className="speakers-kicker-text">Voices of Innovation</span>
            <h2 id="speakers-heading" className="speakers-headline">
              Previous Speakers
            </h2>
            <p className="speakers-subheading">
              Founders, tech leaders, and entrepreneurs who have shared hard-earned lessons with the
              next generation of builders.
            </p>
          </header>

          <CircularTestimonials
            testimonials={PREVIOUS_SPEAKERS}
            label="Previous speakers"
            itemNoun="speaker"
            autoplayMs={7000}
          />
        </div>
      </div>
    </section>
  );
}
