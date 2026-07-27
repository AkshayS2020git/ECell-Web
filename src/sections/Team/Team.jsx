import { useEffect, useRef } from "react";
import teamMembers from "./TeamData.js";
import { setupTeamAnimations } from "./TeamAnimations.js";
import "./Team.css";
import "./TeamLayout.css";
import "./TeamResponsive.css";

export default function Team() {
  const teamRef = useRef(null);
  const backgroundRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const featuredRef = useRef(null);
  const stackRef = useRef(null);
  const cardRef = useRef(null);
  const navigationRef = useRef(null);

  useEffect(() => {
    return setupTeamAnimations({
      teamRef,
      backgroundRef,
      containerRef,
      stageRef,
      featuredRef,
      stackRef,
      cardRef,
      navigationRef,
    });
  }, []);

  const featuredMember = teamMembers[0];
  const stackedMembers = teamMembers.slice(1);

  return (
    <section ref={teamRef} className="team">
      <div ref={containerRef} className="team__container">
        <div className="team__label">
          <span className="team__label-mark">THE TEAM</span>
        </div>
        <div ref={stageRef} className="team__stage">
          <div ref={backgroundRef} className="team__background" />

          {featuredMember && (
            <div ref={featuredRef} className="team__featured">
              <article ref={cardRef} className="team__card">
                <div className="team__image">
                  <img
                    src={featuredMember.image}
                    alt={featuredMember.name}
                    loading="eager"
                  />
                </div>

                <div className="team__content">
                  <span className="team__role">{featuredMember.role}</span>
                  <h2 className="team__title">{featuredMember.name}</h2>
                  <p className="team__description">
                    {featuredMember.description}
                  </p>
                </div>
              </article>
            </div>
          )}

          <div ref={stackRef} className="team__stack">
            {stackedMembers.map((member) => (
              <article
                key={member.id}
                className="team__card team__card--hidden"
                aria-hidden="true"
              >
                <div className="team__image">
                  <img src={member.image} alt={member.name} loading="lazy" />
                </div>

                <div className="team__content">
                  <span className="team__role">{member.role}</span>
                  <h2 className="team__title">{member.name}</h2>
                  <p className="team__description">{member.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div ref={navigationRef} className="team__navigation" />
        </div>
      </div>
    </section>
  );
}