import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import attysLogo from "../../assets/logos/attys.webp";
import cubeLogo from "../../assets/logos/cube.webp";
import easyBitesLogo from "../../assets/logos/easybites.webp";
import herodyLogo from "../../assets/logos/herody.webp";
import justvendLogo from "../../assets/logos/justvend.webp";
import mercLogo from "../../assets/logos/merc.webp";
import mileLogo from "../../assets/logos/mile.webp";
import nokiaLogo from "../../assets/logos/nokia.webp";
import tvsLogo from "../../assets/logos/tvs.webp";
import waffleLogo from "../../assets/logos/waffle.svg";
import "./Sponsors.css";

gsap.registerPlugin(ScrollTrigger);

const SPONSORS_DATA = [
  { name: "Nokia", logo: nokiaLogo, logoKey: "nokia" },
  { name: "Akshaya Motors", logo: mercLogo, label: "Akshaya Motors" },
  { name: "mile", logo: mileLogo, label: "mile" },
  { name: "TVS Prakruthi Bikes", logo: tvsLogo, label: "Prakruthi Bikes" },
  { name: "Justvend", logo: justvendLogo },
  { name: "Atty's Bakery & Confectionery", logo: attysLogo },
  { name: "Cube", logo: cubeLogo },
  { name: "The Belgian Waffle Co.", logo: waffleLogo },
  { name: "Herody", logo: herodyLogo, logoKey: "herody" },
  { name: "EasyBites", logo: easyBitesLogo, label: "EasyBites" },
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

  // Repeating the same list once makes the scrolling loop seamless.
  const marqueeList = [...SPONSORS_DATA, ...SPONSORS_DATA];

  return (
    <section ref={sponsorsSectionRef} className="sponsors-section" id="sponsors">
      <div ref={glowRef} className="sponsors-glow" />
      <div className="sponsors-divider-line" />

      <div className="wrap sponsors-header">
        <h2 className="sponsors-headline">Partners &amp; Sponsors</h2>
      </div>

      <div ref={marqueeRef} className="sponsor-marquee-wrapper">
        <div className="sponsor-marquee-track marquee-left">
          <div className="sponsor-marquee-inner">
            {marqueeList.map((item, index) => (
              <span
                key={`sponsor-${index}`}
                className="sponsor-item"
              >
                <img
                  className={`sponsor-logo${item.logoKey ? ` sponsor-logo--${item.logoKey}` : ''}`}
                  src={item.logo}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                />
                {item.label && <span className="sponsor-label">{item.label}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
