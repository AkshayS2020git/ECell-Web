import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./Story.css";
import libImg from "../../assets/story/lib.webp";

gsap.registerPlugin(ScrollTrigger);

export default function Story({
  eyebrow = "ECELL",
  headlineMain = "IT'S THE MIND",
  headlineAccent = "THAT MAKES THE DIFFERENCE",
}) {
  const revealRef = useRef(null);
  const imagePanelRef = useRef(null);
  const imageRef = useRef(null);
  const revealTextInnerRef = useRef(null);
  const eyebrowRef = useRef(null);

  useEffect(() => {
    const reveal = revealRef.current;
    const imagePanel = imagePanelRef.current;
    const image = imageRef.current;
    const revealTextInner = revealTextInnerRef.current;
    const eyebrowEl = eyebrowRef.current;

    if (!reveal || !imagePanel || !revealTextInner) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      gsap.set(imagePanel, {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
      });
      if (image) gsap.set(image, { scale: 1 });
      gsap.set(".story-reveal-text", { opacity: 0 });
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const lenis = isMobile
      ? null
      : new Lenis({
          duration: 1.2,
          easing: (t) => 1 - Math.pow(1 - t, 4),
          smoothWheel: true,
        });

    const rafHandler = lenis
      ? (time) => {
          lenis.raf(time * 1000);
        }
      : null;

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(rafHandler);
      gsap.ticker.lagSmoothing(0);
    }

    const mm = gsap.matchMedia();

    mm.add(
      { isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" },
      (context) => {
        const { isMobile } = context.conditions;
        const travelPct = isMobile ? 28 : 40;

        const containerWidth = reveal.offsetWidth || window.innerWidth;
        const textWidth = revealTextInner.scrollWidth;
        const textH2 = revealTextInner.querySelector("h2");

        gsap.set(revealTextInner, { x: containerWidth });
        gsap.set(".story-reveal-text", { opacity: 0 });

        gsap.set(imagePanel, {
          x: `${travelPct}%`,
          y: `${travelPct}%`,
          scale: isMobile ? 0.62 : 0.5,
          rotate: -4,
          filter: "blur(6px)",
          opacity: 1,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: reveal,
            start: "top top",
            end: isMobile ? "+=250%" : "+=300%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const velocity = self.getVelocity();
              const skew = velocity * 0.006;
              const clampedSkew = gsap.utils.clamp(-14, 14, skew);
              const dip = Math.abs(clampedSkew) * 0.5;

              const stretch = Math.abs(velocity) * 0.00018;
              const clampedStretch = gsap.utils.clamp(0, 0.22, stretch);
              const scaleX = 1 + clampedStretch;
              const scaleY = 1 - clampedStretch;

              if (textH2) {
                gsap.to(textH2, {
                  skewX: clampedSkew,
                  scaleX: scaleX,
                  scaleY: scaleY,
                  y: dip,
                  overwrite: "auto",
                  duration: 0.3,
                  ease: "power2.out",
                });
              }
            },
          },
        });

        // 1. Image panel entrance from bottom-right to center
        tl.to(
          imagePanel,
          {
            x: "0%",
            y: "0%",
            scale: 1,
            rotate: 0,
            filter: "blur(0px)",
            opacity: 1,
            duration: 0.56,
            ease: "power2.out",
          },
          0.04,
        );

        if (image) {
          tl.to(image, { scale: 1, duration: 0.56, ease: "power2.out" }, 0.04);
        }

        // 2. Headline text scroll across screen
        tl.to(
          ".story-reveal-text",
          { opacity: 1, duration: 0.15, ease: "power1.out" },
          0.6,
        )
          .to(
            revealTextInner,
            {
              x: -(textWidth + 250),
              duration: 1.6,
              ease: "none",
            },
            0.6,
          )
          .fromTo(
            eyebrowEl,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.2, ease: "power1.out" },
            0.7,
          )
          .to(
            eyebrowEl,
            { opacity: 0, y: -10, duration: 0.2, ease: "power1.in" },
            1.95,
          )
          .to(
            ".story-reveal-text",
            { opacity: 0, duration: 0.15, ease: "power1.in" },
            2.08,
          );

        // A short overlapping exit clears the stage as the headline leaves.
        tl.to(
          imagePanel,
          {
            x: `-${travelPct + 26}%`,
            y: `-${travelPct + 22}%`,
            scale: isMobile ? 0.6 : 0.48,
            rotate: 11,
            filter: "blur(20px)",
            opacity: 0,
            duration: 0.42,
            ease: "power4.in",
          },
          2.06,
        );

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
      if (rafHandler) gsap.ticker.remove(rafHandler);
      lenis?.destroy();
    };
  }, [headlineMain, headlineAccent]);

  return (
    <section className="story-reveal" ref={revealRef} id="storyReveal">
      <div className="story-image-panel" ref={imagePanelRef} id="imagePanel">
        <img ref={imageRef} src={libImg} alt="Story background" />
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
    </section>
  );
}
