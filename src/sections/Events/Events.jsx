"use client";
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from "../../utils/gsapSetup";
import talkStartupWithMe from '../../assets/events/TalkStartupWithMe.webp';
import winterTechTalk from '../../assets/events/WinterTechTalk.webp';
import argonyx from '../../assets/events/argonyx.webp';
import argonyx2 from '../../assets/events/argoynx2.jpg';
import './Events.css';

const GALLERY_ITEMS = [
  {
    caption: 'Argonyx Hackathon - September 2025',
    src: argonyx,
    alt: 'Workshop',
  },
  {
    caption: 'Winter Tech Talk - Winter 2025',
    src: winterTechTalk,
    alt: 'Founders Panel',
  },
  {
    caption: 'Talk Startup With Me - Spring 2026',
    src: talkStartupWithMe,
    alt: 'Hackathon',
  },
  {
    caption: 'Argonyx Hackathon - September 2025',
    src: argonyx2,
    alt: 'Argonyx 2.0 event',
  },
];

export default function Events() {
  const sectionRef = useRef(null);
  const introRef = useRef(null);
  const galleryRef = useRef(null);
  const sceneRef = useRef(null);
  const captionRef = useRef(null);
  const transitionRef = useRef(null);
  const exitGlowRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const items = itemsRef.current.filter(Boolean);
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const caption = captionRef.current;
    const intro = introRef.current;
    const gallery = galleryRef.current;
    const transition = transitionRef.current;
    const exitGlow = exitGlowRef.current;
    if (!section || !scene || !caption || !items.length) return undefined;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const zSpacing = 1500;

    items.forEach((item, index) => {
      const isRightSide = index % 2 === 0;
      const xOffset = isRightSide
        ? isMobile ? '20%' : '35%'
        : isMobile ? '-20%' : '-35%';
      const zOffset = -(index * zSpacing);

      item.dataset.z = zOffset;
      item.style.transform = `translate3d(${xOffset}, 0px, ${zOffset}px)`;
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      caption.textContent = GALLERY_ITEMS[0].caption;
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
      const entrance = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 95%',
          end: 'top 28%',
          scrub: 0.7,
        },
      });

      entrance
        .fromTo(
          transition,
          { autoAlpha: 1, scaleY: 1, transformOrigin: 'top center' },
          { autoAlpha: 0, scaleY: 0, ease: 'power4.inOut' },
          0,
        )
        .fromTo(intro, { autoAlpha: 0, xPercent: -18 }, { autoAlpha: 1, xPercent: 0, ease: 'none' }, 0)
        .fromTo(gallery, { autoAlpha: 0, scale: 0.82, yPercent: 12 }, { autoAlpha: 1, scale: 1, yPercent: 0, ease: 'none' }, 0.08);

      const journey = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=420%',
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      journey
        .to(camera, {
          z: (GALLERY_ITEMS.length - 1) * zSpacing + 800,
          duration: 4,
          ease: 'none',
          onUpdate: updateScene,
        })
        .to(
          gallery,
          {
            autoAlpha: 0,
            scale: 0.88,
            yPercent: -12,
            filter: 'blur(8px)',
            duration: 0.65,
            ease: 'power2.in',
          },
          3.75
        )
        .to(
          intro,
          {
            autoAlpha: 0,
            yPercent: -15,
            duration: 0.5,
            ease: 'power2.in',
          },
          3.6
        )
        .to(
          caption,
          {
            autoAlpha: 0,
            y: 15,
            duration: 0.5,
            ease: 'power2.in',
          },
          3.6
        );

      if (exitGlow) {
        journey.fromTo(
          exitGlow,
          { autoAlpha: 0, scaleX: 0.7 },
          { autoAlpha: 1, scaleX: 1.1, duration: 0.7, ease: 'power1.out' },
          3.5
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="events-section" ref={sectionRef} id="eventsSection">
      <div className="events-transition-wipe" ref={transitionRef} aria-hidden="true" />
      <div className="events-intro" ref={introRef} aria-hidden="true">
        <span>ECELL / EVENTS</span>
        <h2>Moments that move ideas forward</h2>
      </div>
      <div className="events-3d-wrapper" ref={galleryRef}>
        <div className="events-caption-container">
          <div className="events-caption-text" ref={captionRef} id="active-caption">
            Scroll Down to Explore
          </div>
        </div>

        <div className="events-scene" ref={sceneRef} id="scene">
          {GALLERY_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="events-gallery-item"
              data-caption={item.caption}
              ref={(el) => (itemsRef.current[idx] = el)}
            >
              <img src={typeof item.src === 'string' ? item.src : item.src?.src || item.src} alt={item.alt} />
            </div>
          ))}
        </div>
      </div>
      <div className="events-exit-glow" ref={exitGlowRef} aria-hidden="true" />
    </section>
  );
}
