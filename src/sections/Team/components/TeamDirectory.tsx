"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import type { TeamMember } from "../data/TeamData";

interface TeamDirectoryProps {
  members: TeamMember[];
  activeIndex: number;
  spotlightIndex?: number | null;
  onSelect: (index: number) => void;
}

function getMemberAccent(member: TeamMember): string {
  const explicitAccents: Record<string, string> = {
    "member-1": "#EF4444",
    "member-2": "#38BDF8",
    "member-3": "#F59E0B",
    "member-4": "#F472B6",
    "member-5": "#34D399",
    "member-6": "#3B82F6",
    "member-7": "#FB923C",
    "member-8": "#2DD4BF",
  };

  if (explicitAccents[member.id]) return explicitAccents[member.id];
  if (member.accentColor) return member.accentColor;

  const normalizedName = member.name.toLowerCase();
  if (normalizedName.includes("akash")) return "#3B82F6";
  if (normalizedName.includes("aryav")) return "#FB923C";

  const normalizedRole = member.role.toLowerCase();
  if (normalizedRole.includes("president")) return "#8edcff";
  if (normalizedRole.includes("advisory")) return "#b8a0ff";
  if (normalizedRole.includes("tech")) return "#3B82F6";
  if (normalizedRole.includes("pr")) return "#FB923C";
  if (normalizedRole.includes("partnership")) return "#ffc478";
  if (normalizedRole.includes("documentation")) return "#f1d27a";
  return "#c4c8d4";
}

export default function TeamDirectory({
  members,
  activeIndex,
  spotlightIndex = null,
  onSelect,
}: TeamDirectoryProps): React.ReactElement {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Smoothly scroll active card into view when activeIndex changes
  useEffect(() => {
    const activeCard = cardRefs.current[activeIndex];
    const strip = stripRef.current;
    if (activeCard && strip) {
      // Calculate scroll position to center the card within the strip
      // without using scrollIntoView which scrolls the entire page
      const cardLeft = activeCard.offsetLeft;
      const cardWidth = activeCard.offsetWidth;
      const stripWidth = strip.offsetWidth;
      const targetScroll = cardLeft - stripWidth / 2 + cardWidth / 2;
      strip.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (index + 1) % members.length;
      onSelect(nextIndex);
      cardRefs.current[nextIndex]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (index - 1 + members.length) % members.length;
      onSelect(prevIndex);
      cardRefs.current[prevIndex]?.focus();
    }
  };

  return (
    <div className="team-directory" aria-label="Team directory">
      <div className="team-directory__header">
        <div className="team-directory__header-left">
          <h3 className="team-directory__title">TEAM DIRECTORY</h3>
          <span className="team-directory__count">{members.length} Core Members</span>
        </div>

        <div className="team-directory__header-right">
          <span className="team-directory__hint">Select a member to view full profile</span>
        </div>
      </div>

      <div
        ref={stripRef}
        className="team-directory__strip"
        role="tablist"
        aria-label="Team members list"
      >
        {members.map((member, index) => {
          const isActive = index === activeIndex;
          const accentColor = getMemberAccent(member);
          const imagePosition = member.directoryImagePosition || "center center";

          return (
            <button
              key={member.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              aria-label={`Select ${member.name}, ${member.role}`}
              className={`team-directory__card ${isActive ? "is-active" : ""} ${spotlightIndex === index ? "is-spotlight" : ""}`}
              onClick={() => onSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              style={{ "--team-accent": accentColor } as React.CSSProperties}
            >
              <span className="team-directory__image">
                <Image
                  src={member.image}
                  alt={member.name}
                  className="team-directory__image-photo"
                  fill
                  sizes="(max-width: 768px) 180px, 240px"
                  style={{
                    objectFit: "cover",
                    objectPosition: imagePosition,
                  }}
                  draggable={false}
                />
                <span className="team-directory__image-overlay" aria-hidden="true" />


              </span>

              <span className="team-directory__info">
                <span className="team-directory__top-row">
                  <span className="team-directory__role-pill">{member.role}</span>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-directory__linkedin-btn"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`${member.name} LinkedIn Profile`}
                    tabIndex={0}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </span>

                <span className="team-directory__name">{member.name}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
