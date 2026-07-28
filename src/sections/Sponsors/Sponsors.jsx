import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import attysLogo from "../../assets/logos/attys.png";
import easyBitesLogo from "../../assets/logos/easybites.png";
import herodyLogo from "../../assets/logos/herody.png";
import justvendLogo from "../../assets/logos/justvend.png";
import mercLogo from "../../assets/logos/merc.png";
import mileLogo from "../../assets/logos/mile.png";
import nokiaLogo from "../../assets/logos/nokia.png";
import tvsLogo from "../../assets/logos/tvs.png";
import waffleLogo from "../../assets/logos/waffle.svg";
import "./Sponsors.css";

gsap.registerPlugin(ScrollTrigger);

const SPONSORS_DATA = [
  { name: "TVS Prakruthi Bikes", logo: tvsLogo, logoKey: "tvs", label: "Prakruthi Bikes" },
  { name: "Justvend", logo: justvendLogo, logoKey: "justvend" },
  { name: "Atty's Bakery & Confectionery", logo: attysLogo, logoKey: "attys" },
  { name: "The Belgian Waffle Co.", logo: waffleLogo, logoKey: "waffle" },
  { name: "Herody", logo: herodyLogo, logoKey: "herody" },
  { name: "EasyBites", logo: easyBitesLogo, logoKey: "easybites", label: "EasyBites" },
  { name: "mile", logo: mileLogo, logoKey: "mile", label: "mile" },
  { name: "Akshaya Motors", logo: mercLogo, logoKey: "merc", label: "Akshaya Motors" },
  { name: "Nokia", logo: nokiaLogo, logoKey: "nokia" },
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
                className={`sponsor-item sponsor-item--${item.logoKey}${item.label ? " sponsor-item--with-label" : ""}`}
              >
                <img className={`sponsor-logo sponsor-logo--${item.logoKey}`} src={item.logo} alt={item.name} />
                {item.label && <span className="sponsor-label">{item.label}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
