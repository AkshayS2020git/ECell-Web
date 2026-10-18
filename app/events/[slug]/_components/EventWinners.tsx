"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { EventDetailData } from "@/src/content/events";

interface EventWinnersProps {
  winners: EventDetailData["winners"];
}

export default function EventWinners({ winners }: EventWinnersProps): React.ReactElement {
  const [activeWinnerIndex, setActiveWinnerIndex] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const winnersList = winners?.items ?? [];
  const winnerBadges = winners?.badges ?? [];
  const safeWinnerIndex = activeWinnerIndex >= winnersList.length ? 0 : activeWinnerIndex;
  const currentWinner = winnersList[safeWinnerIndex] || winnersList[0];

  const handlePrevWinner = useCallback(() => {
    if (winnersList.length === 0) return;
    setActiveWinnerIndex((prev) => (prev - 1 + winnersList.length) % winnersList.length);
  }, [winnersList.length]);

  const handleNextWinner = useCallback(() => {
    if (winnersList.length === 0) return;
    setActiveWinnerIndex((prev) => (prev + 1) % winnersList.length);
  }, [winnersList.length]);

  // Keyboard navigation for winners spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (isTyping) return;
      if (e.key === "ArrowLeft") handlePrevWinner();
      if (e.key === "ArrowRight") handleNextWinner();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevWinner, handleNextWinner]);

  // Touch swipe support on winner card
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNextWinner();
      } else {
        handlePrevWinner();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  return (
    <section className="winners-section" id="winners">
      <div className="winners-section__inner">
        <div className="winners-section__top">
          <div className="winners-section__head">
            <p className="eyebrow eyebrow--gold">
              <span className="eyebrow__rule eyebrow__rule--gold" />
              Results &amp; Hall of Fame
            </p>

            <h2 className="winners-section__headline">
              {winners?.headline || "Champions."}
              {winners?.accent && (
                <span className="hero__accent">{winners?.accent}</span>
              )}
            </h2>
            {winners?.subhead && (
              <p className="winners-section__subhead">{winners?.subhead}</p>
            )}
          </div>

          {/* Nav controls: Counter, Tabs, Arrows (like Previous Speakers) */}
          {winnersList.length > 0 && (
            <div className="winners-nav-controls">
              <div className="winners-counter">
                <strong>{String(safeWinnerIndex + 1).padStart(2, "0")}</strong>
                <span>/</span>
                <span>{String(winnersList.length).padStart(2, "0")}</span>
              </div>

              <div className="winners-tabs" role="tablist" aria-label="Winner navigation">
                {winnersList.map((winner, idx) => (
                  <button
                    key={winner.place}
                    type="button"
                    role="tab"
                    aria-selected={idx === safeWinnerIndex}
                    className={`winners-tab-btn ${idx === safeWinnerIndex ? "is-active" : ""}`}
                    onClick={() => setActiveWinnerIndex(idx)}
                  >
                    {winner.place}
                  </button>
                ))}
              </div>

              <div className="winners-arrows">
                <button
                  type="button"
                  className="winners-arrow-btn"
                  onClick={handlePrevWinner}
                  aria-label="Previous winner"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="winners-arrow-btn"
                  onClick={handleNextWinner}
                  aria-label="Next winner"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Single Rectangular Spotlight Box (One at a time) */}
        {currentWinner && (
          <div
            className="winner-spotlight-shell"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <article
              className={`winner-spotlight-box winner-spotlight-box--${safeWinnerIndex === 0
                ? "first"
                : safeWinnerIndex === 1
                  ? "second"
                  : "third"
                }`}
              key={currentWinner.place}
            >
              {/* Left Side: Rectangular Photo Space */}
              <div className="winner-spotlight__photo-space">
                {currentWinner.photo ? (
                  <Image
                    src={currentWinner.photo}
                    alt={currentWinner.photoCaption || `${currentWinner.teamName} Team Photo`}
                    fill
                    sizes="(max-width: 860px) 100vw, 55vw"
                    className="winner-photo-slot__image"
                  />
                ) : (
                  <div className="winner-photo-slot">
                    <div
                      className="winner-photo-slot__icon"
                      aria-hidden="true"
                    >
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <span className="winner-photo-slot__label">
                      {currentWinner.photoCaption || "Team Photo Space"}
                    </span>
                    <span className="winner-photo-slot__tag">
                      PHOTO SPACE RESERVED
                    </span>
                  </div>
                )}
              </div>

              {/* Right Side: Winner Information */}
              <div className="winner-spotlight__details">
                <div className="winner-spotlight__meta-row">
                  {currentWinner.badge && (
                    <span className="winner-spotlight__badge-title">
                      {currentWinner.badge}
                    </span>
                  )}
                </div>

                <h3 className="winner-spotlight__team-name">
                  {currentWinner.teamName}
                </h3>

                <p className="winner-spotlight__project-name">
                  {currentWinner.projectTitle}
                </p>

                {currentWinner.description && (
                  <p className="winner-spotlight__desc">
                    {currentWinner.description}
                  </p>
                )}

                {winnerBadges.length > 0 && (
                  <div className="winner-spotlight__footer-badges">
                    {winnerBadges.map((badge) => (
                      <span className="winner-spotlight__foot-pill" key={badge}>
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
