"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../utils/gsapSetup";
import "./WhatsAppCommunity.css";

// this is the url for the whatsapp student community.
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/J0MfKUwIZ6J8WfemIBbdlJ";

const initialMessages = [
  { id: "welcome", sender: "bot", text: "Hey! I’m the E-Cell guide. Ask me about the Ecell, events, joining, or building your idea.", time: "11:42" },
  { id: "question", sender: "user", text: "Where can I register for this?", time: "11:45" },
];

const getAssistantReply = (message) => {
  const question = message.toLowerCase();

  if (/(what.{0,12}(e[ -]?cell|entrepreneurship cell)|(about)(e[ -]?cell|entrepreneurship cell).{0,12}(what|about))|(about)/.test(question)) {
    return "E-Cell RV University is the campus entrepreneurship community. We help students explore ideas, learn from founders, meet collaborators, and take their first steps towards building something.";
  }
  if (/(what.{0,12}(do|offer)|why.{0,12}(join|e[ -]?cell)|benefit|opportunit)|(offer)/.test(question)) {
    return "E-Cell brings you founder talks, workshops, events, mentorship, and a community of people who like building. It is a place to learn, find collaborators, and turn an idea into action.";
  }
  if (/(who.{0,12}(join|for)|eligible|eligibility|can i join|anyone)/.test(question)) {
    return "Anyone at RV University who is curious about entrepreneurship can join — you do not need a startup or prior experience. Students with ideas, skills, or simply a willingness to learn are welcome.";
  }
  if (/(join|register|membership|member|core team|volunteer)/.test(question)) {
    return "Tap “Join the community” to get started. We share event registrations, core-team openings, and ways to contribute in the WhatsApp community.";
  }
  if (/(event|workshop|talk|session)/.test(question)) {
    return "We're the driving force behind more than half of everything :whappening at RVU.And we're just getting started.This year's lineup kicks off with Kalpvikas, followed by the intense Pitch-e-thon.Lock in the dates, secure your spot, and network with the builders who matter.👉 Join the community — and never miss a moment.";
  }
  if (/(idea|startup|build|founder|mentor|collaborat|team)/.test(question)) {
    return "Absolutely — you do not need to have everything figured out. Share your idea with us and we’ll help you find fellow builders, relevant events, and useful resources.";
  }
  if (/(cost|fee|paid|payment|free)/.test(question)) {
    return "Joining the WhatsApp community is free. Joining the Core team is also free, The time you have to pay is, if you are registering for an event.";
  }
  if (/(im interested)| (interested in)/.test(question)) {
    return "Nice — we’re always looking for people who want to get involved. Tap “Join the community” to get started. We share event registrations, core-team openings, and ways to contribute in the WhatsApp community."
  }
  if (/(contact|reach|instagram|email|social)/.test(question)) {
    return "The fastest way to stay connected is to join the community. You can also follow E-Cell RV University on its official social channels for updates.";
  }
  if (/(team)|(Who.{0,12}(members))|(members)|(who.{0,12}(Team member))/.test(question)) {

  }
  if (/(hello|hi|hey|yo|sup)/.test(question)) {
    return "Hey! Ask me what E-Cell is, who can join, what we do, or how to get involved.";
  }

  return "I can help with E-Cell, joining the community, events, or building an idea. Ask away — or join the community for the latest opportunities.";
};

const timeNow = () => new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date());

export default function WhatsAppCommunity() {
  const sectionRef = useRef(null);
  const cursorFieldRef = useRef(null);
  const rafIdRef = useRef(null);
  const replyTimeoutRef = useRef(null);
  const messagesRef = useRef(null);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSectionPointerMove = (event) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const field = cursorFieldRef.current;
    const section = event.currentTarget;
    if (!field || !section) return;

    const clientX = event.clientX;
    const clientY = event.clientY;

    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (!section || !field) return;

      const bounds = section.getBoundingClientRect();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;
      const icons = field.children;

      field.style.setProperty("--cursor-x", `${x}px`);
      field.style.setProperty("--cursor-y", `${y}px`);

      Array.from(icons).forEach((icon, index) => {
        const angle = ((index * 137.5) - 30) * (Math.PI / 180);
        const radius = 58 + (index % 4) * 32;
        icon.style.setProperty("--icon-x", `${x + Math.cos(angle) * radius}px`);
        icon.style.setProperty("--icon-y", `${y + Math.sin(angle) * radius}px`);
        icon.style.setProperty("--trail-delay", `${55 + (index % 5) * 34}ms`);
      });

      field.classList.add("is-active");
    });
  };

  const handleSectionPointerLeave = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    const field = cursorFieldRef.current;
    field?.classList.remove("is-active");
  };

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

  useEffect(() => {
    const messageList = messagesRef.current;
    if (messageList) messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => () => {
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
  }, []);

  const handleSendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isTyping) return;

    setMessages((current) => [...current, { id: `user-${Date.now()}`, sender: "user", text, time: timeNow() }]);
    setDraft("");
    setIsTyping(true);

    replyTimeoutRef.current = setTimeout(() => {
      setMessages((current) => [...current, {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: getAssistantReply(text),
        time: timeNow(),
      }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <section
      ref={sectionRef}
      className="whatsapp-community"
      id="community"
      aria-labelledby="community-heading"
      onPointerMove={handleSectionPointerMove}
      onPointerLeave={handleSectionPointerLeave}
    >
      <div className="whatsapp-community-orb whatsapp-community-orb-one" aria-hidden="true" />
      <div className="whatsapp-community-orb whatsapp-community-orb-two" aria-hidden="true" />
      <div ref={cursorFieldRef} className="whatsapp-community-cursor-field" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span className="whatsapp-community-cursor-icon" key={index}>
            {index % 3 === 0 ? (
              <svg viewBox="0 0 24 24"><path d="M19.1 4.9A9.72 9.72 0 0 0 3.72 16.62L2.5 21.5l5-1.18A9.72 9.72 0 0 0 19.1 4.9ZM12 19.8a7.79 7.79 0 0 1-3.97-1.09l-.28-.16-2.97.7.72-2.89-.18-.3A7.8 7.8 0 1 1 12 19.8Zm4.27-5.84c-.23-.12-1.38-.68-1.59-.75-.21-.08-.36-.12-.51.12s-.59.75-.72.9c-.13.16-.26.18-.49.06a6.34 6.34 0 0 1-1.86-1.15 6.95 6.95 0 0 1-1.28-1.6c-.13-.23-.01-.35.1-.47.1-.1.23-.26.34-.39.11-.13.15-.23.23-.38.08-.16.04-.29-.02-.41-.06-.12-.51-1.22-.7-1.67-.18-.44-.37-.38-.51-.39h-.44c-.15 0-.4.06-.61.29s-.8.78-.8 1.9.82 2.2.93 2.36c.12.16 1.62 2.47 3.93 3.47.55.24.98.38 1.31.49.55.17 1.05.15 1.44.09.44-.07 1.38-.56 1.57-1.1.19-.54.19-1 .13-1.1-.06-.1-.21-.16-.44-.28Z" /></svg>
            ) : index % 3 === 1 ? (
              <svg viewBox="0 0 24 24"><path d="M20 3H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4l4 3 4-3h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-3 9H7V10h10v2Zm0-4H7V6h10v2Z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 1 0-3.95-4.65A5.5 5.5 0 0 1 15 11h1ZM8 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm8 2c-1.04 0-2.04.18-2.97.52A6.9 6.9 0 0 1 15 18.5c0 .52-.06 1.02-.17 1.5H22v-2c0-2.76-2.24-5-5-5ZM8 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4Z" /></svg>
            )}
          </span>
        ))}
      </div>
      <div className="community-bridge" aria-hidden="true">
        <span className="community-bridge-line community-bridge-line-left" />
        <div className="community-bridge-core">
          <span className="community-bridge-ripple" />
          <span className="community-bridge-dot">✦</span>
        </div>
        <span className="community-bridge-line community-bridge-line-right" />
      </div>
      <div className="wrap">
        <div className="whatsapp-community-card">
          <div className="whatsapp-community-copy">
            <span className="whatsapp-community-eyebrow">
              THE ECELL INNER CIRCLE
            </span>
            <h2 id="community-heading">
              <span>Your journey</span>
              <em>starts here.</em>
            </h2>
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
            <span className="whatsapp-community-note"><b>700+ students</b> are already in the loop.</span>
          </div>

          <div className="whatsapp-community-visual" aria-label="Preview of the E-Cell WhatsApp community">
            <div className="whatsapp-community-phone">
              <div className="whatsapp-community-phone-header">
                <span className="whatsapp-community-avatar">E</span>
                <span>
                  <b>E-Cell Community</b>
                  <small>700+ members</small>
                </span>
                <i>•••</i>
              </div>
              <div className="whatsapp-community-chat" aria-live="polite">
                <span className="whatsapp-community-chat-date">TODAY</span>
                <div ref={messagesRef} className="whatsapp-community-messages">
                  {messages.map((message) => (
                    <div
                      className={`whatsapp-community-message whatsapp-community-message-${message.sender}`}
                      key={message.id}
                    >
                      {message.sender === "bot" && <b>E-Cell Guide</b>}
                      {message.text}
                      <small>{message.time}</small>
                    </div>
                  ))}
                  {isTyping && <div className="whatsapp-community-typing"><i /><i /><i /> E-Cell Guide is typing</div>}
                </div>
                <form className="whatsapp-community-composer" onSubmit={handleSendMessage}>
                  <label className="sr-only" htmlFor="community-message">Ask the E-Cell guide</label>
                  <input
                    id="community-message"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Ask E-Cell..."
                    maxLength={280}
                    autoComplete="off"
                  />
                  <button type="submit" aria-label="Send message" disabled={!draft.trim() || isTyping}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7.8 18-3.3-7-6.9-3.2L21 3Zm-11 11 4.1-4.1" /></svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
