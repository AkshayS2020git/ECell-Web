import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './Story.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Story Component — Scroll Image Reveal Section
 * 
 * PROPS:
 * @param {string} imageUrl - Image source URL (defaults to high-res placeholder, user can replace later)
 * @param {string} eyebrow - Small eyebrow label text (defaults to 'E-CELL')
 * @param {string} baseHeading - Initial title displayed before reveal (defaults to 'Our Story')
 * @param {string} headlineMain - Primary moving headline text
 * @param {string} headlineAccent - Italic/accent moving headline text
 */
export default function Story({
  imageUrl = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80",
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

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      gsap.set(baseText, { opacity: 0 });
      gsap.set(imagePanel, { x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" });
      if (image) gsap.set(image, { scale: 1 });
      gsap.set(eyebrowEl, { opacity: 1, y: 0 });
      gsap.set(revealTextInner, { x: 0 });
      return;
    }

    // Lenis smooth scroll instance
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
        // Increased pin length to decrease text scroll speed and ensure complete text reveal before unpinning
        const pinLength = isMobile ? "+=320%" : "+=420%";

        const containerWidth = reveal.offsetWidth || window.innerWidth;
        const textWidth = revealTextInner.scrollWidth;

        // Start headline text right at the right edge of the viewport
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

        tl
          // 1. Lift and fade out base heading at the start
          .to(baseText, { opacity: 0, y: -24, duration: 0.12, ease: "power1.out" }, 0)

          // 2. Image panel travels diagonally into center to fill screen
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
            0.04
          )

          // 3. Headline text starts crawling slowly (0.04) BEFORE image is fullscreen
          // and moves all the way past the left edge (-textWidth) so 100% of text displays
          .to(
            revealTextInner,
            {
              x: -textWidth,
              duration: 1.10,
              ease: "none",
            },
            0.04
          )

          // 4. Eyebrow label eases in clearly over the image
          .fromTo(
            eyebrowEl,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.18, ease: "power1.out" },
            0.30
          );

        if (image) {
          tl.to(image, { scale: 1, duration: 0.65, ease: "power2.out" }, 0.06);
        }

        return () => {
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
        };
      }
    );

    // Refresh ScrollTrigger when fonts finish loading to re-calculate precise text dimensions
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
      {/* Content visible BEFORE image slides in */}
      <div className="story-reveal-base" ref={baseTextRef}>
        <div className="eyebrow">{eyebrow}</div>
        <h2 id="baseHeading">{baseHeading}</h2>
      </div>

      {/* Image panel: travels diagonally from bottom-right to fill screen */}
      <div className="story-image-panel" ref={imagePanelRef} id="imagePanel">
        <div className="grain"></div>
      </div>

      {/* Crawling text line overlay */}
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

      {/* Scroll indicator */}
      <div className="story-scroll-hint">
        <div className="track">
          <i></i>
        </div>
        <span>Scroll</span>
      </div>
    </section>
  );
}
