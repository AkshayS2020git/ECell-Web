import type { Metadata } from "next";
import { SITE_URL } from "@/src/utils/constants";
import GalleryClient from "./GalleryClient";

const title = "Argonyx '26 Gallery";
const description =
  "Photo gallery from Argonyx '26 — the 24-hour national hackathon at RV University, Bengaluru. Explore moments from inauguration, coding sessions, mentor sessions, judging rounds, and more.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | ECell RV University`,
    description,
    url: `${SITE_URL}/events/argonyx-26/gallery`,
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Argonyx '26 hackathon at RV University",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ECell RV University`,
    description,
  },
  // Without this the page inherits the homepage canonical from the root
  // layout, which tells Google the gallery is a duplicate of "/".
  alternates: {
    canonical: `${SITE_URL}/events/argonyx-26/gallery`,
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
