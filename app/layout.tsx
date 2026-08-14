import type { Metadata } from "next";
import { Archivo, Bebas_Neue, Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ECell RV University logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECell RV University | Building What's Next",
    description:
      "The official entrepreneurship cell at RV University — for founders, innovators, and future entrepreneurs.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon-48x48.png",
    apple: "/apple-touch-icon.png",
  },
  category: "education",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ECell RV University",
  alternateName: ["E-Cell RVU", "ECell RVU", "Entrepreneurship Cell RV University"],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
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
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="shortcut icon" href="/favicon-48x48.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
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
      <body
        className={`${archivo.variable} ${bebasNeue.variable} ${fraunces.variable} ${inter.variable}`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
