import type { EventDetailData } from "./types";
// Official Argonyx '26 poster.
import argonyx26Poster from "../../assets/events/events_photo/cta.webp";
import winnerPhoto from "../../assets/Argonyx26/winningTeams/winner.webp";
import runnerUpPhoto from "../../assets/Argonyx26/winningTeams/runnerups.webp";
import secondRunnerUpPhoto from "../../assets/Argonyx26/winningTeams/secondrunnerup.webp";

export const argonyx26Event: EventDetailData = {
  slug: "argonyx-26",
  title: "ARGONYX '26",
  isCompleted: true,
  hero: {
    eyebrow: "24-Hour National Hackathon · Concluded",
    headline: "Build something",
    accent: " that ships.",
    body:
      "One venue, one clock, twenty-four hours. Pick a problem worth solving, build a real working solution, and pitch it to judges who care about execution — not just slides. Run by The Entrepreneurship Cell, VIKSHA, and IEEE at RV University.",
  },
  about: {
    eyebrow: "What is Argonyx",
    headline: "Not another",
    accent: " idea deck.",
    description:
      "ARGONYX was a 24-hour national hackathon hosted at RV University, Bengaluru — one continuous build, start to finish. Teams showed up, built real products, and defended what they shipped in front of a panel of active builders and jury members.",
    note:
      "This edition of Argonyx has successfully concluded. Stay tuned for future editions and upcoming founder conclaves.",
  },
  format: "24-hour national hackathon — build, then pitch",
  date: "25–26 September 2026",
  dateBadge: "COMPLETED · 25–26 SEP 2026 · RV UNIVERSITY, BENGALURU",
  venue: "RV University, Bengaluru",
  prizePool: "Upto ₹30,000",
  registration: {
    url:
      "https://unstop.com/hackathons/argonyx26-rv-university-1748836",
    ctaText: "View on Unstop ↗",
    headline: "Argonyx '26 has",
    accent: "successfully concluded.",
    hint: "Official hackathon archive on Unstop.",
  },
  image: argonyx26Poster,
  imageIsPoster: true,
  ledger: [
    {
      number: "01",
      label: "Format",
      value: "24-hour national hackathon — build, then pitch",
    },
    {
      number: "02",
      label: "Dates",
      value: "25–26 September 2026",
    },
    {
      number: "03",
      label: "Venue",
      value: "RV University, Bengaluru",
    },
    {
      number: "04",
      label: "Prize pool",
      value: "Upto ₹30,000",
    },
  ],
  organizers: [
    "RV University",
    "The Entrepreneurship Cell, RV University",
    "VIKSHA",
    "IEEE RV University",
  ],
  contacts: [
    {
      name: "Alok Murali",
      phone: "+91 96110 83196",
    },
    {
      name: "Ayush S Kulkarni",
      phone: "+91 86606 97430",
    },
    {
      name: "Kushal Kuladeepa S N",
      phone: "+91 80732 88190",
    },
  ],
  winners: {
    headline: "Champions of",
    accent: " Argonyx '26.",
    subhead:
      "Honoring the builders and visionary teams who shipped real working solutions in 24 continuous hours.",
    items: [
      {
        place: "1ST PLACE",
        badge: "Grand Champion",
        teamName: "Lords of the Pings",
        projectTitle: "Argonyx '26 Grand Winners",
        description:
          "Dominated the 24-hour national hackathon with a real, shippable solution — built, demoed, and defended under pressure.",
        photoCaption: "Lords of the Pings — Grand Champions",
        photo: winnerPhoto,
      },
      {
        place: "2ND PLACE",
        badge: "First Runner-Up",
        teamName: "Zero Shift",
        projectTitle: "Argonyx '26 First Runner-Up",
        description:
          "Delivered an impressive working prototype in 24 continuous hours, earning recognition from the jury panel.",
        photoCaption: "Zero Shift — First Runner-Up",
        photo: runnerUpPhoto,
      },
      {
        place: "3RD PLACE",
        badge: "Second Runner-Up",
        teamName: "Team Acers",
        projectTitle: "Argonyx '26 Second Runner-Up",
        description:
          "Secured third place with an outstanding build during the 24-hour national hackathon sprint.",
        photoCaption: "Team Acers — Second Runner-Up",
        photo: secondRunnerUpPhoto,
      },
    ],
    badges: ["ARGONYX '26", "24-HR NATIONAL HACKATHON"],
  },
  gallery: {
    eyebrow: "Captured Moments · Argonyx '26",
    headline: "View Images",
    accent: " Moments from the floor.",
    subhead:
      "Highlights from the 24-hour sprint — from opening keynotes and midnight builds to jury defenses and the podium ceremony.",
    spaces: [
      {
        id: "opening",
        title: "Opening Ceremony & Keynote",
        category: "KICKOFF · DAY 1",
      },
      {
        id: "midnight",
        title: "24-Hour Midnight Sprint",
        category: "HACKING FLOOR · 02:00 AM",
      },
      {
        id: "mentorship",
        title: "Mentorship & Architecture Reviews",
        category: "JURY ROUND 1",
      },
      {
        id: "pitching",
        title: "Final Stage Pitching & Demos",
        category: "DEMO DAY · DAY 2",
      },
      {
        id: "podium",
        title: "Winners Podium & Trophy Distribution",
        category: "AWARDS CEREMONY",
      },
      {
        id: "group",
        title: "All Hackers & Organizing Crew",
        category: "CLOSING CEREMONY",
      },
    ],
  },
  meta: {
    title: "Argonyx '26 Hackathon | ECell RV University",
    description:
      "Argonyx '26 — 24-hour national hackathon hosted at RV University, Bengaluru. Winners announced, event concluded.",
  },
};
