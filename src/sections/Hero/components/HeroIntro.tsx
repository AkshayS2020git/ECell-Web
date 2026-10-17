import React from "react";
import { ArrowRight } from "lucide-react";
import { SITE_LINKS } from "@/src/content/site";
import "../styles/HeroIntro.css";

interface HeroIntroProps {
  ref?: React.Ref<HTMLDivElement>;
}

/** Top-left tagline and the WhatsApp "Join now" call to action. */
export default function HeroIntro({ ref }: HeroIntroProps): React.ReactElement {
  return (
    <div ref={ref} className="hero__intro">
      <h1 className="hero__heading">
        <span className="hero__heading-line">It all starts from an idea.</span>
        <span className="hero__heading-line">ECell RV University.</span>
      </h1>
      <a className="hero__cta" href={SITE_LINKS.whatsappGroup} target="_blank" rel="noopener noreferrer">
        <span>Join now</span>
        <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
      </a>
    </div>
  );
}
