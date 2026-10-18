import Image from "next/image";
import Link from "next/link";
import { formatCardDate, type EventItem } from "./eventItems";

/** One upcoming event in the /events grid. */
export default function EventCard({ event }: { event: EventItem }): React.ReactElement {
  const { day, month } = formatCardDate(event);

  return (
    <article
      className={`ea-card ${event.link ? "ea-card--clickable" : ""}`}
      style={{ position: "relative" }}
    >

      {event.link && (
        <Link
          href={event.link}
          className="ea-card-overlay-link"
          aria-label={`View details for ${event.title}`}
        >
          View details for {event.title}
        </Link>
      )}

      <div
        className={`ea-card-image${event.imageIsPoster ? " ea-card-image--poster" : ""}`}
        style={{ position: "relative" }}
      >
        {event.imageIsPoster && (
          <Image
            className="ea-poster-backdrop"
            src={event.image}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 700px) 90vw, 45vw"
            quality={40}
          />
        )}
        <Image
          className={event.imageIsPoster ? "ea-poster-fit" : undefined}
          src={event.image}
          alt={event.title}
          fill
          sizes="(max-width: 700px) 90vw, 45vw"
        />

        <span>
          {event.type}
        </span>
      </div>

      <div className="ea-card-info">

        <div>

          <h2>
            {event.link ? (
              <Link href={event.link} style={{ color: "inherit", textDecoration: "none", position: "relative", zIndex: 9 }}>
                {event.title}
              </Link>
            ) : (
              event.title
            )}
          </h2>

          <p>
            {event.description}
          </p>

        </div>

        <time>
          <span>{day}</span> <span>{month}</span>
        </time>

      </div>

    </article>
  );
}
