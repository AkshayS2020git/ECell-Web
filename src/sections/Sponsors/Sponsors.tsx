"use client";
import React, { useState, useEffect, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { gsap } from "../../utils/gsapSetup";
import attysLogo from "../../assets/logos/attys.webp";
import cubeLogo from "../../assets/logos/cube.webp";
import easyBitesLogo from "../../assets/logos/easybites.webp";
import herodyLogo from "../../assets/logos/herody.webp";
import justvendLogo from "../../assets/logos/justvend.webp";
import mercLogo from "../../assets/logos/merc.webp";
import mileLogo from "../../assets/logos/mile.webp";
import nokiaLogo from "../../assets/logos/nokia.webp";
import tvsLogo from "../../assets/logos/tvs.webp";
import waffleLogo from "../../assets/logos/waffle.svg";
import redbull from "../../assets/logos/redbull.png";
import "./Sponsors.css";

export interface SponsorItem {
  id: string;
  name: string;
  logo: StaticImageData | string;
  logoKey?: string;
  tier?: "featured" | "core";
}

const SPONSORS_CONSTELLATION: SponsorItem[] = [
  // Row 1: 2 items (North)
  { id: "node-nokia", name: "Nokia", logo: nokiaLogo, logoKey: "nokia", tier: "featured" },
  { id: "node-redbull", name: "Red Bull", logo: redbull, tier: "featured" },

  // Row 2: 4 items (Mid-North)
  { id: "node-waffle", name: "The Belgian Waffle Co.", logo: waffleLogo, tier: "core" },
  { id: "node-tvs", name: "TVS Prakruthi Bikes", logo: tvsLogo, tier: "core" },
  { id: "node-herody", name: "Herody", logo: herodyLogo, logoKey: "herody", tier: "featured" },
  { id: "node-merc", name: "Akshaya Motors", logo: mercLogo, tier: "featured" },

  // Row 3: 3 items (Mid-South)
  { id: "node-attys", name: "Atty's Bakery & Confectionery", logo: attysLogo, tier: "core" },
  { id: "node-cube", name: "Cube", logo: cubeLogo, tier: "core" },
  { id: "node-justvend", name: "Justvend", logo: justvendLogo, tier: "core" },

  // Row 4: 2 items (South Anchor)
  { id: "node-easybites", name: "EasyBites", logo: easyBitesLogo, tier: "core" },
  { id: "node-mile", name: "mile", logo: mileLogo, tier: "core" },
];

export default function Sponsors(): React.ReactElement {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const sponsorsSectionRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const constellationRef = useRef<HTMLDivElement | null>(null);

  const isConnected = (...nodes: string[]) => {
    if (!hoveredNode) return false;
    return nodes.includes(hoveredNode);
  };

  useEffect(() => {
    const section = sponsorsSectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      if (headerRef.current) gsap.set(headerRef.current, { opacity: 1, y: 0 });
      if (constellationRef.current) gsap.set(constellationRef.current, { opacity: 1, y: 0 });
      if (glowRef.current) gsap.set(glowRef.current, { opacity: 0.35, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Header reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          end: "top 30%",
          scrub: 0.8,
        },
      });

      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, ease: "power2.out" },
          0
        );
      }

      if (constellationRef.current) {
        tl.fromTo(
          constellationRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, ease: "power2.out" },
          0.1
        );
      }



      // Ambient radial glow expansion on scroll
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.6, opacity: 0 },
          {
            scale: 1.15,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 95%",
              end: "top 20%",
              scrub: 0.8,
            },
          }
        );
      }

      // Choreographed Constellation Sequence:
      // 1. Nodes appear first (dots)
      // 2. Lines draw themselves
      // 3. Cards fade/scale in
      // 4. Logos brighten
      const entryTl = gsap.timeline({
        scrollTrigger: {
          trigger: constellationRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // 1. Junction dots & stars pop in
      const dots = gsap.utils.toArray<SVGElement>(".constellation-junction-dot, .constellation-star");
      if (dots.length > 0) {
        entryTl.fromTo(
          dots,
          { opacity: 0, scale: 0 },
          {
            opacity: 0.7,
            scale: 1,
            duration: 0.3,
            stagger: 0.025,
            ease: "back.out(2)",
          },
          0
        );
      }

      // 2. Lines draw themselves
      const lines = gsap.utils.toArray<SVGPathElement>(".constellation-line-path");
      if (lines.length > 0) {
        entryTl.fromTo(
          lines,
          { strokeDashoffset: 600, opacity: 0 },
          {
            strokeDashoffset: 0,
            opacity: 0.35,
            duration: 0.6,
            stagger: 0.035,
            ease: "power2.inOut",
          },
          0.18
        );
      }

      // 3. Cards fade & scale in
      const cards = gsap.utils.toArray<HTMLElement>(".sponsor-card-inner");
      if (cards.length > 0) {
        entryTl.fromTo(
          cards,
          { opacity: 0, scale: 0.9, y: 16 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: "power3.out",
          },
          0.42
        );
      }

      // 4. Logos brighten
      const logos = gsap.utils.toArray<HTMLElement>(".sponsor-logo");
      if (logos.length > 0) {
        entryTl.fromTo(
          logos,
          { opacity: 0.25, filter: "brightness(0.5) contrast(0.85)" },
          {
            opacity: 1,
            filter: "brightness(1) contrast(1.02)",
            duration: 0.4,
            stagger: 0.025,
            ease: "power2.out",
          },
          0.65
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sponsorsSectionRef} className="sponsors-section" id="sponsors">
      <div ref={glowRef} className="sponsors-glow" />
      <div className="sponsors-divider-line" />

      {/* Constellation Backdrop Star Field */}
      <div className="constellation-star-field" aria-hidden="true">
        <span className="constellation-star star-1" />
        <span className="constellation-star star-2" />
        <span className="constellation-star star-3" />
        <span className="constellation-star star-4" />
        <span className="constellation-star star-5" />
        <span className="constellation-star star-6" />
      </div>

      <div ref={headerRef} className="wrap sponsors-header">
        <span className="sponsors-kicker">SUPPORTED BY</span>
        <h2 className="sponsors-headline">Partners &amp; Sponsors</h2>
        <p className="sponsors-intro">
          The organisations helping us turn ideas into action.
        </p>
      </div>

      <div ref={constellationRef} className="wrap constellation-container">
        {/* Constellation Vector Lines mapped to the intentional grid */}
        <svg
          className="constellation-svg"
          viewBox="0 0 1000 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(244, 244, 242, 0.04)" />
              <stop offset="50%" stopColor="rgba(244, 244, 242, 0.22)" />
              <stop offset="100%" stopColor="rgba(244, 244, 242, 0.04)" />
            </linearGradient>
          </defs>

          {/* Nokia down to Belgian Waffle */}
          <path
            d="M 290 115 V 160 H 190"
            className={`constellation-line-path${isConnected("node-nokia", "node-waffle") ? " is-active" : ""}`}
          />

          {/* Orthogonal connector: Center Hub (Herody) up to Red Bull */}
          <path
            d="M 625 185 V 70 H 685"
            className={`constellation-line-path${isConnected("node-herody", "node-redbull") ? " is-active" : ""}`}
          />

          {/* Cross connector: Belgian Waffle to TVS */}
          <path
            d="M 230 205 H 280"
            className={`constellation-line-path${isConnected("node-waffle", "node-tvs") ? " is-active" : ""}`}
          />

          {/* Cross connector: Herody to Mercedes */}
          <path
            d="M 720 205 H 770"
            className={`constellation-line-path${isConnected("node-herody", "node-merc") ? " is-active" : ""}`}
          />

          {/* Step connector: TVS down to Atty's */}
          <path
            d="M 375 240 V 325 H 330"
            className={`constellation-line-path${isConnected("node-tvs", "node-attys") ? " is-active" : ""}`}
          />

          {/* Step connector: Herody down to Cube */}
          <path
            d="M 625 240 V 325 H 580"
            className={`constellation-line-path${isConnected("node-herody", "node-cube") ? " is-active" : ""}`}
          />

          {/* Step connector: Mercedes down to Justvend */}
          <path
            d="M 870 240 V 325 H 825"
            className={`constellation-line-path${isConnected("node-merc", "node-justvend") ? " is-active" : ""}`}
          />

          {/* Step connector: Justvend down to Mile */}
          <path
            d="M 765 365 V 450 H 695"
            className={`constellation-line-path${isConnected("node-justvend", "node-mile") ? " is-active" : ""}`}
          />

          {/* Step connector: Atty's down to EasyBites */}
          <path
            d="M 235 365 V 450 H 305"
            className={`constellation-line-path${isConnected("node-attys", "node-easybites") ? " is-active" : ""}`}
          />

          {/* Junction Dots / Coordinates */}
          <circle
            cx="290"
            cy="160"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-nokia", "node-waffle") ? " is-active" : ""}`}
          />
          <circle
            cx="625"
            cy="70"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-herody", "node-redbull") ? " is-active" : ""}`}
          />
          <circle
            cx="625"
            cy="185"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-herody", "node-redbull", "node-merc") ? " is-active" : ""}`}
          />
          <circle
            cx="375"
            cy="325"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-tvs", "node-attys") ? " is-active" : ""}`}
          />
          <circle
            cx="625"
            cy="325"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-herody", "node-cube") ? " is-active" : ""}`}
          />
          <circle
            cx="870"
            cy="325"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-merc", "node-justvend") ? " is-active" : ""}`}
          />
          <circle
            cx="765"
            cy="450"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-justvend", "node-mile") ? " is-active" : ""}`}
          />
          <circle
            cx="235"
            cy="450"
            r="2.5"
            className={`constellation-junction-dot${isConnected("node-attys", "node-easybites") ? " is-active" : ""}`}
          />
        </svg>

        {/* Structured Constellation Grid Matrix */}
        <div className="constellation-grid">
          {/* Row 1: 2 items [ Nokia ] [ Red Bull ] */}
          <div className="constellation-row row-1">
            <div className="constellation-col col-r1-left">
              <div className="constellation-node node-nokia">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[0]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[0].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[0].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
            <div className="constellation-col col-r1-right">
              <div className="constellation-node node-redbull">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[1]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[1].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[1].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
          </div>

          {/* Row 2: 4 items [ Belgian ] [ TVS ] [ Herody ] [ Mercedes ] */}
          <div className="constellation-row row-2">
            <div className="constellation-col col-r2-1">
              <div className="constellation-node node-waffle">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[2]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[2].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[2].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
            <div className="constellation-col col-r2-2">
              <div className="constellation-node node-tvs">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[3]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[3].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[3].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
            <div className="constellation-col col-r2-3">
              <div className="constellation-node node-herody">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[4]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[4].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[4].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
            <div className="constellation-col col-r2-4">
              <div className="constellation-node node-merc">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[5]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[5].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[5].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
          </div>

          {/* Row 3: 3 items [ Atty's ] [ Cube ] [ Justvend ] */}
          <div className="constellation-row row-3">
            <div className="constellation-col col-r3-1">
              <div className="constellation-node node-attys">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[6]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[6].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[6].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
            <div className="constellation-col col-r3-2">
              <div className="constellation-node node-cube">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[7]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[7].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[7].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
            <div className="constellation-col col-r3-3">
              <div className="constellation-node node-justvend">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[8]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[8].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[8].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
          </div>

          {/* Row 4: 2 items [ EasyBites ] [ Mile ] */}
          <div className="constellation-row row-4">
            <div className="constellation-col col-r4-1">
              <div className="constellation-node node-easybites">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[9]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[9].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[9].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
            <div className="constellation-col col-r4-2">
              <div className="constellation-node node-mile">
                <SponsorCard
                  item={SPONSORS_CONSTELLATION[10]}
                  isHovered={hoveredNode === SPONSORS_CONSTELLATION[10].id}
                  onMouseEnter={() => setHoveredNode(SPONSORS_CONSTELLATION[10].id)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SponsorCard({
  item,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  item: SponsorItem;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}): React.ReactElement {
  return (
    <div
      className={`sponsor-card-inner tier-${item.tier || "core"}${isHovered ? " is-hovered" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Subtle radial glow behind the logo on hover */}
      <span className="sponsor-logo-glow" aria-hidden="true" />

      {/* Subtle corner constellation ticks */}
      <span className="card-corner corner-tl" aria-hidden="true" />
      <span className="card-corner corner-tr" aria-hidden="true" />
      <span className="card-corner corner-bl" aria-hidden="true" />
      <span className="card-corner corner-br" aria-hidden="true" />

      {/* Subtle coordinate beacon */}
      <span className="card-beacon" aria-hidden="true" />

      <div className="sponsor-logo-frame">
        <Image
          className={`sponsor-logo${item.logoKey ? ` sponsor-logo--${item.logoKey}` : ""}`}
          src={item.logo}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 130px, 180px"
          style={{ objectFit: "contain" }}
          loading="lazy"
        />
      </div>
    </div>
  );
}
