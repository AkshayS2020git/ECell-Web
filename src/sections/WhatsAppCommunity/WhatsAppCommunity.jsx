import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./WhatsAppCommunity.css";

gsap.registerPlugin(ScrollTrigger);

// Swap this with the E-Cell WhatsApp invite URL when it is ready.
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/";

export default function WhatsAppCommunity() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const reveal = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
      });

      reveal
        .fromTo(
          ".community-bridge-core",
          { opacity: 0, scale: 0.55, y: -18 },
          { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.7)" }
        )
        .fromTo(
          ".community-bridge-copy",
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.36, ease: "power2.out" },
          "-=0.2"
        );

      gsap.fromTo(
        ".whatsapp-community-card",
        { opacity: 0, y: 80, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 76%", once: true },
        }
      );

      gsap.fromTo(
        ".whatsapp-community-visual",
        { opacity: 0, x: 55, rotate: 5 },
        {
          opacity: 1,
          x: 0,
          rotate: 0,
          duration: 0.85,
          ease: "power3.out",
          delay: 0.12,
          scrollTrigger: { trigger: section, start: "top 76%", once: true },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="whatsapp-community" id="community" aria-labelledby="community-heading">
      <div className="whatsapp-community-orb whatsapp-community-orb-one" aria-hidden="true" />
      <div className="whatsapp-community-orb whatsapp-community-orb-two" aria-hidden="true" />
      <div className="community-bridge" aria-hidden="true">
        <span className="community-bridge-line community-bridge-line-left" />
        <div className="community-bridge-core">
          <span className="community-bridge-ripple" />
          <span className="community-bridge-dot">✦</span>
        </div>
        <span className="community-bridge-line community-bridge-line-right" />
        <span className="community-bridge-copy">THE CONVERSATION CONTINUES</span>
      </div>
      <div className="wrap">
        <div className="whatsapp-community-card">
          <div className="whatsapp-community-copy">
            <span className="whatsapp-community-eyebrow">
              THE ECELL INNER CIRCLE <i>LIVE</i>
            </span>
            <h2 id="community-heading">Your next big idea starts with one message.</h2>
            <p>
              Meet builders, find your next collaborator, and be first in line for E-Cell opportunities.
            </p>
            <a
              className="whatsapp-community-cta"
              href={WHATSAPP_GROUP_URL}
              target="_blank"
              rel="noreferrer"
            >
              Join the community
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 10h11M11 5l5 5-5 5" />
              </svg>
            </a>
            <span className="whatsapp-community-note"><b>1,200+ students</b> are already in the loop.</span>
          </div>

          <div className="whatsapp-community-visual" aria-label="Preview of the E-Cell WhatsApp community">
            <div className="whatsapp-community-phone">
              <div className="whatsapp-community-phone-header">
                <span className="whatsapp-community-avatar">E</span>
                <span>
                  <b>E-Cell Community</b>
                  <small>1,200+ members</small>
                </span>
                <i>•••</i>
              </div>
              <div className="whatsapp-community-chat">
                <span className="whatsapp-community-chat-date">TODAY</span>
                <div className="whatsapp-community-message whatsapp-community-message-one">
                  <b>Riya · Events</b>
                  The founder mixer is open for registrations ✨
                  <small>11:42</small>
                </div>
                <div className="whatsapp-community-message whatsapp-community-message-two">
                  Anyone building in climate tech this semester?
                  <small>11:45</small>
                </div>
                <div className="whatsapp-community-typing"><i /><i /><i /> Builders are typing</div>
              </div>
            </div>
            <div className="whatsapp-community-bubble whatsapp-community-bubble-top"><span className="whatsapp-community-online-dot" /> 38 people online</div>
            <div className="whatsapp-community-bubble whatsapp-community-bubble-bottom">
              <span className="whatsapp-community-mini-logo">✦</span>
              Find your people
            </div>
            <div className="whatsapp-community-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <path d="M26.4 5.5A14.2 14.2 0 0 0 4.1 22.6L2.6 29.4l7-1.8A14.2 14.2 0 1 0 26.4 5.5ZM16 27.3a11.2 11.2 0 0 1-5.7-1.6l-.4-.2-4.1 1.1 1.1-4-.3-.4A11.2 11.2 0 1 1 16 27.3Zm6.1-8.4c-.3-.1-2-1-2.3-1.1-.3-.1-.5-.1-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1-1.9-.9-3.1-1.6-4.3-3.7-.3-.5.3-.5.9-1.7.1-.2.1-.4 0-.6-.1-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.3 3.4 1.4 3.6c.2.2 2.5 3.8 6 5.3 2.2 1 3 1.1 4 1 .6-.1 2- .8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.6-.4Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
