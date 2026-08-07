"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../utils/gsapSetup";
import Lenis from "lenis";
import "./Story.css";
import libImg from "../../assets/story/lib.webp";

function renderJigglyText(text, keyPrefix) {
  if (!text) return null;
  const words = text.split(" ");
  return words.map((word, wordIdx) => (
    <span
      key={`${keyPrefix}-w-${wordIdx}`}
      className="jiggle-word"
      style={{ display: "inline-block", whiteSpace: "nowrap" }}
    >
      {word.split("").map((char, charIdx) => (
        <span
          key={`${keyPrefix}-c-${charIdx}`}
          className="jiggle-char"
          style={{ display: "inline-block", willChange: "transform" }}
        >
          {char}
        </span>
      ))}
      {wordIdx < words.length - 1 && (
        <span className="jiggle-space" style={{ display: "inline-block" }}>
          &nbsp;
        </span>
      )}
    </span>
  ));
}

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

    // --- Lenis smooth scroll (desktop only) ---
    let lenis = isMobile
      ? null
      : new Lenis({
          duration: 1.2,
          easing: (t) => 1 - Math.pow(1 - t, 4),
          smoothWheel: true,
        });

    let rafId = null;
    let disposed = false;
    let tickerCallback = null;

    const scrollUpdateHandler = () => {
      ScrollTrigger.update();
    };

    const updateLenis = (time) => {
      if (disposed) return;
      lenis?.raf(time);
      rafId = requestAnimationFrame(updateLenis);
    };

    if (lenis) {
      lenis.on("scroll", scrollUpdateHandler);
      rafId = requestAnimationFrame(updateLenis);
    }

    const mm = gsap.matchMedia();

    mm.add(
      { isDesktop: "(min-width: 768px)", isMobile: "(max-width: 767px)" },
      (context) => {
        const { isMobile } = context.conditions;
        const travelPct = isMobile ? 28 : 40;

        const containerWidth = reveal.offsetWidth || window.innerWidth;
        const textWidth = revealTextInner.scrollWidth;

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

        // --- JIGGLY TEXT ANIMATION SETUP ---
        const chars = revealTextInner.querySelectorAll(".jiggle-char");
        const eyebrowChars = eyebrowEl ? eyebrowEl.querySelectorAll(".jiggle-char") : [];

        let targetVel = 0;
        let currentVel = 0;
        let wobbleTime = 0;

        tickerCallback = (time, deltaTime) => {
          if (disposed) return;

          // Smooth velocity lerp for organic spring behavior
          const dtSec = Math.min(deltaTime / 1000, 0.05);
          const lerpFactor = 1 - Math.pow(0.0001, dtSec);
          currentVel += (targetVel - currentVel) * lerpFactor;

          // Organic spring decay of target velocity when scrolling pauses
          targetVel *= Math.pow(0.90, dtSec * 60);

          const velMag = Math.abs(currentVel);
          const isMoving = velMag > 0.5;

          if (isMoving || Math.abs(targetVel) > 0.5) {
            wobbleTime += (0.016 + velMag * 0.00012) * (dtSec * 60);
          }

          // Normalized velocity (-1 to 1) with higher sensitivity
          const normVel = gsap.utils.clamp(-1400, 1400, currentVel) / 1400;
          const absNorm = Math.abs(normVel);

          if (absNorm > 0.0005 || isMoving) {
            // Animate main headline letters with extra jiggly elastic wave & momentum tilt
            chars.forEach((char, idx) => {
              const phase = idx * 0.42 + wobbleTime * 8;
              const sinWave = Math.sin(phase);
              const cosWave = Math.cos(phase);

              const yOffset = sinWave * absNorm * 24 + normVel * 16;
              const skewX = normVel * 18 + cosWave * absNorm * 12;
              const rotation = sinWave * absNorm * 9 + normVel * 6;
              const scaleY = 1 - absNorm * 0.18 + sinWave * absNorm * 0.14;
              const scaleX = 1 + absNorm * 0.18 - sinWave * absNorm * 0.12;

              gsap.set(char, {
                y: yOffset,
                skewX: skewX,
                rotation: rotation,
                scaleY: scaleY,
                scaleX: scaleX,
                transformOrigin: "50% 100%",
              });
            });

            // Animate eyebrow letters with responsive jiggle
            eyebrowChars.forEach((char, idx) => {
              const phase = idx * 0.5 + wobbleTime * 9;
              const sinWave = Math.sin(phase);
              const yOffset = sinWave * absNorm * 10 + normVel * 7;
              const skewX = normVel * 9 + sinWave * absNorm * 6;
              const rotation = sinWave * absNorm * 4 + normVel * 3;

              gsap.set(char, {
                y: yOffset,
                skewX: skewX,
                rotation: rotation,
                transformOrigin: "50% 100%",
              });
            });
          } else {
            // Reset to default crisp state when stationary
            chars.forEach((char) => {
              gsap.set(char, {
                y: 0,
                skewX: 0,
                rotation: 0,
                scaleY: 1,
                scaleX: 1,
              });
            });
            eyebrowChars.forEach((char) => {
              gsap.set(char, {
                y: 0,
                skewX: 0,
                rotation: 0,
              });
            });
          }
        };

        gsap.ticker.add(tickerCallback);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: reveal,
            start: "top top",
            end: isMobile ? "+=250%" : "+=300%",
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              targetVel = self.getVelocity();
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
          if (tickerCallback) gsap.ticker.remove(tickerCallback);
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
        };
      },
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!disposed) ScrollTrigger.refresh();
      });
    }

    return () => {
      // 1. Set disposed flag first to stop rAF callback
      disposed = true;

      // 2. Cancel ticker callback
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }

      // 3. Cancel the rAF loop immediately
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      // 4. Revert gsap matchMedia (kills all ScrollTriggers created inside)
      mm.revert();

      // 5. Clean up Lenis: remove listener, then destroy
      if (lenis) {
        lenis.off("scroll", scrollUpdateHandler);
        lenis.destroy();
        lenis = null;
      }
    };
  }, [headlineMain, headlineAccent]);

  return (
    <section className="story-reveal" ref={revealRef} id="storyReveal">
      <div className="story-image-panel" ref={imagePanelRef} id="imagePanel">
        <img ref={imageRef} src={typeof libImg === "string" ? libImg : libImg?.src || libImg} alt="Story background" />
        <div className="grain"></div>
      </div>

      <div className="story-reveal-text">
        <div className="eyebrow" ref={eyebrowRef}>
          {renderJigglyText(eyebrow, "eyebrow")}
        </div>
        <div className="story-reveal-text-inner" ref={revealTextInnerRef}>
          <h2>
            {renderJigglyText(headlineMain, "main")}{" "}
            <em>{renderJigglyText(headlineAccent, "accent")}</em>
          </h2>
        </div>
      </div>
    </section>
  );
}

