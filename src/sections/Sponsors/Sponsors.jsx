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
import redbull from "../../assets/logos/redbull.png";
import "./Sponsors.css";

gsap.registerPlugin(ScrollTrigger);

const SPONSORS_DATA = [
  { name: "Nokia", logo: nokiaLogo, logoKey: "nokia" },
  { name: "Akshaya Motors", logo: mercLogo, label: "Akshaya Motors" },
  { name: "mile", logo: mileLogo, label: "mile" },
  { name: "TVS Prakruthi Bikes", logo: tvsLogo, label: "Prakruthi Bikes" },
  {name: "redbull", logo: redbull},
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
  const headerRef = useRef(null);

  useEffect(() => {
    const section = sponsorsSectionRef.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      if (headerRef.current) gsap.set(headerRef.current, { opacity: 1, y: 0 });
      if (marqueeRef.current) gsap.set(marqueeRef.current, { opacity: 1, y: 0, scale: 1 });
      if (glowRef.current) gsap.set(glowRef.current, { opacity: 0.35, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Smooth content reveal as user scrolls into Sponsors
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 35%",
          scrub: 0.8,
        },
      });

      if (headerRef.current) {
        tl.fromTo(
          headerRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, ease: "power2.out" },
          0
        );
      }

      if (marqueeRef.current) {
        tl.fromTo(
          marqueeRef.current,
          { y: 40, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, ease: "power2.out" },
          0.1
        );
      }

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
              end: "top 20%",
              scrub: 0.8,
            },
          }
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

      <div ref={headerRef} className="wrap sponsors-header">
        <span className="sponsors-kicker">Supported by</span>
        <h2 className="sponsors-headline">Partners &amp; Sponsors</h2>
        <p className="sponsors-intro">The organisations helping us turn ideas into action.</p>
      </div>

      <div ref={marqueeRef} className="sponsor-marquee-wrapper">
        <div className="sponsor-marquee-track marquee-left">
          <div className="sponsor-marquee-inner">
            {marqueeList.map((item, index) => (
              <span
                key={`sponsor-${index}`}
                className="sponsor-item"
              >
                <span className="sponsor-logo-frame">
                  <img
                    className={`sponsor-logo${item.logoKey ? ` sponsor-logo--${item.logoKey}` : ''}`}
                    src={item.logo}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                {item.label && <span className="sponsor-label">{item.label}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
