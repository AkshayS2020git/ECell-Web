import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECell RV University | Entrepreneurship Cell & Startup Community",
  description:
    "ECell RV University is the entrepreneurship cell at RV University, building a campus community for founders, innovators, and future entrepreneurs.",
  keywords: [
    "ECell RV University",
    "ecell rvu",
    "E-Cell RVU",
    "entrepreneurship cell",
    "RV University",
    "startup community",
    "student entrepreneurs",
    "innovation",
    "founders",
    "Bengaluru",
  ],
  authors: [{ name: "ECell RV University" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "https://ecell-rvu.vercel.app/",
  },
  openGraph: {
    type: "website",
    siteName: "ECell RV University",
    title: "ECell RV University | Building What’s Next",
    description:
      "Building ideas, backing founders, and growing a community of entrepreneurs at RV University.",
    url: "https://e-cell-rvu.vercel.app/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "ECell RV University | Building What’s Next",
    description:
      "The entrepreneurship cell at RV University for founders, innovators, and future entrepreneurs.",
  },
  icons: {
    icon: "/favicon.svg?v=2",
    shortcut: "/favicon.svg?v=2",
    apple: "/favicon.svg?v=2",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ECell RV University",
  alternateName: "E-Cell RVU",
  url: "https://e-cell-rvu.vercel.app/",
  description:
    "The entrepreneurship cell at RV University, building a campus community for founders, innovators, and future entrepreneurs.",
  email: "club_ecell@rvu.edu.in",
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
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
        <link rel="apple-touch-icon" href="/favicon.svg?v=2" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;900&family=Bebas+Neue&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
