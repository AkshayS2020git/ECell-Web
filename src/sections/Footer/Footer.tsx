"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "../../utils/gsapSetup";
import "./Footer.css";

export interface FooterLink {
  label: string;
  href: string;
}

const FOOTER_LINKS: FooterLink[] = [
  { label: "About", href: "#aboutSection" },
  { label: "Events", href: "#eventsSection" },
  { label: "Speakers", href: "#speakers" },
];

const SOCIAL_LINKS: FooterLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/ecell_rvu/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/search/results/all/?keywords=ECell%2C%20RV%20University&origin=RICH_QUERY_SUGGESTION&heroEntityKey=urn%3Ali%3Aorganization%3A96671040&position=1" },
];

export default function Footer(): React.ReactElement {
  const footerRef = useRef<HTMLElement | null>(null);
  const wipeBarRef = useRef<HTMLDivElement | null>(null);
  const horizonGlowRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLDivElement | null>(null);
  const socialsRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLAnchorElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // ── Luminous Wipe Bar ──
      if (wipeBarRef.current) {
        gsap.fromTo(
          wipeBarRef.current,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 1,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: footer,
              start: "top 90%",
              end: "top 50%",
              scrub: 0.5,
            },
          }
        );
        gsap.to(wipeBarRef.current, {
          opacity: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 45%",
            end: "top 20%",
            scrub: 0.5,
          },
        });
      }

      // ── Horizon Arc Glow Expansion ──
      if (horizonGlowRef.current) {
        gsap.fromTo(
          horizonGlowRef.current,
          { scaleY: 0, opacity: 0 },
          {
            scaleY: 1.4,
            opacity: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footer,
              start: "top 92%",
              end: "top 35%",
              scrub: 0.7,
            },
          }
        );
      }

      // ── Horizon Stagger Blur-Reveal Timeline ──
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: footer,
          start: "top 82%",
          end: "top 25%",
          scrub: 0.8,
        },
      });

      // Headline scale-down & blur clear
      if (introRef.current) {
        footerTl.fromTo(
          introRef.current,
          { y: 50, scale: 1.06, opacity: 0, filter: "blur(8px)" },
          { y: 0, scale: 1, opacity: 1, filter: "blur(0px)", ease: "power3.out" },
          0
        );
      }

      // Stagger column items
      const cols = [linksRef.current, socialsRef.current, contactRef.current].filter(Boolean);
      if (cols.length > 0) {
        footerTl.fromTo(
          cols,
          { y: 40, opacity: 0, filter: "blur(4px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.05, ease: "power3.out" },
          0.1
        );
      }

      // Bottom bar fade up
      if (bottomRef.current) {
        footerTl.fromTo(
          bottomRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, ease: "power2.out" },
          0.2
        );
      }
    }, footer);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="site-footer" id="footer">
      {/* Horizon Fade transition elements */}
      <div ref={wipeBarRef} className="section-wipe-bar" aria-hidden="true" />
      <div ref={horizonGlowRef} className="section-horizon-glow" aria-hidden="true" />
      <div className="footer-rule" />

      <div className="wrap footer-main">
        <div ref={introRef} className="footer-intro">
          <span className="footer-eyebrow">ENTREPRENEURSHIP CELL / RV UNIVERSITY</span>
          <h2>Let&apos;s build what&apos;s next.</h2>
        </div>

        <div ref={linksRef} className="footer-links" aria-label="Footer navigation">
          <span className="footer-links-label">EXPLORE</span>
          {FOOTER_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        <div ref={socialsRef} className="footer-socials" aria-label="Social media links">
          <span className="footer-links-label">FOLLOW</span>
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>

        <a ref={contactRef} className="footer-contact" href="mailto:club_ecell@rvu.edu.in">
          <span>START A CONVERSATION</span>
          <strong>
            club_ecell@rvu.edu.in
            <svg className="footer-contact-arrow" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 15 15 5M7 5h8v8" />
            </svg>
          </strong>
        </a>
      </div>

      <div ref={bottomRef} className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} ECELL RV UNIVERSITY</span>
        <span className="footer-credit">
          Made with <span className="footer-credit-heart" aria-label="love">♥</span> by ECell Tech Team
        </span>
        <button className="footer-top-button" onClick={scrollToTop} type="button">
          BACK TO TOP <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}

