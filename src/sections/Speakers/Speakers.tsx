"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "../../utils/gsapSetup";
import ambikaPhoto from "../../assets/prevSpeakers/ambika.jpg";
import arshdeepPhoto from "../../assets/prevSpeakers/arshdeep.jpg";
import guhaPhoto from "../../assets/prevSpeakers/guha.png";
import harpreetPhoto from "../../assets/prevSpeakers/harpreet.jpg";
import shariffPhoto from "../../assets/prevSpeakers/shariff.jpg";
import "./Speakers.css";
import Image, { StaticImageData } from "next/image";

export interface Speaker {
  id: number;
  name: string;
  role: string;
  company: string;
  tag: string;
  photo: StaticImageData | string;
  photoPosition?: string;
}

const SPEAKERS_LIST: Speaker[] = [
  {
    id: 1,
    name: "Harpreet Sohan",
    role: "Product Architect",
    company: "Decodes",
    tag: "Product",
    photo: harpreetPhoto,
    photoPosition: "82% center",
  },
  {
    id: 2,
    name: "Mustafa Shariff",
    role: "Founder",
    company: "Bengaluru Health Community",
    tag: "Entrepreneurship",
    photo: shariffPhoto,
  },
  {
    id: 4,
    name: "Arshdeep Singh",
    role: "Founder & CEO",
    company: "Edock, Decodes",
    tag: "Leadership",
    photo: arshdeepPhoto,
    photoPosition: "78% center",
  },
  {
    id: 6,
    name: "Ambika J",
    role: "IEEE Senior Member, Solution Architect",
    company: "Finastra",
    tag: "Technology",
    photo: ambikaPhoto,
  },
  {
    id: 7,
    name: "Biplab Guha",
    role: "Entrepreneur",
    company: "Stealth Mode",
    tag: "Entrepreneurship",
    photo: guhaPhoto,
  },
];

export default function Speakers(): React.ReactElement {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const speakersSectionRef = useRef<HTMLElement | null>(null);
  const cardStageRef = useRef<HTMLDivElement | null>(null);
  const transitionLightRef = useRef<HTMLDivElement | null>(null);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SPEAKERS_LIST.length) % SPEAKERS_LIST.length);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SPEAKERS_LIST.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isTyping = target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (isTyping) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  // Section reveal animation with GSAP ScrollTrigger
  useEffect(() => {
    const section = speakersSectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 92%",
            end: "top 42%",
            scrub: 0.8,
          },
        }
      );

      const bloomTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 90%",
          end: "top 24%",
          scrub: 0.5,
        },
      });

      bloomTimeline
        .fromTo(
          ".speakers-headline",
          { opacity: 0, scaleX: 0.52, transformOrigin: "left center" },
          { opacity: 1, scaleX: 1.1, duration: 0.62, ease: "power3.out" }
        )
        .to(
          ".speakers-headline",
          { scaleX: 1, duration: 0.42, ease: "power3.out" }
        )
        .fromTo(
          cardStageRef.current,
          { opacity: 0, scale: 0.74, y: 44, transformOrigin: "center center" },
          { opacity: 1, scale: 1.12, y: 0, duration: 0.68, ease: "back.out(1.35)" },
          "-=0.52"
        )
        .to(
          cardStageRef.current,
          { scale: 1, duration: 0.52, ease: "power3.out" }
        );

      if (transitionLightRef.current) {
        gsap.fromTo(
          transitionLightRef.current,
          { opacity: 0, scale: 0.45, rotate: -12, y: -40 },
          {
            opacity: 0.9,
            scale: 1.2,
            rotate: 8,
            y: 20,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 100%",
              end: "top 28%",
              scrub: 0.8,
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const pad2 = (n: number) => String(n).padStart(2, "0");

  return (
    <section ref={speakersSectionRef} className="speakers-section" id="speakers" aria-labelledby="speakers-heading">
      <div ref={transitionLightRef} className="speakers-transition-light" aria-hidden="true" />
      <div className="wrap">
        <div className="speakers-header">
          <div className="speakers-header-left">
            <span className="eyebrow">PREVIOUS SPEAKERS</span>
            <h2 id="speakers-heading" className="speakers-headline">Voices of Innovation</h2>
          </div>

          <div className="speakers-nav-controls">
            <span className="speakers-counter">
              <strong aria-live="polite">{pad2(activeIndex + 1)}</strong> / {pad2(SPEAKERS_LIST.length)}
            </span>
            <button
              onClick={handlePrev}
              className="speakers-arrow-btn"
              aria-label="Previous speaker"
              type="button"
            >
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="speakers-arrow-btn"
              aria-label="Next speaker"
              type="button"
            >
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div ref={cardStageRef} className="speaker-cards-stage">
          {SPEAKERS_LIST.map((speaker, index) => {
            const offset = (index - activeIndex + SPEAKERS_LIST.length) % SPEAKERS_LIST.length;
            let normOffset = offset;
            if (normOffset > SPEAKERS_LIST.length / 2) {
              normOffset -= SPEAKERS_LIST.length;
            }

            const isActive = index === activeIndex;
            const absOffset = Math.abs(normOffset);

            const translateX = normOffset * 140;
            const rotateY = normOffset * -12;
            const rotateZ = normOffset * 3;
            const scale = isActive ? 1.05 : Math.max(0.78, 1 - absOffset * 0.12);
            const opacity = isActive ? 1 : Math.max(0.25, 1 - absOffset * 0.35);
            const zIndex = 10 - absOffset;
            return (
              <div
                key={speaker.id}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveIndex(index);
                  }
                }}
                className={`speaker-card-item ${isActive ? "active" : ""} has-photo`}
                role="button"
                tabIndex={0}
                aria-label={`Show ${speaker.name}, ${speaker.role}`}
                aria-pressed={isActive}
                style={{
                  transform: `translateX(${translateX}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                }}
              >
                <Image
                  className="speaker-card-photo"
                  src={speaker.photo}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="240px"
                  style={{ objectPosition: speaker.photoPosition }}
                />
                <div className="speaker-card-inner">
                  <div className="speaker-card-top">
                    <span className="speaker-tag">{speaker.tag}</span>
                    <span className="speaker-num">#{pad2(index + 1)}</span>
                  </div>

                  <div className="speaker-card-details">
                    <h3 className="speaker-name">{speaker.name}</h3>
                    <p className="speaker-role-text">{speaker.role}</p>
                    <p className="speaker-company-text">{speaker.company}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
