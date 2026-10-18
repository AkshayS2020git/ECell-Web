import { describe, expect, it } from "vitest";
import { mergeListings } from "@/app/opportunities/_data/hackathons";
import { placeOf } from "@/app/opportunities/_data/places";
import {
  devpostEnd,
  parseDevfolio,
  parseDevpost,
  parseHackClub,
  parseUnstop,
  type Hackathon,
} from "@/app/opportunities/_data/sources";

// Each entry below is shaped like one item from that source's live feed.

const devpostEntry = {
  id: 1,
  title: "Gator Hacks",
  url: "https://gatorhacks.devpost.com/",
  organization_name: "UF",
  displayed_location: { icon: "map-marker-alt", location: "Reitz Union" },
  submission_period_dates: "Oct 16 - 18, 2026",
  prize_amount: "$CAD <span data-currency-value>6,700</span>",
  prizes_counts: { cash: 2, other: 18 },
  themes: [{ id: 1, name: "Beginner Friendly" }, { id: 2, name: "AI" }],
  thumbnail_url: "//d112y698adiu2z.cloudfront.net/photos/production/thumb.png",
  invite_only: false,
};

describe("devpostEnd", () => {
  it.each([
    ["Oct 18, 2026", "2026-10-18"],
    ["Oct 16 - 18, 2026", "2026-10-18"],
    ["Sep 22 - Oct 18, 2026", "2026-10-18"],
    ["Dec 30, 2026 - Jan 2, 2027", "2027-01-02"],
  ])("reads the last day of %s", (dates, day) => {
    expect(devpostEnd(dates)).toBe(`${day}T23:59:59.000Z`);
  });

  it("gives up on text it can't read", () => {
    expect(devpostEnd("")).toBeUndefined();
    expect(devpostEnd("Coming soon")).toBeUndefined();
  });
});

describe("parseDevpost", () => {
  it("turns a feed entry into a listing", () => {
    expect(parseDevpost({ hackathons: [devpostEntry] })).toEqual([
      {
        id: "devpost:1",
        source: "Devpost",
        title: "Gator Hacks",
        url: "https://gatorhacks.devpost.com/",
        organiser: "UF",
        location: "Reitz Union",
        online: false,
        dates: "Oct 16 - 18, 2026",
        closesAt: "2026-10-18T23:59:59.000Z",
        prize: "$CAD 6,700",
        themes: ["Beginner Friendly", "AI"],
        thumbnail: "https://d112y698adiu2z.cloudfront.net/photos/production/thumb.png",
      },
    ]);
  });

  it("leaves out a zero prize, even when Devpost counts a cash prize", () => {
    const [listing] = parseDevpost({
      hackathons: [{ ...devpostEntry, prize_amount: "$<span>0</span>", prizes_counts: { cash: 1 } }],
    });
    expect(listing.prize).toBeUndefined();
  });

  it("drops invite-only, untitled and non-https entries", () => {
    const listings = parseDevpost({
      hackathons: [
        { ...devpostEntry, id: 2, invite_only: true },
        { ...devpostEntry, id: 3, title: "  " },
        { ...devpostEntry, id: 4, url: "javascript:alert(1)" },
        null,
        { ...devpostEntry, id: 5 },
      ],
    });
    expect(listings.map((listing) => listing.id)).toEqual(["devpost:5"]);
  });

  it("only keeps thumbnails from the image host next.config.ts allows", () => {
    const [listing] = parseDevpost({
      hackathons: [{ ...devpostEntry, thumbnail_url: "https://evil.example/x.png", displayed_location: null }],
    });
    expect(listing.thumbnail).toBeUndefined();
    expect(listing).toMatchObject({ location: "Online", online: true });
  });

  it("returns nothing for a body that isn't the feed", () => {
    expect(parseDevpost(null)).toEqual([]);
    expect(parseDevpost({ error: "down" })).toEqual([]);
  });
});

describe("parseDevfolio", () => {
  const source = {
    name: "Hackman X",
    slug: "hackman-x",
    private: false,
    is_online: false,
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    starts_at: "2026-10-26T04:30:00+00:00",
    ends_at: "2026-10-27T04:30:00+00:00",
    themes: [{ name: "Blockchain" }],
    hackathon_setting: {
      reg_ends_at: "2026-10-20T18:29:00+00:00",
      logo: "https://assets.devfolio.co/hackathons/x/logo.png",
    },
  };

  it("builds the link from the slug and places the event in its state", () => {
    const [listing] = parseDevfolio({ hits: { hits: [{ _source: source }] } });
    expect(listing).toMatchObject({
      id: "devfolio:hackman-x",
      url: "https://hackman-x.devfolio.co/",
      location: "Bengaluru, Karnataka, India",
      country: "India",
      dates: "26 – 27 Oct 2026",
      closesAt: "2026-10-20T18:29:00.000Z",
      themes: ["Blockchain"],
      thumbnail: "https://assets.devfolio.co/hackathons/x/logo.png",
    });
    // Within a degree of Bengaluru: placeOf nudges each event up to ~0.9°.
    expect(Math.abs(listing.point!.lat - 12.97)).toBeLessThan(1);
    expect(Math.abs(listing.point!.lng - 77.59)).toBeLessThan(1);
  });

  it("skips private hackathons and slugs that can't be a subdomain", () => {
    const hits = [
      { _source: { ...source, private: true } },
      { _source: { ...source, slug: "evil.com/x" } },
    ];
    expect(parseDevfolio({ hits: { hits } })).toEqual([]);
  });

  it("keeps online hackathons off the globe", () => {
    const [listing] = parseDevfolio({ hits: { hits: [{ _source: { ...source, is_online: true } }] } });
    expect(listing).toMatchObject({ location: "Online", online: true, point: undefined });
  });
});

describe("parseUnstop", () => {
  const entry = {
    id: 1771496,
    title: "The Big Hack 2.0",
    public_url: "hackathons/the-big-hack-20-1771496",
    regn_open: 1,
    region: "offline",
    end_date: "2026-11-21T18:00:00+05:30",
    organisation: { name: "Acharya Institute of Technology" },
    address_with_country_logo: { city: "Bangalore", state: "Karnataka", country: { name: "India" } },
    prizes: [
      { cash: 30000, currency: "fa-rupee" },
      { cash: 20000, currency: "fa-rupee" },
      { cash: null, currency: "fa-rupee" },
    ],
    logoUrl2: "https://d8it4huxumps7.cloudfront.net/uploads/images/150x150/acharya.png",
  };

  it("sums cash prizes in rupees and shows the apply-by date", () => {
    const [listing] = parseUnstop({ data: { data: [entry] } });
    expect(listing).toMatchObject({
      id: "unstop:1771496",
      url: "https://unstop.com/hackathons/the-big-hack-20-1771496",
      organiser: "Acharya Institute of Technology",
      location: "Bangalore, Karnataka",
      prize: "₹50,000",
      dates: "Apply by 21 Nov 2026",
      closesAt: "2026-11-21T12:30:00.000Z",
    });
    expect(listing.point).toBeDefined();
  });

  it("skips closed registrations and odd links", () => {
    const entries = [
      { ...entry, regn_open: 0 },
      { ...entry, public_url: "https://evil.example" },
    ];
    expect(parseUnstop({ data: { data: entries } })).toEqual([]);
  });

  it("shows no prize when the currencies don't match", () => {
    const [listing] = parseUnstop({
      data: { data: [{ ...entry, prizes: [{ cash: 100, currency: "fa-dollar" }, { cash: 5000, currency: "fa-rupee" }] }] },
    });
    expect(listing.prize).toBeUndefined();
  });
});

describe("parseHackClub", () => {
  const event = {
    id: "0VqIzx",
    name: "Hack Peel",
    website: "https://hackpeel.ca",
    start: "2026-12-12T09:00:00.000Z",
    end: "2026-12-13T19:00:00.000Z",
    logo: "https://dash.hackathons.hackclub.com/rails/logo.png",
    city: "Mississauga",
    state: "Ontario",
    country: "Canada",
    latitude: 43.56,
    longitude: -79.65,
    virtual: false,
  };

  it("uses the exact coordinates and closes sign-ups at the start", () => {
    const [listing] = parseHackClub([event]);
    expect(listing).toMatchObject({
      id: "hackclub:0VqIzx",
      location: "Mississauga, Ontario, Canada",
      closesAt: "2026-12-12T09:00:00.000Z",
      point: { lat: 43.56, lng: -79.65 },
    });
  });

  it("ignores coordinates that aren't on Earth", () => {
    const [listing] = parseHackClub([{ ...event, latitude: 200 }]);
    expect(listing.point).toBeUndefined();
  });
});

describe("mergeListings", () => {
  const listing = (id: string, title: string, closesAt?: string): Hackathon => ({
    id,
    source: "Devpost",
    title,
    url: "https://example.com/",
    organiser: "",
    location: "Online",
    online: true,
    dates: "",
    closesAt,
    themes: [],
  });
  const now = Date.parse("2026-10-18T00:00:00Z");

  it("keeps the first copy of a repeated hackathon", () => {
    const merged = mergeListings(
      [[listing("a", "Hack-Man X!", "2026-10-20T00:00:00Z")], [listing("b", "hackman x", "2026-10-19T00:00:00Z")]],
      now,
    );
    expect(merged.map((item) => item.id)).toEqual(["a"]);
  });

  it("drops closed listings and sorts by deadline, unknown last", () => {
    const merged = mergeListings(
      [
        [listing("late", "Late", "2026-11-01T00:00:00Z"), listing("tba", "TBA")],
        [listing("past", "Past", "2026-10-17T00:00:00Z"), listing("soon", "Soon", "2026-10-19T00:00:00Z")],
      ],
      now,
    );
    expect(merged.map((item) => item.id)).toEqual(["soon", "late", "tba"]);
  });
});

describe("placeOf", () => {
  it("places Indian events by state and others by country", () => {
    expect(placeOf("Karnataka", "India", "x")?.lat).toBeCloseTo(12.97, 0);
    expect(placeOf("Bayern", "Germany", "x")?.lat).toBeCloseTo(51.2, 0);
  });

  it("returns nothing for places it doesn't know", () => {
    expect(placeOf("", "Atlantis", "x")).toBeUndefined();
    expect(placeOf("", undefined, "x")).toBeUndefined();
  });

  it("gives the same event the same spot every time", () => {
    expect(placeOf("Karnataka", "India", "abc")).toEqual(placeOf("Karnataka", "India", "abc"));
    expect(placeOf("Karnataka", "India", "abc")).not.toEqual(placeOf("Karnataka", "India", "abd"));
  });
});
