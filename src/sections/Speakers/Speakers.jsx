import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Speakers.css";

gsap.registerPlugin(ScrollTrigger);

const SPEAKERS_LIST = [
  {
    id: 1,
    initials: "AR",
    name: "Ananya Rao",
    role: "Founder & CEO",
    company: "FinFlow Technologies",
    topic: "Scaling Fintech from 0 to 10M Users",
    quote: "Building a company isn't about having all the answers—it's about asking the right questions faster than anyone else.",
    tag: "Fintech",
  },
  {
    id: 2,
    initials: "KI",
    name: "Karthik Iyer",
    role: "General Partner",
    company: "Elevate Ventures",
    topic: "What Early-Stage VCs Look For in 2026",
    quote: "We don't bet on pitch decks; we bet on relentless founders who turn obstacles into leverage.",
    tag: "Venture Capital",
  },
  {
    id: 3,
    initials: "MN",
    name: "Meera Nair",
    role: "VP of Product",
    company: "ScaleGrid AI",
    topic: "Designing Products for the Next Billion Users",
    quote: "Great product design is invisible. It turns friction into effortless delight for every single user.",
    tag: "Product & AI",
  },
  {
    id: 4,
    initials: "RD",
    name: "Rohan Desai",
    role: "Co-Founder",
    company: "Kraft & Co",
    topic: "Bootstrapping a D2C Brand to 50Cr Revenue",
    quote: "Customer love is the single most defensible moat your brand can build.",
    tag: "D2C & Brand",
  },
  {
    id: 5,
    initials: "DM",
    name: "Divya Menon",
    role: "Head of Growth",
    company: "CloudNative Inc.",
    topic: "Product-Led Growth Engines for SaaS",
    quote: "Growth is a discipline of relentless experimentation coupled with deep user empathy.",
    tag: "SaaS & Growth",
  },
];

export default function Speakers() {
  const [activeIndex, setActiveIndex] = useState(2);
  const speakersSectionRef = useRef(null);
  const cardStageRef = useRef(null);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + SPEAKERS_LIST.length) % SPEAKERS_LIST.length);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SPEAKERS_LIST.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
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

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const currentSpeaker = SPEAKERS_LIST[activeIndex];
  const pad2 = (n) => String(n).padStart(2, "0");

  return (
    <section ref={speakersSectionRef} className="speakers-section" id="speakers">
      <div className="wrap">
        <div className="speakers-header">
          <div className="speakers-header-left">
            <span className="eyebrow">PREVIOUS SPEAKERS</span>
            <h2 className="speakers-headline">Voices of Innovation</h2>
          </div>

          {/* Navigation Controls with Arrow Buttons */}
          <div className="speakers-nav-controls">
            <span className="speakers-counter">
              <strong>{pad2(activeIndex + 1)}</strong> / {pad2(SPEAKERS_LIST.length)}
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

        {/* Dynamic Card Stage / Fan View */}
        <div ref={cardStageRef} className="speaker-cards-stage">
          {SPEAKERS_LIST.map((speaker, index) => {
            const offset = (index - activeIndex + SPEAKERS_LIST.length) % SPEAKERS_LIST.length;
            let normOffset = offset;
            if (normOffset > SPEAKERS_LIST.length / 2) {
              normOffset -= SPEAKERS_LIST.length;
            }

            const isActive = index === activeIndex;
            const absOffset = Math.abs(normOffset);

            // Compute 3D stacked layout properties
            const translateX = normOffset * 140; // horizontal separation
            const rotateY = normOffset * -12; // 3D rotation
            const rotateZ = normOffset * 3; // slight fan tilt
            const scale = isActive ? 1.05 : Math.max(0.78, 1 - absOffset * 0.12);
            const opacity = isActive ? 1 : Math.max(0.25, 1 - absOffset * 0.35);
            const zIndex = 10 - absOffset;

            return (
              <div
                key={speaker.id}
                onClick={() => setActiveIndex(index)}
                className={`speaker-card-item ${isActive ? "active" : ""}`}
                style={{
                  transform: `translateX(${translateX}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                }}
              >
                <div className="speaker-card-inner">
                  <div className="speaker-card-top">
                    <span className="speaker-tag">{speaker.tag}</span>
                    <span className="speaker-num">#{pad2(index + 1)}</span>
                  </div>

                  <div className="speaker-avatar-circle">
                    {speaker.initials}
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
