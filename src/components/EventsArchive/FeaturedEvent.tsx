import Image from "next/image";
import Link from "next/link";
import { formatEventDate, type EventItem } from "./eventItems";

/** The first upcoming event, shown large beside the hero copy. */
export default function FeaturedEvent({ event: featuredEvent }: { event: EventItem }): React.ReactElement {
  return (
    <div className="ea-feature-wrap">

      <article className={`ea-feature ${featuredEvent.link ? "ea-feature--clickable" : ""}`} style={{ position: "relative" }}>

        {featuredEvent.link && (
          <Link
            href={featuredEvent.link}
            className="ea-feature-overlay-link"
            aria-label={`View details for ${featuredEvent.title}`}
          >
            View details for {featuredEvent.title}
          </Link>
        )}

        <div
          className={`ea-feature-art${featuredEvent.imageIsPoster ? " ea-feature-art--poster" : ""}`}
          style={{
            position: "relative",
          }}
        >
          {featuredEvent.imageIsPoster && (
            <Image
              className="ea-poster-backdrop"
              src={featuredEvent.image}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 900px) 88vw, 40vw"
              quality={40}
            />
          )}
          <Image
            className={featuredEvent.imageIsPoster ? "ea-poster-fit" : undefined}
            src={featuredEvent.image}
            alt={featuredEvent.title}
            fill
            sizes="(max-width: 900px) 88vw, 40vw"
            quality={85}
            priority
            loading="eager"
          />

          <span>
            UPCOMING ·{" "}
            {featuredEvent.type.toUpperCase()}
          </span>

          <strong>
            {featuredEvent.title
              .split(" ")
              .slice(0, -1)
              .join(" ") ||
              featuredEvent.title}

            <br />

            <em>
              {featuredEvent.title
                .split(" ")
                .slice(-1)}
            </em>
          </strong>

        </div>

        <div className="ea-feature-bottom">

          <div>

            <h2>
              {featuredEvent.link ? (
                <Link href={featuredEvent.link} style={{ color: "inherit", textDecoration: "none", position: "relative", zIndex: 9 }}>
                  {featuredEvent.title}
                </Link>
              ) : (
                featuredEvent.title
              )}
            </h2>

            <p>
              {formatEventDate(featuredEvent)} ·
              RV UNIVERSITY, BENGALURU
            </p>

          </div>

          {featuredEvent.link ? (
            <Link
              href={featuredEvent.link}
              style={{ position: "relative", zIndex: 10 }}
              aria-label={`View details for ${featuredEvent.title}`}
            >
              ↗
            </Link>
          ) : (
            <span style={{ position: "relative", zIndex: 10 }}>↗</span>
          )}

        </div>

      </article>

    </div>
  );
}
