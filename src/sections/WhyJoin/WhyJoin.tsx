"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "../../utils/gsapSetup";
import "./WhyJoin.css";

const reasons = [
  {
    number: "01",
    title: "Build what matters",
    description:
      "Turn a half-formed idea into something real with people who love making things happen.",
    background: "#edf0f5",
    text: "#2d91e5",
    iconBackground: "#2d91e5",
    iconColor: "#ffffff",
    icon: "✦",
  },
  {
    number: "02",
    title: "Find your people",
    description:
      "Meet curious builders, designers and doers who will challenge your thinking and back your ambition.",
    background: "#8bce5d",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#78bd4e",
    icon: "◎",
  },
  {
    number: "03",
    title: "Learn by doing",
    description:
      "Lead projects, run events and pick up the practical skills no classroom can quite teach.",
    background: "#fa6959",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#fa6959",
    icon: "↗",
  },
  {
    number: "04",
    title: "Create real impact",
    description:
      "Shape the conversations, communities and ventures that move campus forward.",
    background: "#238894",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#238894",
    icon: "⚡",
  },
  {
    number: "05",
    title: "Your next chapter starts here",
    description:
      "Bring your curiosity. Leave with a network, a portfolio and the confidence to take the first leap.",
    background: "#252525",
    text: "#ffffff",
    iconBackground: "#ffffff",
    iconColor: "#252525",
    icon: "→",
  },
];

export default function WhyJoin(): React.ReactElement {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardRefs.current.filter(
      (card): card is HTMLElement => card !== null
    );
    if (!section || cards.length !== reasons.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      cards.forEach((card, index) => {
        gsap.set(card, { y: index * 22, scale: 1 - index * 0.025, rotate: 0 });
      });
      return;
    }

    const context = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const stackOffset = isMobile ? 18 : 24;

      cards.forEach((card, index) => {
        gsap.set(card, {
          y: index * stackOffset,
          scale: 1 - index * 0.035,
          rotate: index % 2 === 0 ? -1.4 : 1.4,
          transformOrigin: "50% 100%",
          zIndex: cards.length - index,
        });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${isMobile ? 450 : 520}%`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.slice(0, -1).forEach((card, index) => {
        const nextCards = cards.slice(index + 1);
        const at = index;

        timeline
          .to(
            card,
            {
              y: isMobile ? -window.innerHeight * 0.8 : -window.innerHeight * 0.95,
              rotate: index % 2 === 0 ? -7 : 7,
              scale: 0.93,
              opacity: 0,
              duration: 0.82,
              ease: "power2.inOut",
            },
            at
          )
          .to(
            nextCards,
            {
              y: (cardIndex: number) => cardIndex * stackOffset,
              scale: (cardIndex: number) => 1 - cardIndex * 0.035,
              rotate: (cardIndex: number) => (cardIndex % 2 === 0 ? -1.4 : 1.4),
              duration: 0.82,
              ease: "power2.inOut",
            },
            at
          );
      });
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} className="why-join" id="why-join">
      <div className="why-join__intro wrap">
        <p className="why-join__eyebrow">Why join E-Cell</p>
        <h2>Make your college years count.</h2>
        <p className="why-join__hint">Scroll to explore</p>
      </div>

      <div className="why-join__stack" aria-label="Reasons to join E-Cell">
        {reasons.map((reason, index) => (
          <article
            key={reason.number}
            ref={(element) => {
              cardRefs.current[index] = element;
            }}
            className="why-card"
            style={
              {
                "--card-bg": reason.background,
                "--card-text": reason.text,
                "--card-icon-bg": reason.iconBackground,
                "--card-icon-fg": reason.iconColor,
              } as React.CSSProperties
            }
          >
            <div className="why-card__topline">
              <span className="why-card__number">{reason.number}</span>
              <span className="why-card__icon" aria-hidden="true">{reason.icon}</span>
            </div>
            <div className="why-card__content">
              <h3>{reason.title}</h3>
              <p>{reason.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
