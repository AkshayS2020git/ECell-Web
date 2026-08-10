import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("SEO routes", () => {
  it("allows crawlers and exposes the canonical sitemap", () => {
    const result = robots();
    expect(result.rules).toEqual([
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "*", allow: "/" },
    ]);
    expect(result.sitemap).toBe("https://ecell-rvu.vercel.app/sitemap.xml");
    expect(result.host).toBe("https://ecell-rvu.vercel.app");
  });

  it("returns one canonical homepage entry", () => {
    const [entry] = sitemap();
    expect(entry).toMatchObject({
      url: "https://ecell-rvu.vercel.app",
      changeFrequency: "weekly",
      priority: 1,
    });
    expect(entry.lastModified).toBeInstanceOf(Date);
  });
});
