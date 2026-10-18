import React from "react";
import type { EventDetailData } from "@/src/content/events";

export default function EventAbout({ about }: { about: EventDetailData["about"] }): React.ReactElement {
  return (
    <section className="about" id="about">
      <div className="about__inner">
        <p className="eyebrow">
          <span className="eyebrow__rule" />
          {about.eyebrow}
        </p>

        <div className="about__grid">
          <h2 className="about__headline">
            {about.headline}
            <span className="hero__accent">{about.accent}</span>
          </h2>

          <div className="about__text">
            <p>{about.description}</p>

            {about.note && <p className="muted">{about.note}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
