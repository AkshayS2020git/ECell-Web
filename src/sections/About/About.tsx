"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "../../utils/gsapSetup";
import "./About.css";

export default function About(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const copyRef = useRef<HTMLParagraphElement | null>(null);
  const wordsRef = useRef<HTMLDivElement | null>(null);
  const transitionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const copy = copyRef.current;
    const wordsStage = wordsRef.current;
    const transition = transitionRef.current;
    const headingLines = Array.from(
      heading?.querySelectorAll<HTMLSpanElement>(".line-inner") ?? []
    );
    const copyLines = Array.from(
      copy?.querySelectorAll<HTMLSpanElement>(".about-copy__line") ?? []
    );
    const words = Array.from(
      wordsStage?.querySelectorAll<HTMLSpanElement>(".about-word") ?? []
    );

    if (!section || !heading || !copy || !wordsStage) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set([...headingLines, ...copyLines, ...words, transition].filter(Boolean), {
        clearProps: "all",
        autoAlpha: 1,
      });
      return;
    }

    const headingTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 76%",
        toggleActions: "play none none reverse",
      },
    })
      .fromTo(
        headingLines,
        { yPercent: 108, autoAlpha: 0, filter: "blur(9px)" },
        { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.13, ease: "power4.out" }
      )
      .fromTo(
        copyLines,
        { yPercent: 110, autoAlpha: 0, filter: "blur(7px)" },
        { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.58, stagger: 0.09, ease: "power4.out" },
        "-=0.3"
      );

    const wordTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: wordsStage,
        start: "top 75%",
        end: "bottom 15%",
        scrub: 0.7,
      },
    });
    words.forEach((word, index) => {
      wordTimeline.fromTo(
        word,
        { yPercent: 80, autoAlpha: 0, rotate: 3 },
        { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 0.78, ease: "power4.out" },
        index * 1.25
      );
    });
    // Keep the completed statement on screen briefly before exiting.
    wordTimeline.to({}, { duration: 0.6 });

    // Exit animation: fade out and drift up so 'Create.' exits the screen cleanly before transition enters.
    wordTimeline.to(words, {
      yPercent: -50,
      autoAlpha: 0,
      filter: "blur(6px)",
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.in",
    });

    const transitionTween = transition
      ? gsap.fromTo(
          transition,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: transition,
              start: "top 85%",
              end: "top 65%",
              scrub: 0.5,
            },
          }
        )
      : null;

    return () => {
      headingTimeline.kill();
      wordTimeline.kill();
      transitionTween?.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="about wrap" id="aboutSection">
      <div className="eyebrow">About ECell</div>
      <h2 ref={headingRef} className="about-statement" id="aboutStatement">
        <span className="line-mask"><span className="line-inner">Entrepreneurship isn&apos;t just about</span></span>
        <span className="line-mask"><span className="line-inner dim">starting a company.</span></span>
      </h2>
      <p ref={copyRef} className="about-copy">
        <span className="about-copy__mask"><span className="about-copy__line">It&apos;s about curiosity. It&apos;s about building.</span></span>
        <span className="about-copy__mask"><span className="about-copy__line">It&apos;s about finding people crazy enough to build with you.</span></span>
        <span className="about-copy__mask"><span className="about-copy__line">ECell exists to give those ideas a place to go.</span></span>
      </p>

      <div ref={wordsRef} className="about-words" aria-label="Build. Connect. Create.">
        <span className="about-word">Build.</span>
        <span className="about-word">Connect.</span>
        <span className="about-word">Create.</span>
      </div>

      <div ref={transitionRef} className="about-transition" aria-hidden="true">
        <span className="about-transition__count">01 — 05</span>
        <span className="about-transition__label">Reasons to join ECell</span>
        <span className="about-transition__line"><i /></span>
        <span className="about-transition__arrow">↓</span>
      </div>
    </section>
  );
}
