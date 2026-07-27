import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./Story.css";
import libImg from "../../assets/story/lib.png";
import Events3DScene, { GALLERY_ITEMS } from "../Events/Events";

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
  const transitionRef = useRef(null);

  // Events 3D Scene Refs
  const eventsWrapperRef = useRef(null);
  const sceneRef = useRef(null);
  const captionRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const reveal = revealRef.current;
    const imagePanel = imagePanelRef.current;
    const image = imageRef.current;
    const revealTextInner = revealTextInnerRef.current;
    const eyebrowEl = eyebrowRef.current;
    const transition = transitionRef.current;
    const eventsWrapper = eventsWrapperRef.current;

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
      gsap.set(eventsWrapper, { opacity: 1, scale: 1 });
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

        const containerWidth = reveal.offsetWidth || window.innerWidth;
        const textWidth = revealTextInner.scrollWidth;
        const textH2 = revealTextInner.querySelector("h2");

        const zSpacing = 1500;
        const maxCameraZ = (GALLERY_ITEMS.length - 1) * zSpacing + 800;

        gsap.set(revealTextInner, { x: containerWidth });
        gsap.set(".story-reveal-text", { opacity: 0 });
        if (transition) gsap.set(transition, { opacity: 0, scale: 0.72, y: 24 });
        if (eventsWrapper) gsap.set(eventsWrapper, { opacity: 0, scale: 0.85, pointerEvents: "none" });

        gsap.set(imagePanel, {
          x: `${travelPct}%`,
          y: `${travelPct}%`,
          scale: isMobile ? 0.62 : 0.5,
          rotate: -4,
          filter: "blur(6px)",
          opacity: 1,
        });

        const cameraObj = { z: 0 };
        let lastCaption = "Scroll Down to Explore";

        function update3DScene(currentZ) {
          const scene = sceneRef.current;
          const items = itemsRef.current.filter(Boolean);
          if (!scene || items.length === 0) return;

          scene.style.transform = `translateZ(${currentZ}px)`;

          let activeIndex = 0;
          let minDistance = Infinity;

          items.forEach((item, index) => {
            const itemZ = parseFloat(item.dataset.z || "0");
            const currentRelZ = itemZ + currentZ;

            if (currentRelZ > 400) {
              item.style.opacity = "0";
            } else {
              let opacity = 1 - Math.abs(currentRelZ) / 3000;
              item.style.opacity = `${Math.max(0.05, Math.min(1, opacity))}`;
            }

            if (currentRelZ <= 300) {
              const distanceToCamera = Math.abs(currentRelZ);
              if (distanceToCamera < minDistance) {
                minDistance = distanceToCamera;
                activeIndex = index;
              }
            }
          });

          const newCaption = GALLERY_ITEMS[activeIndex]?.caption || "Scroll Down to Explore";
          if (captionRef.current && lastCaption !== newCaption) {
            lastCaption = newCaption;
            captionRef.current.style.opacity = "0";
            setTimeout(() => {
              if (captionRef.current) {
                captionRef.current.textContent = newCaption;
                captionRef.current.style.opacity = "1";
              }
            }, 120);
          }
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: reveal,
            start: "top top",
            end: isMobile ? "+=550%" : "+=650%",
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

        // 3. Immediately after text leaves the screen, POP UP Events 3D gallery on the SAME vertical level over the library background!
        tl.to(
          eventsWrapper,
          {
            opacity: 1,
            scale: 1,
            pointerEvents: "auto",
            duration: 0.45,
            ease: "back.out(1.2)",
          },
          2.12,
        );

        // 4. Drive 3D virtual scroll camera through the cards
        tl.to(
          cameraObj,
          {
            z: maxCameraZ,
            duration: 3.5,
            ease: "none",
            onUpdate: () => {
              update3DScene(cameraObj.z);
            },
          },
          2.25,
        );

        // 5. Fade out Events & transition into next section (Sponsors/Speakers)
        tl.to(
          eventsWrapper,
          {
            opacity: 0,
            scale: 0.9,
            pointerEvents: "none",
            duration: 0.4,
            ease: "power2.in",
          },
          5.75,
        );

        if (transition) {
          tl.to(
            transition,
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.42,
              ease: "power2.out",
            },
            5.75,
          );
        }

        // 6. Image panel smooth exit transition
        tl.to(
          imagePanel,
          {
            x: `-${travelPct + 18}%`,
            y: `-${travelPct + 18}%`,
            scale: isMobile ? 0.52 : 0.35,
            rotate: 8,
            filter: "blur(16px)",
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
          },
          5.85,
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

      {/* 3D Virtual Scroll Events Popup */}
      <Events3DScene
        wrapperRef={eventsWrapperRef}
        sceneRef={sceneRef}
        captionRef={captionRef}
        itemsRef={itemsRef}
      />

      <div className="story-transition" ref={transitionRef} aria-hidden="true">
        <span className="story-transition-label">NEXT / PARTNERS</span>
        <span className="story-transition-orbit" />
        <span className="story-transition-line" />
      </div>
    </section>
  );
}
