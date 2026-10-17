import React from "react";
import type { EventDetailData } from "@/src/content/events";

interface EventRoundsProps {
  rounds: NonNullable<EventDetailData["rounds"]>;
}

export default function EventRounds({ rounds }: EventRoundsProps): React.ReactElement {
  return (
    <section
      className="event-rounds"
      id="rounds"
      aria-labelledby="event-rounds-heading"
    >
      <div className="event-rounds__inner">
        <p className="eyebrow">
          <span className="eyebrow__rule" />
          Format &amp; Progression
        </p>

        <header className="event-rounds__header">
          <h2
            className="event-rounds__headline"
            id="event-rounds-heading"
            aria-label={`${rounds.headline} ${(
              rounds.accent ?? ""
            ).trimStart()}`}
          >
            {rounds.headline}
            <span className="hero__accent">
              {"\u00A0"}
              {(rounds.accent ?? "").trimStart()}
            </span>
          </h2>
          {rounds.subhead && (
            <p className="event-rounds__subhead">{rounds.subhead}</p>
          )}
        </header>

        <ol className="event-progression" aria-label="Event stages">
          {rounds.items.map((round) => (
            <li className="event-progression__item" key={round.number}>
              <article className="event-progression__stage">
                <div className="event-progression__sequence">
                  <span className="event-progression__number">{round.number}</span>
                  <span className="event-progression__badge">{round.badge}</span>
                </div>
                <div className="event-progression__summary">
                  <p className="event-progression__type">{round.type}</p>
                  <h3 className="event-progression__title">{round.title}</h3>
                </div>
                <p className="event-progression__description">{round.description}</p>
              </article>
            </li>
          ))}
        </ol>

        {rounds.expectedOutcomes && rounds.expectedOutcomes.length > 0 && (
          <section className="event-outcomes" aria-labelledby="event-outcomes-heading">
            <header className="event-outcomes__header">
              <p className="event-outcomes__kicker">KEY TAKEAWAYS</p>
              <h3 className="event-outcomes__title" id="event-outcomes-heading">
                Expected Outcomes of the Event
              </h3>
            </header>
            <ul className="event-outcomes__list">
              {rounds.expectedOutcomes.map((outcome, idx) => (
                <li key={idx} className="event-outcomes__item">
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        )}

        {rounds.logisticsNotice && (
          <aside className="event-guidelines" aria-labelledby="event-guidelines-heading">
            <h3 className="event-guidelines__title" id="event-guidelines-heading">
              EVENT GUIDELINES
            </h3>
            <p className="event-guidelines__text">{rounds.logisticsNotice}</p>
          </aside>
        )}
      </div>
    </section>
  );
}
