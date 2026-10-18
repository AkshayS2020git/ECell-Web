import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["monsoon-suspend-uncloak.ngrok-free.dev"],
  images: {
    // 40 is for the blurred poster backdrops in EventsArchive.
    qualities: [40, 75, 85, 95, 100],
    // Remote sponsor logos used by event pages (src/data/events). Add a host
    // here before referencing a new one, or next/image throws at render.
    remotePatterns: [
      new URL("https://cdn.simpleicons.org/**"),
      new URL("https://bookface-images.s3.amazonaws.com/small_logos/**"),
      new URL("https://upload.wikimedia.org/wikipedia/commons/**"),
      // Hackathon logos on /opportunities, one host per source
      // (app/opportunities/_data/sources.ts): Devpost, Devfolio, Unstop, Hack Club.
      new URL("https://d112y698adiu2z.cloudfront.net/photos/**"),
      new URL("https://assets.devfolio.co/**"),
      new URL("https://d8it4huxumps7.cloudfront.net/uploads/**"),
      new URL("https://dash.hackathons.hackclub.com/**"),
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: "/Argonyx-26",
        destination: "/events/argonyx-26",
        permanent: false,
      },
      {
        source: "/Pitch-e-thon",
        destination: "/events/pitch-e-thon",
        permanent: false,
      },
      {
        source: "/E-Summit",
        destination: "/events/e-summit",
        permanent: false,
      },
      {
        source: "/Hacktoberfest-26",
        destination: "/events/hacktoberfest-26",
        permanent: false,
      },
      {
        source: "/hacktoberfest",
        destination: "/events/hacktoberfest-26",
        permanent: false,
      },
      {
        source: "/join",
        destination: "/recruit",
        permanent: false,
      },
      {
        source: "/recruitment",
        destination: "/recruit",
        permanent: false,
      },
    ];
  },
};

import("@opennextjs/cloudflare").then((module) =>
  module.initOpenNextCloudflareForDev(),
);

export default nextConfig;
