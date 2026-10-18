import React from "react";
import Image from "next/image";
import type { EventDetailData, EventSponsor } from "@/src/content/events";

interface FeaturedSponsorCardProps {
  sponsor: EventSponsor;
  presenting?: boolean;
}

/** Large card used for the "Powered by" and "Presenting partner" tiers. */
function FeaturedSponsorCard({ sponsor, presenting }: FeaturedSponsorCardProps): React.ReactElement {
  return (
    <div className={`event-sponsor-card event-sponsor-card--featured${presenting ? " event-sponsor-card--presenting" : ""}`}>
      <span className="event-sponsor-card__glow" aria-hidden="true" />
      <span className="event-sponsor-card__corner corner--tl" aria-hidden="true" />
      <span className="event-sponsor-card__corner corner--tr" aria-hidden="true" />
      <span className="event-sponsor-card__corner corner--bl" aria-hidden="true" />
      <span className="event-sponsor-card__corner corner--br" aria-hidden="true" />
      <span className="event-sponsor-card__beacon" aria-hidden="true" />
      <div className="event-sponsor-card__logo-frame event-sponsor-card__logo-frame--lg">
        {sponsor.logo ? (
          <Image
            src={sponsor.logo}
            alt={`${sponsor.name} logo`}
            className="event-sponsor-card__logo event-sponsor-card__logo--lg"
            width={200}
            height={100}
            loading="lazy"
          />
        ) : (
          <span className="event-sponsor-card__logo-text event-sponsor-card__logo-text--lg">{sponsor.name}</span>
        )}
      </div>
      <div className="event-sponsor-card__info">
        <span className="event-sponsor-card__name event-sponsor-card__name--featured">{sponsor.name}</span>
        {sponsor.tag && (
          <span className="event-sponsor-card__tag">{sponsor.tag}</span>
        )}
      </div>
    </div>
  );
}

interface EventSponsorsProps {
  sponsors: NonNullable<EventDetailData["sponsors"]>;
}

export default function EventSponsors({ sponsors }: EventSponsorsProps): React.ReactElement {
  return (
    <section className="event-sponsors-section" id="sponsors">
      <div className="event-sponsors-section__inner">
        <p className="eyebrow">
          <span className="eyebrow__rule" />
          Global Ecosystem &amp; Partners
        </p>

        <div className="event-sponsors-section__header">
          <h2 className="event-sponsors-section__headline">
            {sponsors.headline}
            <span className="hero__accent">
              {sponsors.accent}
            </span>
          </h2>
          {sponsors.subhead && (
            <p className="event-sponsors-section__subhead">
              {sponsors.subhead}
            </p>
          )}
        </div>

        <div className="event-sponsors-wrapper">
          {/* Featured Sponsors Row: Powered By + Presenting Partner */}
          {((sponsors.poweredBy && sponsors.poweredBy.length > 0) || sponsors.presenting) && (
            <div className="event-sponsors-featured-row">
              {/* Tier 1: Powered by */}
              {sponsors.poweredBy && sponsors.poweredBy.length > 0 && (
                <div className="event-sponsor-tier event-sponsor-tier--powered">
                  <span className="event-sponsor-tier-label">POWERED BY</span>
                  <div className="event-sponsors-tier-cards event-sponsors-tier-cards--duo">
                    {sponsors.poweredBy.map((partner) => (
                <FeaturedSponsorCard sponsor={partner} key={partner.name} />
                    ))}
                  </div>
                </div>
              )}

              {/* Tier 2: Presenting Partner */}
              {sponsors.presenting && (
                <div className="event-sponsor-tier event-sponsor-tier--presenting">
                  <span className="event-sponsor-tier-label">PRESENTING PARTNER</span>
                  <div className="event-sponsors-tier-cards event-sponsors-tier-cards--single">
                <FeaturedSponsorCard sponsor={sponsors.presenting} presenting />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tier 3: Sponsors & Partners Grid — Constellation Card Style */}
          <div className="event-sponsors-grid-section">
            <div className="event-sponsor-tier-header">
              <span className="tier-title">SPONSORS &amp; PARTNERS</span>
            </div>
            <div className="event-sponsors-card-grid">
              {sponsors.list.map((sponsor) => (
                <div
                  className="event-sponsor-card"
                  key={sponsor.name}
                >
                  {/* Glassmorphism glow */}
                  <span className="event-sponsor-card__glow" aria-hidden="true" />

                  {/* Corner constellation ticks */}
                  <span className="event-sponsor-card__corner corner--tl" aria-hidden="true" />
                  <span className="event-sponsor-card__corner corner--tr" aria-hidden="true" />
                  <span className="event-sponsor-card__corner corner--bl" aria-hidden="true" />
                  <span className="event-sponsor-card__corner corner--br" aria-hidden="true" />

                  {/* Beacon */}
                  <span className="event-sponsor-card__beacon" aria-hidden="true" />

                  <div className="event-sponsor-card__logo-frame">
                    {sponsor.logo ? (
                      <Image
                        src={sponsor.logo}
                        alt={`${sponsor.name} logo`}
                        className="event-sponsor-card__logo"
                        width={200}
                        height={100}
                        loading="lazy"
                      />
                    ) : (
                      <span className="event-sponsor-card__logo-text" aria-hidden="true">
                        {sponsor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="event-sponsor-card__name">{sponsor.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
