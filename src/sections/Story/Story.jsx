import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./Story.css";
import libImg from "../../assets/story/lib.png";

gsap.registerPlugin(ScrollTrigger);

export default function Story({
  eyebrow = "ECELL",
  baseHeading = "Our Story",
  headlineMain = "IT'S THE MIND",
  headlineAccent = "THAT MAKES THE DIFFERENCE",
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
      gsap.set(".story-reveal-text", { opacity: 1 });
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
            end: isMobile ? "+=380%" : "+=480%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const velocity = self.getVelocity();
              const skew = velocity * 0.006;
              const clampedSkew = gsap.utils.clamp(-14, 14, skew);
              const dip = Math.abs(clampedSkew) * 0.5;

              // Squash & Stretch for a jelly/squishy feel
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

        // 1. Base text fade out
        tl.to(
          baseText,
          { opacity: 0, y: -24, duration: 0.12, ease: "power1.out" },
          0,
        )

        // 2. Image panel entrance from bottom-right
        .to(
          imagePanel,
          {
            x: "0%",
            y: "0%",
            scale: 1,
            rotate: 0,
            filter: "blur(0px)",
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          0.04,
        );

        if (image) {
          tl.to(image, { scale: 1, duration: 0.5, ease: "power2.out" }, 0.04);
        }

        // 3. Reveal headline text scroll
        tl.to(
          ".story-reveal-text",
          { opacity: 1, duration: 0.1, ease: "power1.out" },
          0.54,
        )

        .to(
          revealTextInner,
          {
            x: -textWidth,
            duration: 1.1,
            ease: "none",
          },
          0.54,
        )

        .fromTo(
          eyebrowEl,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.18, ease: "power1.out" },
          0.6,
        )

        // 4. Image panel dynamic exit transition towards top-left
        .to(
          imagePanel,
          {
            x: `-${travelPct + 10}%`,
            y: `-${travelPct + 10}%`,
            scale: isMobile ? 0.55 : 0.42,
            rotate: 6,
            filter: "blur(12px)",
            opacity: 0,
            duration: 0.55,
            ease: "power2.inOut",
          },
          1.4,
        );

        if (image) {
          tl.to(
            image,
            {
              scale: 1.25,
              duration: 0.55,
              ease: "power2.inOut",
            },
            1.4,
          );
        }

        // Fade out text overlay during exit
        tl.to(
          ".story-reveal-text",
          {
            opacity: 0,
            y: -30,
            duration: 0.4,
            ease: "power1.in",
          },
          1.45,
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
