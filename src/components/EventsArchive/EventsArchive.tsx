"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { scrollToElement } from "@/src/utils/lenis";
import EventCard from "./EventCard";
import { buildStructuredData, EVENT_ITEMS, FILTERS } from "./eventItems";
import FeaturedEvent from "./FeaturedEvent";
import { useArchiveEntrance } from "./useArchiveEntrance";
import { useArchivePreview } from "./useArchivePreview";
import "./EventsArchive.css";
import SiteCredit from "@/src/components/SiteCredit/SiteCredit";

/* =====================================================
   COMPONENT
===================================================== */

export default function EventsArchive(): React.ReactElement {
  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]>("All");

  const [selectedDate, setSelectedDate] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const upcomingEvents = useMemo(
    () => EVENT_ITEMS.filter((event) => event.status === "UPCOMING"),
    [],
  );

  const archivedEvents = useMemo(
    () => EVENT_ITEMS.filter((event) => event.status === "ARCHIVE"),
    [],
  );

  const featuredEvent = upcomingEvents[0];

  const visibleEvents = useMemo(() => {
    if (filter === "All") {
      return upcomingEvents;
    }

    return upcomingEvents.filter(
      (event) => event.type === filter,
    );
  }, [filter, upcomingEvents]);

  /* =====================================================
     SCROLL TO EVENTS
  ===================================================== */

  const scrollToEvents = () => {
    scrollToElement("#events");
  };

  /* =====================================================
     SCROLL RESET ON MOUNT — intentionally absent.
     RouteScrollManager owns the reset for every route. The copy that used to
     live here raced it over html.style.scrollBehavior: both saved the original
     value and restored it on different schedules, so whichever ran second could
     permanently latch the other's temporary value.
  ===================================================== */

  useArchiveEntrance({ heroRef, calendarRef, cardsRef, archiveRef });
  useArchivePreview(archiveRef, previewRef, archivedEvents.length);

  /* =====================================================
     JSON-LD
  ===================================================== */

  const jsonLd = useMemo(
    () => buildStructuredData(upcomingEvents),
    [upcomingEvents],
  );

  return (
    <main className="ea-page">

      {/* Structured data for Google rich results */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="ea-hero"
        ref={heroRef}
      >
        <div className="ea-hero-copy">

          <p className="ea-eyebrow">
            <span />
            EVENTS &amp; WORKSHOPS
          </p>

          <h1>
            Where
            <br />
            ideas <em>get moving.</em>
          </h1>

          <p className="ea-hero-intro">
            Talks, workshops, hackathons and founder
            sessions for people who want to build
            something real. Pick an event, bring a
            question, and leave with something started.
          </p>

          <div className="ea-actions">

            <a
              className="ea-button ea-button--primary"
              href="#events"
            >
              EXPLORE EVENTS <span>→</span>
            </a>

            <a
              className="ea-button"
              href="#calendar"
            >
              BROWSE CALENDAR <span>↓</span>
            </a>

          </div>
        </div>

        {/* Featured Event */}

        <FeaturedEvent event={featuredEvent} />
      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section
        className="ea-content"
        id="calendar"
      >

        {/* Calendar */}

        <div className="ea-section-head">

          <span>
            THE CALENDAR
          </span>

          <span>
            {upcomingEvents.length
              .toString()
              .padStart(2, "0")}{" "}
            EVENTS
          </span>

        </div>

        <div
          className="ea-calendar"
          ref={calendarRef}
        >

          <div className="ea-calendar-track">

            {upcomingEvents.map(
              (event, index) => (
                <button
                  className={`ea-date ${
                    selectedDate === index
                      ? "is-active"
                      : ""
                  }`}
                  key={event.title}
                  onClick={() => {
                    setSelectedDate(index);
                    setFilter("All");
                  }}
                  type="button"
                >

                  <strong>
                    {event.date === "TBA"
                      ? "—"
                      : event.date}
                  </strong>

                  <span>
                    {event.month}
                  </span>

                  <i />

                  <b>
                    {event.title}
                  </b>

                </button>
              ),
            )}

          </div>

        </div>

        {/* Upcoming Events */}

        <div
          className="ea-section-head"
          id="events"
        >

          <span>
            UPCOMING EVENTS
          </span>

          <button
            className="ea-view-all-btn"
            type="button"
            onClick={scrollToEvents}
          >
            VIEW ALL →
          </button>

        </div>

        {/* Filters */}

        <div
          className="ea-filters"
          aria-label="Filter events"
        >

          {FILTERS.map((item) => (
            <button
              className={
                filter === item
                  ? "is-active"
                  : ""
              }
              key={item}
              onClick={() =>
                setFilter(item)
              }
              type="button"
            >
              {item}
            </button>
          ))}

        </div>

        {/* Event Grid */}

        <div
          className="ea-grid"
          ref={cardsRef}
        >

          {visibleEvents.map((event) => (
            <EventCard event={event} key={event.title} />
          ))}

        </div>

        {/* =================================================
            ARCHIVE
        ================================================= */}

        <div
          className="ea-archive"
          ref={archiveRef}
        >

          <div className="ea-section-head">

            <span>
              PREVIOUS EVENTS
            </span>

            <span>
              {archivedEvents.length
                .toString()
                .padStart(2, "0")}{" "}
              MOMENTS
            </span>

          </div>

          {archivedEvents.map(
            (event, index) => {
              const rowContent = (
                <>
                  <span>
                    0{index + 1}
                  </span>

                  <strong>
                    {event.title}
                  </strong>

                  <small>
                    {event.type}
                  </small>

                  <b>
                    ↗
                  </b>
                </>
              );

              return event.link ? (
                <Link
                  href={event.link}
                  className="ea-archive-row ea-archive-row--link"
                  data-index={index}
                  key={event.title}
                  aria-label={`View details for past event ${event.title}`}
                >
                  {rowContent}
                </Link>
              ) : (
                <div
                  className="ea-archive-row"
                  data-index={index}
                  key={event.title}
                >
                  {rowContent}
                </div>
              );
            },
          )}

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      {/* Cursor-following photo for the previous-events list. Lives outside
          the animated sections so their transforms can't offset it. */}
      <div ref={previewRef} className="ea-archive-preview" aria-hidden="true">
        {archivedEvents.map((event) => (
          <Image key={event.title} src={event.image} alt="" fill sizes="300px" />
        ))}
      </div>

      <footer className="ea-footer">

        <span>
          ECELL RV UNIVERSITY
        </span>

        <span>
          BUILD / FAIL / LEARN / REPEAT
        </span>

        <Link
          className="ea-footer-home"
          href="/"
          aria-label="Back to homepage"
        >
          ← HOME
        </Link>

      </footer>

      <SiteCredit />

    </main>
  );
}
