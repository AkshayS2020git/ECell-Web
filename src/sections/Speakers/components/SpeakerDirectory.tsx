"use client";

import React, { RefObject } from "react";
import Image from "next/image";
import type { Speaker } from "./Speakers";

interface SpeakerDirectoryProps {
  speakers: Speaker[];
  activeIndex: number;
  onSelect: (index: number) => void;
  deckStripRef: RefObject<HTMLDivElement | null>;
  activeDeckCardRef: RefObject<HTMLButtonElement | null>;
}

export default function SpeakerDirectory({
  speakers,
  activeIndex,
  onSelect,
  deckStripRef,
  activeDeckCardRef,
}: SpeakerDirectoryProps): React.ReactElement {
  return (
    <div className="speaker-deck-wrapper" aria-label="Speaker directory navigation">
      <div className="speaker-deck-header">
        <h4 className="speaker-deck-title">SPEAKER DIRECTORY</h4>
        <span className="speaker-deck-hint">Click card or use arrow keys (← / →)</span>
      </div>

      <div className="speaker-deck-scroll-container">
        <div ref={deckStripRef} className="speaker-deck-strip" role="tablist">
          {speakers.map((speaker, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={speaker.id}
                ref={isActive ? activeDeckCardRef : null}
                type="button"
                role="tab"
                onClick={() => onSelect(index)}
                className={`speaker-deck-card ${isActive ? "active" : ""}`}
                aria-label={`Select speaker ${speaker.name} (${speaker.role} at ${speaker.company})`}
                aria-selected={isActive}
              >
                <div
                  className="deck-card-shell"
                  style={{
                    "--deck-accent": speaker.accentColor || "rgba(142, 220, 255, 0.85)",
                  } as React.CSSProperties}
                >
                  <div className="deck-card-photo-wrapper">
                    <Image
                      src={speaker.photo}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 768px) 70px, 240px"
                      style={{ objectPosition: speaker.photoPosition || "center" }}
                    />
                    <div className="deck-card-photo-gradient" />
                    {isActive && <div className="deck-card-active-indicator" />}
                  </div>
                  <div className="deck-card-info">
                    <span className="deck-speaker-name">{speaker.name}</span>
                    <span className="deck-speaker-role">{speaker.role}</span>
                    <span className="deck-speaker-company">{speaker.company}</span>
                  </div>
                  <span className="deck-card-tag">{speaker.tag}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

