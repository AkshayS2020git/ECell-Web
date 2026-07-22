import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./Story.css";

gsap.registerPlugin(ScrollTrigger);

export default function Story({
  eyebrow = "E-CELL",
  baseHeading = "Our Story",
  headlineMain = "BUILDING THE FUTURE",
  headlineAccent = "ONE STARTUP AT A TIME",
}) {
  const revealRef = useRef(null);
  const baseTextRef = useRef(null);
  const imagePanelRef = useRef(null);
  const imageRef = useRef(null);
  const revealTextInnerRef = useRef(null);
  const eyebrowRef = useRef(null);

  useEffect(() => {
    const reveal = revealRef.current;
    const baseText = baseTextRef.current;
    const imagePanel = imagePanelRef.current;
    const image = imageRef.current;
    const revealTextInner = revealTextInnerRef.current;
    const eyebrowEl = eyebrowRef.current;

    if (!reveal || !imagePanel || !revealTextInner) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      gsap.set(baseText, { opacity: 0 });
      gsap.set(imagePanel, {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
      });
      if (image) gsap.set(image, { scale: 1 });
      gsap.set(eyebrowEl, { opacity: 1, y: 0 });
      gsap.set(revealTextInner, { x: 0 });
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const rafHandler = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafHandler);
    gsap.ticker.lagSmoothing(0);

    const mm = gsap.matchMedia();

    mm.add(
      { isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" },
      (context) => {
        const { isMobile } = context.conditions;
        const travelPct = isMobile ? 28 : 40;
        const pinLength = isMobile ? "+=320%" : "+=420%";

        const containerWidth = reveal.offsetWidth || window.innerWidth;
        const textWidth = revealTextInner.scrollWidth;

        gsap.set(revealTextInner, { x: containerWidth });

        gsap.set(imagePanel, {
          x: `${travelPct}%`,
          y: `${travelPct}%`,
          scale: isMobile ? 0.62 : 0.5,
          rotate: -4,
          filter: "blur(6px)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: reveal,
            start: "top top",
            end: pinLength,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        tl.to(
          baseText,
          { opacity: 0, y: -24, duration: 0.12, ease: "power1.out" },
          0,
        )

          .to(
            imagePanel,
            {
              x: "0%",
              y: "0%",
              scale: 1,
              rotate: 0,
              filter: "blur(0px)",
              duration: 0.55,
              ease: "power3.out",
            },
            0.04,
          )

          .to(
            revealTextInner,
            {
              x: -textWidth,
              duration: 1.1,
              ease: "none",
            },
            0.04,
          )

          .fromTo(
            eyebrowEl,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.18, ease: "power1.out" },
            0.3,
          );

        if (image) {
          tl.to(image, { scale: 1, duration: 0.65, ease: "power2.out" }, 0.06);
        }

        return () => {
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
        };
      },
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      mm.revert();
      gsap.ticker.remove(rafHandler);
      lenis.destroy();
    };
  }, [headlineMain, headlineAccent]);

  return (
    <section className="story-reveal" ref={revealRef} id="storyReveal">
      <div className="story-reveal-base" ref={baseTextRef}>
        <div className="eyebrow">{eyebrow}</div>
        <h2 id="baseHeading">{baseHeading}</h2>
      </div>

      <div className="story-image-panel" ref={imagePanelRef} id="imagePanel">
        <div className="grain"></div>
      </div>

      <div className="story-reveal-text">
        <div className="eyebrow" ref={eyebrowRef}>
          {eyebrow}
        </div>
        <div className="story-reveal-text-inner" ref={revealTextInnerRef}>
          <h2>
            {headlineMain} <em>{headlineAccent}</em>
          </h2>
        </div>
      </div>

      <div className="story-scroll-hint">
        <div className="track">
          <i></i>
        </div>
        <span>Scroll</span>
      </div>
    </section>
  );
}
