import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/utils/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    // Everything public is crawlable. Legacy paths such as /Argonyx-26 stay
    // allowed so crawlers can follow their redirects to the canonical URLs.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
