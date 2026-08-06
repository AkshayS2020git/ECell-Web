import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./globals.css";

const SITE_URL = "https://ecell-rvu.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "ECell RV University | Entrepreneurship Cell & Startup Community",
    template: "%s | ECell RV University",
  },
  description:
    "ECell RV University is the official entrepreneurship cell at RV University, Bengaluru. We build a thriving campus community for founders, innovators, and future entrepreneurs through events, mentorship, and startup resources.",
  keywords: [
    "ECell RV University",
    "ecell rvu",
    "E-Cell RVU",
    "entrepreneurship cell",
    "RV University",
    "RV University entrepreneurship",
    "startup community Bengaluru",
    "student entrepreneurs India",
    "innovation cell",
    "founders",
    "Bengaluru startups",
    "college entrepreneurship",
    "startup events Bengaluru",
    "student startup community",
  ],
  authors: [{ name: "ECell RV University" }],
  creator: "ECell RV University",
  publisher: "ECell RV University",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "ECell RV University",
    title: "ECell RV University | Building What's Next",
    description:
      "Building ideas, backing founders, and growing a community of entrepreneurs at RV University, Bengaluru.",
    url: SITE_URL,
    locale: "en_IN",
    images: [
      {
        url: "/ECell_Logo_Black.svg",
        alt: "ECell RV University logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECell RV University | Building What's Next",
    description:
      "The official entrepreneurship cell at RV University — for founders, innovators, and future entrepreneurs.",
    images: ["/ECell_Logo_Black.svg"],
  },
  icons: {
    icon: "/favicon.svg?v=3",
    shortcut: "/favicon.svg?v=3",
    apple: "/favicon.svg?v=3",
  },
  category: "education",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ECell RV University",
  alternateName: ["E-Cell RVU", "ECell RVU", "Entrepreneurship Cell RV University"],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/ECell_Logo_Black.svg`,
  description:
    "The official entrepreneurship cell at RV University, Bengaluru — building a thriving campus community for founders, innovators, and future entrepreneurs.",
  email: "club_ecell@rvu.edu.in",
  foundingDate: "2023",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "RV University",
    url: "https://www.rvu.edu.in",
  },
  sameAs: [
    "https://www.instagram.com/ecell_rvu/",
    "https://www.linkedin.com/search/results/all/?keywords=ECell%2C%20RV%20University",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3" />
        <link rel="shortcut icon" href="/favicon.svg?v=3" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=3" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;900&family=Bebas+Neue&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                window.scrollTo(0, 0);
                window.addEventListener('beforeunload', function() {
                  window.scrollTo(0, 0);
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
