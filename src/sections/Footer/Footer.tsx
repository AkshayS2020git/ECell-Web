"use client";
import React from "react";
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
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-rule" />
      <div className="wrap footer-main">
        <div className="footer-intro">
          <span className="footer-eyebrow">ENTREPRENEURSHIP CELL / RV UNIVERSITY</span>
          <h2>Let&apos;s build what&apos;s next.</h2>
        </div>

        <div className="footer-links" aria-label="Footer navigation">
          <span className="footer-links-label">EXPLORE</span>
          {FOOTER_LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        <div className="footer-socials" aria-label="Social media links">
          <span className="footer-links-label">FOLLOW</span>
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>

        <a className="footer-contact" href="mailto:club_ecell@rvu.edu.in">
          <span>START A CONVERSATION</span>
          <strong>
            club_ecell@rvu.edu.in
            <svg className="footer-contact-arrow" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 15 15 5M7 5h8v8" />
            </svg>
          </strong>
        </a>
      </div>

      <div className="wrap footer-bottom">
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
