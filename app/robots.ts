import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://ecell-rvu.vercel.app/sitemap.xml",
    host: "https://ecell-rvu.vercel.app",
  };
}
