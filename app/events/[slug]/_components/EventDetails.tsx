import React from "react";
import type { EventDetailData } from "@/src/content/events";

/** The numbered facts ledger followed by the organiser list. */
export default function EventDetails({ event }: { event: EventDetailData }): React.ReactElement {
  return (
    <>
          <section className="ledger" id="details">
            <p className="eyebrow">
              <span className="eyebrow__rule" />
              The details
            </p>

            <dl className="ledger__list">
              {event.ledger.map((item) => (
                <div className="ledger__row" key={item.number}>
                  <dt>{item.number}</dt>
                  <dd className="ledger__label">{item.label}</dd>
                  <dd className="ledger__value">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="organizers" id="organizers">
            <p className="eyebrow">
              <span className="eyebrow__rule" />
              Hosted by
            </p>

            <ul className="organizers__list">
              {event.organizers.map((org) => (
                <li key={org}>{org}</li>
              ))}
            </ul>
          </section>
    </>
  );
}
