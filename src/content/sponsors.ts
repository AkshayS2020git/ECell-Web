import type { StaticImageData } from "next/image";
import attysLogo from "@/src/assets/logos/attys.webp";
import runanywhereLogo from "@/src/assets/logos/runanywhere.webp";
import easyBitesLogo from "@/src/assets/logos/easybites.webp";
import herodyLogo from "@/src/assets/logos/herody.webp";
import justvendLogo from "@/src/assets/logos/justvend.webp";
import mercLogo from "@/src/assets/logos/merc.webp";
import mileLogo from "@/src/assets/logos/mile.webp";
import nokiaLogo from "@/src/assets/logos/nokia.webp";
import tvsLogo from "@/src/assets/logos/tvs.webp";
import waffleLogo from "@/src/assets/logos/waffle.svg";
import redbull from "@/src/assets/logos/redbull.webp";
import arkLogo from "@/src/assets/logos/ARK LOGO-01 .webp";
import fitMuscleLogo from "@/src/assets/logos/fit-muscle.webp";
import fiveSpeedLogo from "@/src/assets/logos/fivespeed bike rental.webp";
import hoogwayLogo from "@/src/assets/logos/hoogway.webp";
import hpLogo from "@/src/assets/logos/hp.webp";
import ixigoLogo from "@/src/assets/logos/ixigo.webp";
import mahindraLogo from "@/src/assets/logos/mahindra.webp";
import studio11Logo from "@/src/assets/logos/studio 11.svg";
import tazishLogo from "@/src/assets/logos/tazish.webp";
import technosportLogo from "@/src/assets/logos/technosport.webp";
import ccLogo from "@/src/assets/logos/codechief.webp";
import wafflingStationLogo from "@/src/assets/logos/waffling station.webp";

export interface SponsorItem {
  id: string;
  name: string;
  logo: StaticImageData | string;
  logoKey?: string;
  tier?: "featured" | "core";
  row: number;
  url?: string;
}

export const SPONSORS: SponsorItem[] = [
  // Row 1: 3 items (North Pioneers)
  { id: "node-nokia", name: "Nokia", logo: nokiaLogo, logoKey: "nokia", tier: "featured", row: 1, url: "https://www.nokia.com/" },
  { id: "node-redbull", name: "Red Bull", logo: redbull, tier: "featured", row: 1, url: "https://www.redbull.com/" },
  { id: "node-hoogway", name: "Hoogway", logo: hoogwayLogo, tier: "core", row: 1, url:"https://hoogway.ai/" },

  // Row 2: 5 items (Mid-North Anchors)
  { id: "node-waffle", name: "The Belgian Waffle Co.", logo: waffleLogo, tier: "core", row: 2, url: "https://thebelgianwaffle.co/" },
  { id: "node-tvs", name: "TVS Prakruthi Bikes", logo: tvsLogo, tier: "core", row: 2, url: "https://tvsmotor.com" },
  { id: "node-herody", name: "Herody", logo: herodyLogo, logoKey: "herody", tier: "featured", row: 2, url: "https://herody.in" },
  { id: "node-merc", name: "Akshaya Motors", logo: mercLogo, tier: "featured", row: 2, url: "https://www.mercedes-benz.co.in/" },
  { id: "node-waffling-station", name: "Waffling Station", logo: wafflingStationLogo, tier: "core", row: 2, url:"https://www.instagram.com/thewafflingstation" },

  // Row 3: 3 items (Mid-South Growth Network)
  { id: "node-attys", name: "Atty's Bakery & Confectionery", logo: attysLogo, tier: "core", row: 3, url: "https://attysbakery.dotpe.in/" },
  { id: "node-cube", name: "Runanywhere", logo: runanywhereLogo, tier: "core", row: 3,url:"https://www.runanywhere.ai/" },
  { id: "node-justvend", name: "Justvend", logo: justvendLogo, tier: "core", row: 3, url: "https://www.justvend.in" },

  // Row 4: 2 items (South Base Connectors)
  { id: "node-easybites", name: "EasyBites", logo: easyBitesLogo, tier: "core", row: 4, url: "https://easybites.in/" },
  { id: "node-mile", name: "mile", logo: mileLogo, tier: "core", row: 4, url: "https://www.mile.tech/" },

  // Additional partner logos — add each respective URL here when available.
  { id: "node-fit-muscle", name: "Fit Muscle", logo: fitMuscleLogo, tier: "core", row: 3, url: "https://www.fitmusclepremiumfitness.store/" },
  { id: "node-ark", name: "ARK", logo: arkLogo, tier: "core", row: 4, url:"https://www.arkinfo.in/" },
  { id: "node-fivespeed", name: "FiveSpeed Bike Rental", logo: fiveSpeedLogo, tier: "core", row: 5, url: "https://fivespeedbike.com/" },
  { id: "node-hp", name: "HP", logo: hpLogo, tier: "core", row: 5, url: "https://www.hp.com/in-en/home.html" },
  { id: "node-ixigo", name: "ixigo", logo: ixigoLogo, tier: "core", row: 5, url: "https://www.ixigo.com/" },
  { id: "node-mahindra", name: "Mahindra", logo: mahindraLogo, tier: "core", row: 5, url: "https://www.mahindra.com/" },
  { id: "node-studio-11", name: "Studio 11", logo: studio11Logo, tier: "core", row: 5, url: "https://www.studio11.in/" },
  { id: "node-tazish", name: "Tazish", logo: tazishLogo, tier: "core", row: 5,url:"https://www.instagram.com/tazishpoket" },
  { id: "node-technosport", name: "Technosport", logo: technosportLogo, tier: "core", row: 5, url:"https://www.technosport.in/" },
  { id: "codechief",name :"codechief",logo: ccLogo, tier:"core", row: 5, url:"https://www.codechef.com/" }
];
