"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "../../utils/gsapSetup";
import { smoothstep, lerp } from "../../utils/math";
import "./About.css";

export default function About(): React.ReactElement {
  const aboutSectionRef = useRef<HTMLElement | null>(null);
  const aboutStatementRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const line3Ref = useRef<HTMLSpanElement | null>(null);
  const line4Ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const aboutSection = aboutSectionRef.current;
    const aboutStatement = aboutStatementRef.current;
    const lines = [line1Ref.current, line2Ref.current, line3Ref.current, line4Ref.current];

    if (!aboutSection || !aboutStatement) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lines.forEach((line) => {
        if (!line) return;
        line.style.transform = "none";
        line.style.opacity = "1";
        line.style.filter = "none";
      });
      return;
    }

    const ABOUT_SMOOTH = 0.06;
    let aboutSmoothed = 0;
    let lastAppliedProgress = -1;

    let disposed = false;

    function updateAboutAnimations() {
      if (disposed || !aboutStatement) return;

      const rect = aboutStatement.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.bottom < -vh || rect.top > vh * 1.25) return;

      const startY = vh * 1.0;
      const endY = vh * 0.1;
      const target = Math.min(
        Math.max((startY - rect.top) / (startY - endY), 0),
        1
      );
      const diff = Math.abs(aboutSmoothed - target);
      if (diff < 0.00005) {
        aboutSmoothed = target;
        if (lastAppliedProgress === aboutSmoothed) return;
      } else {
        aboutSmoothed = lerp(aboutSmoothed, target, ABOUT_SMOOTH);
      }
      lastAppliedProgress = aboutSmoothed;
      const p = aboutSmoothed;

      lines.forEach((line, i) => {
        if (!line) return;
        const winStart = i * 0.18;
        const winLen = 0.42;
        const lp = smoothstep(winStart, winStart + winLen, p);
        line.style.transform = `translateY(${100 - lp * 100}%)`;
        line.style.opacity = `${lp}`;
        line.style.filter = `blur(${10 - lp * 10}px)`;
      });
    }

    gsap.ticker.add(updateAboutAnimations);

    return () => {
      disposed = true;
      gsap.ticker.remove(updateAboutAnimations);
      lines.forEach((line) => {
        if (line) {
          line.style.transform = "";
          line.style.opacity = "";
          line.style.filter = "";
        }
      });
      lines.length = 0;
    };
  }, []);

  return (
    <section ref={aboutSectionRef} className="about wrap" id="aboutSection">
      <div className="eyebrow">About ECell</div>
      <div ref={aboutStatementRef} className="about-statement" id="aboutStatement">
        <span className="line-mask">
          <span ref={line1Ref} className="line-inner">
            <span className="bright">Building ideas,</span>{" "}
            <span className="dim">chasing outcomes,</span>
          </span>
        </span>
        <span className="line-mask">
          <span ref={line2Ref} className="line-inner">
            <span className="bright">backing founders</span>{" "}
            <span className="dim">who go all in.</span>
          </span>
        </span>
        <span className="line-mask">
          <span ref={line3Ref} className="line-inner">
            <span className="dim">Defining a</span>{" "}
            <span className="bright">legacy</span>
          </span>
        </span>
        <span className="line-mask">
          <span ref={line4Ref} className="line-inner">
            <span className="dim">of builders,</span>{" "}
            <span className="bright">on campus and beyond.</span>
          </span>
        </span>
      </div>
    </section>
  );
}
