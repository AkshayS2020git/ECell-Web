import React from "react";
import Image from "next/image";
import type { SponsorItem } from "@/src/content/sponsors";

export default function SponsorCard({
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
  const cardContent = (
    <div
      className={`sponsor-card-inner tier-${item.tier || "core"}${isHovered ? " is-hovered" : ""}${item.url ? " has-link" : ""}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Subtle radial glow behind the logo on hover */}
      <span className="sponsor-logo-glow" aria-hidden="true" />

      {/* High-end corner constellation ticks */}
      <span className="card-corner corner-tl" aria-hidden="true" />
      <span className="card-corner corner-tr" aria-hidden="true" />
      <span className="card-corner corner-bl" aria-hidden="true" />
      <span className="card-corner corner-br" aria-hidden="true" />

      {/* Coordinate beacon */}
      <span className="card-beacon" aria-hidden="true" />

      <div className="sponsor-logo-frame">
        <Image
          className={`sponsor-logo${item.logoKey ? ` sponsor-logo--${item.logoKey}` : ""}`}
          src={item.logo}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 112px, 132px"
          style={{ objectFit: "contain" }}
          loading="lazy"
        />
      </div>
    </div>
  );

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="sponsor-card-link"
        aria-label={`Visit ${item.name} website`}
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
