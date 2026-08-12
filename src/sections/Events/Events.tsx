"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "../../utils/gsapSetup";
import talkStartupWithMe from "../../assets/events/TalkStartupWithMe.webp";
import winterTechTalk from "../../assets/events/WinterTechTalk.webp";
import argonyx from "../../assets/events/argonyx.webp";
import argonyx2 from "../../assets/events/argoynx2.jpg";
import teamBg from "../../assets/events/team.jpeg";
import "./Events.css";
import Image, { StaticImageData } from "next/image";

export interface GalleryItem {
  caption: string;
  src: StaticImageData | string;
  alt: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    caption: "Argonyx Hackathon - September 2025",
    src: argonyx,
    alt: "Workshop",
  },
  {
    caption: "Winter Tech Talk - Winter 2025",
    src: winterTechTalk,
    alt: "Founders Panel",
  },
  {
    caption: "Talk Startup With Me - Spring 2026",
    src: talkStartupWithMe,
    alt: "Hackathon",
  },
  {
    caption: "Argonyx Hackathon - September 2025",
    src: argonyx2,
    alt: "Argonyx 2.0 event",
  },
];

export default function Events(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const captionRef = useRef<HTMLDivElement | null>(null);
  const transitionRef = useRef<HTMLDivElement | null>(null);
  const exitGlowRef = useRef<HTMLDivElement | null>(null);
  const bgPanelRef = useRef<HTMLDivElement | null>(null);
  const bgInnerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const items = itemsRef.current.filter((item): item is HTMLDivElement => Boolean(item));
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const caption = captionRef.current;
    const intro = introRef.current;
    const gallery = galleryRef.current;
    const transition = transitionRef.current;
    const exitGlow = exitGlowRef.current;
    const bgPanel = bgPanelRef.current;
    const bgInner = bgInnerRef.current;
    if (!section || !scene || !caption || !items.length) return undefined;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const zSpacing = 1500;

    items.forEach((item, index) => {
      const isRightSide = index % 2 === 0;
      const xOffset = isRightSide
        ? isMobile ? "20%" : "35%"
        : isMobile ? "-20%" : "-35%";
      const zOffset = -(index * zSpacing);

      item.dataset.z = `${zOffset}`;
      item.style.transform = `translate3d(${xOffset}, 0px, ${zOffset}px)`;
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      caption.textContent = GALLERY_ITEMS[0].caption;
      if (bgPanel) gsap.set(bgPanel, { x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" });
      if (intro) gsap.set(intro, { autoAlpha: 1 });
      return undefined;
    }

    const camera = { z: 0 };
    let activeIndex = -1;
    const updateScene = () => {
      scene.style.transform = `translateZ(${camera.z}px)`;
      let nearest = 0;
      let nearestDistance = Infinity;

      items.forEach((item, index) => {
        const relativeZ = Number(item.dataset.z) + camera.z;
        item.style.opacity = `${Math.max(0, Math.min(1, 1 - Math.abs(relativeZ) / 2800))}`;
        if (relativeZ <= 300 && Math.abs(relativeZ) < nearestDistance) {
          nearest = index;
          nearestDistance = Math.abs(relativeZ);
        }
      });

      if (nearest !== activeIndex) {
        activeIndex = nearest;
        caption.textContent = GALLERY_ITEMS[nearest].caption;
      }
    };

    const ctx = gsap.context(() => {
      /* ----------------------------------------------------------
         Phase 0: Transition wipe from previous section
         ---------------------------------------------------------- */
      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 95%",
          end: "top 28%",
          scrub: 0.7,
        },
      });

      entrance.fromTo(
        transition,
        { autoAlpha: 1, scaleY: 1, transformOrigin: "top center" },
        { autoAlpha: 0, scaleY: 0, ease: "power4.inOut" },
        0
      );

      /* ----------------------------------------------------------
         Main pinned timeline — 3 phases
         ---------------------------------------------------------- */
      const journey = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=520%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      /* ----------------------------------------------------------
         Phase 1: Background image flies in from top-right to center
         (duration 0 → 1.0)
         ---------------------------------------------------------- */
      if (bgPanel) {
        // Initial state: off-screen top-right, blurred, rotated, scaled down
        gsap.set(bgPanel, {
          xPercent: 100,
          yPercent: -100,
          scale: isMobile ? 0.7 : 0.75,
          rotate: -8,
          filter: "blur(16px) brightness(0.6)",
          borderRadius: isMobile ? "24px" : "36px",
          opacity: 0.85,
        });

        if (bgInner) {
          gsap.set(bgInner, { scale: 1.3, x: "-8%", y: "8%" });
        }

        // Animate to fullscreen center
        journey.to(
          bgPanel,
          {
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            rotate: 0,
            filter: "blur(0px) brightness(1)",
            borderRadius: "0px",
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
          },
          0
        );

        if (bgInner) {
          journey.to(
            bgInner,
            {
              scale: 1.05,
              x: "0%",
              y: "0%",
              duration: 1.0,
              ease: "power3.out",
            },
            0
          );
        }
      }

      /* ----------------------------------------------------------
         Phase 2: Intro text reveals with scroll
         (duration 0.8 → 1.4)
         ---------------------------------------------------------- */
      if (intro) {
        journey.fromTo(
          intro,
          { autoAlpha: 0, y: 40, filter: "blur(6px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.5,
            ease: "power2.out",
          },
          0.8
        );
      }

      /* ----------------------------------------------------------
         Phase 2b: Gallery fades in
         (duration 0.9 → 1.4)
         ---------------------------------------------------------- */
      if (gallery) {
        journey.fromTo(
          gallery,
          { autoAlpha: 0, scale: 0.82, yPercent: 12 },
          { autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.5, ease: "power2.out" },
          0.9
        );
      }

      /* ----------------------------------------------------------
         Phase 3: 3D gallery camera flythrough (existing behavior)
         (duration 1.4 → 5.4)
         ---------------------------------------------------------- */
      journey.to(camera, {
        z: (GALLERY_ITEMS.length - 1) * zSpacing + 800,
        duration: 4,
        ease: "none",
        onUpdate: updateScene,
      }, 1.4);

      /* ----------------------------------------------------------
         Exit animations — gallery & text fade out,
         background image STAYS visible for a seamless transition
         ---------------------------------------------------------- */
      journey.to(
        gallery,
        {
          autoAlpha: 0,
          scale: 0.92,
          yPercent: -8,
          filter: "blur(10px)",
          duration: 0.7,
          ease: "power2.in",
        },
        5.0
      );

      journey.to(
        intro,
        {
          autoAlpha: 0,
          yPercent: -20,
          filter: "blur(4px)",
          duration: 0.5,
          ease: "power2.in",
        },
        4.9
      );

      journey.to(
        caption,
        {
          autoAlpha: 0,
          y: 20,
          filter: "blur(4px)",
          duration: 0.5,
          ease: "power2.in",
        },
        4.9
      );

      // Background image stays — no fade-out. Just a subtle slow zoom
      // for a cinematic lingering feel as content exits.
      if (bgInner) {
        journey.to(
          bgInner,
          {
            scale: 1.12,
            duration: 1.0,
            ease: "none",
          },
          4.8
        );
      }

      if (exitGlow) {
        journey.fromTo(
          exitGlow,
          { autoAlpha: 0, scaleX: 0.7 },
          { autoAlpha: 1, scaleX: 1.2, duration: 0.8, ease: "power1.out" },
          5.0
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="events-section" ref={sectionRef} id="eventsSection">
      {/* Background image panel — flies in from top-right */}
      <div className="events-bg-panel" ref={bgPanelRef}>
        <div className="events-bg-inner" ref={bgInnerRef}>
          <Image
            src={teamBg}
            alt="ECell team background"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
        <div className="grain" />
      </div>

      <div className="events-transition-wipe" ref={transitionRef} aria-hidden="true" />
      <div className="events-intro" ref={introRef} aria-hidden="true">
        <span>ECELL</span>
        <h2>Our Events</h2>
      </div>
      <div className="events-3d-wrapper" ref={galleryRef}>
        <div className="events-caption-container">
          <div className="events-caption-text" ref={captionRef} id="active-caption">
            Scroll Down to Explore
          </div>
        </div>

        <div className="events-scene" ref={sceneRef} id="scene">
          {GALLERY_ITEMS.map((item, idx) => {
            return (
              <div
                key={idx}
                className="events-gallery-item"
                data-caption={item.caption}
                ref={(el) => {
                  itemsRef.current[idx] = el;
                }}
              >
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 80vw, 32vw" style={{ objectFit: "cover" }} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="events-exit-glow" ref={exitGlowRef} aria-hidden="true" />
    </section>
  );
}
