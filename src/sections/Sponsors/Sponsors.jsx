import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Sponsors.css";

gsap.registerPlugin(ScrollTrigger);

const SPONSORS_DATA = [
  { name: "Google Cloud", tier: "Title Partner", category: "Cloud & AI" },
  { name: "Sequoia Capital", tier: "Venture Partner", category: "Venture Capital" },
  { name: "Microsoft for Startups", tier: "Ecosystem Partner", category: "Tech & Cloud" },
  { name: "AWS Startups", tier: "Cloud Partner", category: "Infrastructure" },
  { name: "Y Combinator", tier: "Knowledge Partner", category: "Accelerator" },
  { name: "Techstars", tier: "Global Partner", category: "Accelerator" },
  { name: "HubSpot for Startups", tier: "Growth Partner", category: "CRM & Scale" },
  { name: "Notion", tier: "Productivity Partner", category: "Software" },
  { name: "AngelList", tier: "Investment Network", category: "Angel Funding" },
  { name: "Razorpay Rize", tier: "Fintech Partner", category: "Payments" },
];

export default function Sponsors() {
  const sponsorsSectionRef = useRef(null);
  const glowRef = useRef(null);
  const marqueeRef = useRef(null);

  useEffect(() => {
    const section = sponsorsSectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(section, { opacity: 1, y: 0, clipPath: "none" });
      if (marqueeRef.current) gsap.set(marqueeRef.current, { opacity: 1, y: 0, scale: 1 });
      if (glowRef.current) gsap.set(glowRef.current, { opacity: 0.35, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Clean, unified full-section reveal when scrolling into Sponsors
      gsap.fromTo(
        section,
        {
          opacity: 0,
          y: 34,
          clipPath: "inset(8% 0 0 round 42% 42% 0 0)",
        },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0% 0 0 round 0 0 0 0)",
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Ambient radial glow expansion on scroll
      if (glowRef.current) {
        gsap.fromTo(
          glowRef.current,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1.25,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 95%",
              end: "bottom 20%",
              scrub: 1,
            },
          }
        );
      }

      if (marqueeRef.current) {
        gsap.fromTo(
          marqueeRef.current,
          { y: 34, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  const marqueeList1 = [...SPONSORS_DATA, ...SPONSORS_DATA];
  const marqueeList2 = [...SPONSORS_DATA].reverse().concat([...SPONSORS_DATA].reverse());

  return (
    <section ref={sponsorsSectionRef} className="sponsors-section" id="sponsors">
      <div ref={glowRef} className="sponsors-glow" />
      <div className="sponsors-divider-line" />

      <div className="wrap sponsors-header">
        <span className="eyebrow">PARTNERS & SPONSORS</span>
        <h2 className="sponsors-headline">Backed by Innovators & Builders</h2>
      </div>

      <div ref={marqueeRef} className="sponsor-marquee-wrapper">
        {/* Row 1 - Scroll Left */}
        <div className="sponsor-marquee-track marquee-left">
          <div className="sponsor-marquee-inner">
            {marqueeList1.map((item, index) => (
              <span key={`m1-${index}`} className="sponsor-item">
                <span className="sponsor-name">{item.name}</span>
                <span className="sponsor-bullet">•</span>
              </span>
            ))}
          </div>
        </div>

        {/* Row 2 - Scroll Right */}
        <div className="sponsor-marquee-track marquee-right">
          <div className="sponsor-marquee-inner">
            {marqueeList2.map((item, index) => (
              <span key={`m2-${index}`} className="sponsor-item sponsor-item-dim">
                <span className="sponsor-name">{item.name}</span>
                <span className="sponsor-tag">{item.category}</span>
                <span className="sponsor-bullet">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
