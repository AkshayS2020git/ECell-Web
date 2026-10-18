import type { Metadata } from "next";
import Image from "next/image";
import SubNav from "@/src/sections/Nav/SubNav";
import SiteCredit from "@/src/components/SiteCredit/SiteCredit";
import { SITE_URL } from "@/src/utils/constants";
import { padNumber as pad } from "@/src/utils/math";
import Globe, { type GlobeMarker } from "./_components/Globe";
import { getListings, type Hackathon, type Source } from "./_data/hackathons";
import "./Opportunities.css";

// Rebuild the page in the background at most once an hour, so listings stay
// fresh without asking every source on every visit.
export const revalidate = 3600;

const SOURCE_LINKS: Record<Source, string> = {
  Devpost: "https://devpost.com/hackathons",
  Devfolio: "https://devfolio.co/hackathons",
  Unstop: "https://unstop.com/hackathons",
  "Hack Club": "https://hackathons.hackclub.com/",
};

const description =
  "Hackathons you can join right now, in India, online and around the world, gathered live from Devpost, Devfolio, Unstop and Hack Club and sorted by deadline.";

export const metadata: Metadata = {
  title: "Opportunities",
  description,
  openGraph: {
    title: "Opportunities | ECell RV University",
    description,
    url: `${SITE_URL}/opportunities`,
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "ECell RV University Opportunities",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Opportunities | ECell RV University",
    description,
  },
  alternates: {
    canonical: `${SITE_URL}/opportunities`,
  },
};

function Card({ hackathon }: { hackathon: Hackathon }) {
  return (
    <li className="op-card">
      <a href={hackathon.url} target="_blank" rel="noopener noreferrer">
        <span className="op-card__thumb" aria-hidden="true">
          {hackathon.thumbnail ? (
            <Image src={hackathon.thumbnail} alt="" width={96} height={96} />
          ) : (
            hackathon.title.charAt(0)
          )}
        </span>
        <span className="op-card__body">
          <span className="op-card__title">{hackathon.title}</span>
          <span className="op-card__meta">
            {[hackathon.organiser, hackathon.location].filter(Boolean).join(" · ")}
          </span>
          <span className="op-card__tags">
            <span className="op-card__source">{hackathon.source}</span>
            {hackathon.themes.slice(0, 3).map((theme) => (
              <span key={theme}>{theme}</span>
            ))}
          </span>
        </span>
        <span className="op-card__side">
          {hackathon.dates && <span className="op-card__dates">{hackathon.dates}</span>}
          {hackathon.prize && <span className="op-card__prize">{hackathon.prize}</span>}
          <span className="op-card__arrow" aria-hidden="true">↗</span>
        </span>
      </a>
    </li>
  );
}

function SourceList({ sources }: { sources: Source[] }) {
  return sources.map((source, index) => (
    <span key={source}>
      {index > 0 && (index === sources.length - 1 ? " and " : ", ")}
      <a href={SOURCE_LINKS[source]} target="_blank" rel="noopener noreferrer">
        {source}
      </a>
    </span>
  ));
}

export default async function OpportunitiesPage() {
  const listings = await getListings();
  const hackathons = listings?.hackathons ?? [];
  const [next, ...rest] = hackathons;
  const markers: GlobeMarker[] = hackathons.flatMap((hackathon) =>
    hackathon.point ? [{ id: hackathon.id, title: hackathon.title, url: hackathon.url, ...hackathon.point }] : [],
  );
  const stats = [
    { value: hackathons.length, label: "Open now" },
    { value: hackathons.filter((hackathon) => hackathon.country === "India").length, label: "In India" },
    { value: hackathons.filter((hackathon) => hackathon.online).length, label: "Online" },
    { value: listings?.sources.length ?? 0, label: "Sources" },
  ];

  return (
    <>
      <SubNav />
      <main className="op-page">
        <section className="op-hero">
          <div className="op-hero-copy">
            <p className="op-eyebrow">
              <span />
              OPPORTUNITIES
            </p>
            <h1>
              Go build
              <br />
              <em>somewhere.</em>
            </h1>
            <p className="op-hero-intro">
              Hackathons open right now, from Bengaluru to the other side of the world. Pick one,
              find a team, and ship something before the deadline.
            </p>
            {listings && (
              <dl className="op-stats">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{pad(stat.value)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {markers.length > 0 && <Globe markers={markers} />}
        </section>

        <div className="op-content">
          {!next ? (
            <p className="op-empty">
              {listings
                ? "Nothing is open right now. Check back soon."
                : "We couldn't load the listings just now."}{" "}
              <a href={SOURCE_LINKS.Devpost} target="_blank" rel="noopener noreferrer">
                Browse hackathons on Devpost ↗
              </a>
            </p>
          ) : (
            <>
              <section className="op-section" aria-labelledby="op-next-title">
                <div className="op-section-head">
                  <h2 id="op-next-title">CLOSING NEXT</h2>
                </div>
                <ul className="op-list op-list--next">
                  <Card hackathon={next} />
                </ul>
              </section>

              {rest.length > 0 && (
                <section className="op-section" aria-labelledby="op-all-title">
                  <div className="op-section-head">
                    <h2 id="op-all-title">ALL OPEN</h2>
                    <span>BY DEADLINE</span>
                  </div>
                  <ul className="op-list">
                    {rest.map((hackathon) => (
                      <Card key={hackathon.id} hackathon={hackathon} />
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}

          {listings && (
            <p className="op-source">
              Listings from <SourceList sources={listings.sources} />, refreshed hourly, with repeats
              merged. Dots on the globe are placed by city or state, so treat them as rough. Check dates
              and rules on each hackathon&apos;s own page.
            </p>
          )}
        </div>

        <SiteCredit />
      </main>
    </>
  );
}
