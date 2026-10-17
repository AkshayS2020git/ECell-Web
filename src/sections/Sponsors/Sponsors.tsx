"use client";
import React, { useState, useEffect, useRef } from "react";
import { SPONSORS } from "@/src/content/sponsors";
import { setupSponsorsAnimations } from "./animations/SponsorsAnimations";
import ConstellationNetwork from "./components/ConstellationNetwork";
import SponsorCard from "./components/SponsorCard";
import StarField from "./components/StarField";
import "./Sponsors.css";

const SPONSOR_ROWS = [
  SPONSORS.slice(0, 3),
  SPONSORS.slice(3, 8),
  SPONSORS.slice(8, 15),
  SPONSORS.slice(15, 20),
  SPONSORS.slice(20, 23),
];

export default function Sponsors(): React.ReactElement {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const sponsorsSectionRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const constellationRef = useRef<HTMLDivElement | null>(null);
  const wipeBarRef = useRef<HTMLDivElement | null>(null);

  // Decorative CSS loops (twinkling stars, planet drift, sun rays) pause
  // whenever the section is off screen, so they cost nothing elsewhere.
  useEffect(() => {
    const section = sponsorsSectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => section.classList.toggle("is-offscreen", !entry.isIntersecting),
      { rootMargin: "100px 0px" }
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const section = sponsorsSectionRef.current;
    if (!section) return;
    return setupSponsorsAnimations({
      section,
      header: headerRef.current,
      constellation: constellationRef.current,
      glow: glowRef.current,
      wipeBar: wipeBarRef.current,
    });
  }, []);

  return (
    <section ref={sponsorsSectionRef} className="sponsors-section" id="sponsors">
      {/* Constellation Emergence transition elements */}
      <div ref={wipeBarRef} className="section-wipe-bar" aria-hidden="true" />
      <div ref={glowRef} className="sponsors-glow" />
      <div className="sponsors-divider-line" />

      {/* Morphic Conduit Spine & Horizon Divider */}
      <div className="morphic-central-spine" aria-hidden="true" />
      <div className="morphic-horizon-divider" aria-hidden="true" />

      {/* Constellation Backdrop Star Field */}
      <StarField />

      <div ref={headerRef} className="wrap sponsors-header">
        <div className="sponsors-badge-container">
          <span className="sponsors-kicker">SUPPORTED BY</span>
        </div>
        <h2 className="sponsors-headline" aria-label="Partners &amp; Sponsors">
          <span className="sponsors-headline-word sponsors-word-left">Partners</span>
          <span className="sponsors-headline-amp" aria-hidden="true">&amp;</span>
          <span className="sponsors-headline-word sponsors-word-right">Sponsors</span>
        </h2>
        <p className="sponsors-intro">
          The organisations helping us turn ideas into action.
        </p>
      </div>

      <div ref={constellationRef} className="wrap constellation-container">
        {/* Constellation Vector Network mapped across the grid */}
        <ConstellationNetwork hoveredNode={hoveredNode} />

        {/* Sponsor rows: 3 / 5 / 6 / 5 / 3 logos */}
        <div className="constellation-grid">
          {SPONSOR_ROWS.map((row, rowIndex) => (
            <div className={`constellation-row row-${rowIndex + 1}`} key={rowIndex}>
              {row.map((item) => (
                <div className="constellation-col" key={item.id}>
                  <div className={`constellation-node ${item.id}`}>
                    <SponsorCard
                      item={item}
                      isHovered={hoveredNode === item.id}
                      onMouseEnter={() => setHoveredNode(item.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
