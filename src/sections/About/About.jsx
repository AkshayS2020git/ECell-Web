import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './About.css';

export default function About() {
  const aboutSectionRef = useRef(null);
  const aboutStatementRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const line3Ref = useRef(null);
  const line4Ref = useRef(null);

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

    function smoothstep(edge0, edge1, x) {
      const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
      return t * t * (3 - 2 * t);
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    const ABOUT_SMOOTH = 0.06;
    let aboutSmoothed = 0;

    function updateAboutAnimations() {
      const rect = aboutStatement.getBoundingClientRect();
      const vh = window.innerHeight;

      // Do not spend a frame recalculating blur/transforms while this section
      // is well outside the viewport (especially during the hero scroll).
      if (rect.bottom < -vh || rect.top > vh * 1.25) return;

      const startY = vh * 1.0;
      const endY = vh * 0.1;
      const target = Math.min(
        Math.max((startY - rect.top) / (startY - endY), 0),
        1,
      );
      aboutSmoothed = lerp(aboutSmoothed, target, ABOUT_SMOOTH);
      const p = aboutSmoothed;

      lines.forEach((line, i) => {
        if (!line) return;
        const winStart = i * 0.18;
        const winLen = 0.42;
        const lp = smoothstep(winStart, winStart + winLen, p);
        line.style.transform = `translateY(${100 - lp * 100}%)`;
        line.style.opacity = lp;
        line.style.filter = `blur(${10 - lp * 10}px)`;
      });
    }

    gsap.ticker.add(updateAboutAnimations);

    return () => {
      gsap.ticker.remove(updateAboutAnimations);
    };
  }, []);

  return (
    <section ref={aboutSectionRef} className="about wrap" id="aboutSection">
      <div className="eyebrow">About ECell</div>
      <div ref={aboutStatementRef} className="about-statement" id="aboutStatement">
        <span className="line-mask">
          <span ref={line1Ref} className="line-inner">
            <span className="bright">Building ideas,</span>{' '}
            <span className="dim">chasing outcomes,</span>
          </span>
        </span>
        <span className="line-mask">
          <span ref={line2Ref} className="line-inner">
            <span className="bright">backing founders</span>{' '}
            <span className="dim">who go all in.</span>
          </span>
        </span>
        <span className="line-mask">
          <span ref={line3Ref} className="line-inner">
            <span className="dim">Defining a</span>{' '}
            <span className="bright">legacy</span>
          </span>
        </span>
        <span className="line-mask">
          <span ref={line4Ref} className="line-inner">
            <span className="dim">of builders,</span>{' '}
            <span className="bright">on campus and beyond.</span>
          </span>
        </span>
      </div>
    </section>
  );
}
