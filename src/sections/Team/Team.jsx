"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import teamMembers from "./TeamData.js";
import {
  setupTeamAnimations,
  setupTeamScroll,
  selectMember,
  getIsAnimating,
  cleanupTeamAnimations,
} from "./TeamAnimations";
import "./Team.css";
import "./TeamLayout.css";
import "./TeamResponsive.css";

export default function Team() {
  const teamRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const stackRef = useRef(null);
  const cardRefs = useRef([]);

  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Always start at index 0 (Advisory Head - Vanshaj)
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const cleanupScroll = setupTeamScroll({ teamRef });
    return () => {
      cleanupScroll?.();
      cleanupTeamAnimations();
    };
  }, []);

  const navigateMember = useCallback((direction) => {
    if (getIsAnimating && getIsAnimating()) return;

    const total = teamMembers.length;
    const targetIndex =
      direction === "next"
        ? (activeIndex + 1) % total
        : (activeIndex - 1 + total) % total;

    selectMember(targetIndex, {
      cardRefs: cardRefs.current,
      activeIndex,
      onComplete: (newIndex) => {
        setActiveIndex(newIndex);
      },
    });
  }, [activeIndex]);

  const selectMemberDirect = useCallback((targetIndex) => {
    if (targetIndex === activeIndex) return;
    if (getIsAnimating && getIsAnimating()) return;

    selectMember(targetIndex, {
      cardRefs: cardRefs.current,
      activeIndex,
      onComplete: (newIndex) => {
        setActiveIndex(newIndex);
      },
    });
  }, [activeIndex]);

  useEffect(() => {
    setupTeamAnimations({
      cardRefs: cardRefs.current,
      activeIndex,
    });
  }, [activeIndex]);

  // Keyboard navigation (Left / Right Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        navigateMember("prev");
      } else if (e.key === "ArrowRight") {
        navigateMember("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigateMember]);

  // Touch Swipe Gesture Navigation for Mobile Devices
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger horizontal swipe if swipe distance is > 35px and more horizontal than vertical
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0) {
        navigateMember("next");
      } else {
        navigateMember("prev");
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <section ref={teamRef} className="team" id="teamSection">
      <div className="team__transition-wipe" aria-hidden="true" />
      <div ref={containerRef} className="team__container">
        {/* Header bar with Slider Navigation Controls */}
        <div className="team__header">
          <div className="team__header-title">
            <span className="team__label-mark">ECELL / LEADERSHIP</span>
            <h2 className="team__section-title">Meet the team<span className="team__section-title-dot">.</span></h2>
            <div className="team__header-meta">
              <p className="team__intro">The people building a stronger home for ideas, ambition, and action.</p>
              <div className="team__counter" aria-label={`Team member ${activeIndex + 1} of ${teamMembers.length}`}>
                <span className="team__counter-current">{String(activeIndex + 1).padStart(2, "0")}</span>
                <span className="team__counter-divider">/</span>
                <span className="team__counter-total">{String(teamMembers.length).padStart(2, "0")}</span>
              </div>
            </div>
          </div>

          {/* Slider Controls (Prev & Next Buttons + Dots) */}
          <div className="team__slider-controls">
            {/* Pagination Dots */}
            <div className="team__dots">
              {teamMembers.map((_, idx) => (
                <button
                  key={idx}
                  className={`team__dot ${idx === activeIndex ? "team__dot--active" : ""}`}
                  onClick={() => selectMemberDirect(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Slider Buttons */}
            <div className="team__slider-nav">
              <button
                className="team__slider-btn team__slider-btn--prev"
                onClick={() => navigateMember("prev")}
                aria-label="Previous team member"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                className="team__slider-btn team__slider-btn--next"
                onClick={() => navigateMember("next")}
                aria-label="Next team member"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div ref={stageRef} className="team__stage">
          <div
            ref={stackRef}
            className="team__stack"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {teamMembers.map((member, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={member.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className="team__card"
                  data-index={index}
                  data-active={isActive}
                >
                  <div className="team__image-wrapper">
                    <div className="team__image">
                      <img
                        src={typeof member.image === "string" ? member.image : member.image?.src || member.image}
                        alt={member.name}
                        loading={isActive ? "eager" : "lazy"}
                        style={member.imagePosition ? { objectPosition: member.imagePosition } : undefined}
                        draggable="false"
                      />
                      {/* LinkedIn overlay badge */}
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="team__linkedin-link"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        <svg
                          className="team__linkedin-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="20"
                          height="20"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="team__content">
                    <span className="team__role">{member.role}</span>
                    <h3 className="team__title">{member.name}</h3>
                    <p className="team__description">{member.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
