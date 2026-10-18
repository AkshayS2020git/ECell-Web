/**
 * One parser per hackathon source, each turning that source's JSON into
 * Hackathon listings. Parsers are pure so tests can feed them saved replies.
 *
 * shortcut: only Hack Club's feed is a documented public API. Devpost,
 * Devfolio and Unstop are the JSON feeds behind their own search pages and can
 * change without notice; a source that breaks just drops out of the page.
 */
import { placeOf, type Point } from "./places";

export type Source = "Devpost" | "Devfolio" | "Unstop" | "Hack Club";

export interface Hackathon {
  /** Unique across sources, e.g. "devpost:31546". */
  id: string;
  source: Source;
  title: string;
  url: string;
  organiser: string;
  /** "Online", or the place as the source writes it. */
  location: string;
  online: boolean;
  country?: string;
  /** For display, e.g. "Oct 16 - 18, 2026" or "24 – 25 Oct 2026". */
  dates: string;
  /** ISO time after which you can no longer sign up or submit. Sort key. */
  closesAt?: string;
  /** Cash prizes, e.g. "$9,500" or "₹50,000". */
  prize?: string;
  themes: string[];
  thumbnail?: string;
  /** Where to put it on the globe. Missing for online events and unknown places. */
  point?: Point;
}

export interface SourceFeed {
  source: Source;
  url: string;
  init?: RequestInit;
  parse: (body: unknown) => Hackathon[];
}

// ---------- shared helpers ----------

export const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const list = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

/** An https URL, or undefined. Devpost writes some links without a scheme ("//host/path"). */
export function httpsUrl(value: unknown): string | undefined {
  const text = str(value);
  if (!text) return undefined;
  try {
    const url = new URL(text.startsWith("//") ? `https:${text}` : text);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * An image URL under `prefix`, or undefined. next/image throws on hosts that
 * aren't in next.config.ts, so each source's image host is listed there and
 * anything else falls back to the letter tile.
 */
function imageUrl(value: unknown, prefix: string): string | undefined {
  const url = httpsUrl(value);
  return url?.startsWith(prefix) ? url : undefined;
}

/** A parseable date as an ISO string, or undefined. */
export function isoDate(value: unknown): string | undefined {
  const text = str(value);
  const time = text ? Date.parse(text) : NaN;
  return Number.isNaN(time) ? undefined : new Date(time).toISOString();
}

const inIndia = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "Asia/Kolkata" });
const dayOf = inIndia({ day: "numeric" });
const dayMonth = inIndia({ day: "numeric", month: "short" });
const monthYear = inIndia({ month: "short", year: "numeric" });

/** "24 Oct 2026", "24 – 25 Oct 2026" or "30 Oct – 1 Nov 2026", in Indian time. */
export function formatRange(start?: string, end?: string): string {
  const last = end ?? start;
  if (!last) return "";
  const to = new Date(last);
  const from = start ? new Date(start) : to;
  const tail = `${dayMonth.format(to)} ${to.toLocaleString("en-GB", { year: "numeric", timeZone: "Asia/Kolkata" })}`;
  if (dayMonth.format(from) === dayMonth.format(to)) return tail;
  const head = monthYear.format(from) === monthYear.format(to) ? dayOf.format(from) : dayMonth.format(from);
  return `${head} – ${tail}`;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/**
 * The last day of a Devpost date range, as the end of that day in UTC.
 * Handles "Oct 18, 2026", "Oct 16 - 18, 2026", "Sep 22 - Oct 18, 2026" and
 * "Dec 30, 2026 - Jan 2, 2027".
 */
export function devpostEnd(dates: string): string | undefined {
  const year = dates.match(/\d{4}(?!.*\d{4})/)?.[0];
  const endPart = dates.split(" - ").pop() ?? "";
  const monthName = (endPart.match(/[A-Za-z]{3}/) ?? dates.match(/[A-Za-z]{3}/))?.[0].toLowerCase();
  const day = endPart.match(/\d{1,2}(?!\d)/)?.[0];
  const month = monthName ? MONTHS.indexOf(monthName) : -1;
  if (!year || !day || month < 0) return undefined;
  return new Date(Date.UTC(Number(year), month, Number(day), 23, 59, 59)).toISOString();
}

// ---------- Devpost ----------

export function parseDevpost(body: unknown): Hackathon[] {
  return list(record(body).hackathons).flatMap((item): Hackathon[] => {
    const url = httpsUrl(item.url);
    const title = str(item.title);
    if (item.invite_only || typeof item.id !== "number" || !url || !title) return [];

    const location = str(record(item.displayed_location).location) || "Online";
    const dates = str(item.submission_period_dates);
    const prize = str(item.prize_amount).replace(/<[^>]*>/g, "").replace(/\s+/g, " ");

    return [
      {
        id: `devpost:${item.id}`,
        source: "Devpost",
        title,
        url,
        organiser: str(item.organization_name),
        location,
        online: location === "Online",
        dates,
        closesAt: devpostEnd(dates),
        // Devpost sometimes counts a cash prize but totals it as "$0".
        prize: /[1-9]/.test(prize) ? prize : undefined,
        themes: list(item.themes).map((theme) => str(theme.name)).filter(Boolean),
        // Their placeholder lives on another host; only real thumbnails are on this one.
        thumbnail: imageUrl(item.thumbnail_url, "https://d112y698adiu2z.cloudfront.net/photos/"),
      },
    ];
  });
}

// ---------- Devfolio ----------

export function parseDevfolio(body: unknown): Hackathon[] {
  const hits = list(record(record(body).hits).hits);
  return hits.flatMap((hit): Hackathon[] => {
    const item = record(hit._source);
    const slug = str(item.slug);
    const title = str(item.name);
    if (!/^[a-z0-9-]+$/i.test(slug) || !title || item.private) return [];

    const setting = record(item.hackathon_setting);
    const online = item.is_online === true;
    const city = str(item.city);
    const state = str(item.state);
    const country = str(item.country) || undefined;
    const startsAt = isoDate(item.starts_at);
    const endsAt = isoDate(item.ends_at);

    return [
      {
        id: `devfolio:${slug}`,
        source: "Devfolio",
        title,
        url: `https://${slug}.devfolio.co/`,
        organiser: str(item.hosted_by),
        location: online ? "Online" : [city, state, country].filter(Boolean).join(", ") || "In person",
        online,
        country,
        dates: formatRange(startsAt, endsAt),
        closesAt: isoDate(setting.reg_ends_at) ?? startsAt,
        themes: list(item.themes).map((theme) => str(theme.name)).filter(Boolean),
        thumbnail: imageUrl(setting.logo, "https://assets.devfolio.co/"),
        point: online ? undefined : placeOf(state, country, slug),
      },
    ];
  });
}

// ---------- Unstop ----------

const UNSTOP_CURRENCIES: Record<string, string> = { "fa-rupee": "INR", "fa-dollar": "USD" };

function unstopPrize(prizes: Record<string, unknown>[]): string | undefined {
  const cash = prizes.filter((prize) => typeof prize.cash === "number" && prize.cash > 0);
  const currency = UNSTOP_CURRENCIES[str(cash[0]?.currency)];
  if (!currency || cash.some((prize) => prize.currency !== cash[0].currency)) return undefined;
  const total = cash.reduce((sum, prize) => sum + (prize.cash as number), 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(total);
}

export function parseUnstop(body: unknown): Hackathon[] {
  return list(record(record(body).data).data).flatMap((item): Hackathon[] => {
    const path = str(item.public_url);
    const title = str(item.title);
    if (typeof item.id !== "number" || !/^[\w/-]+$/.test(path) || !title || item.regn_open !== 1) return [];

    const address = record(item.address_with_country_logo);
    const online = str(item.region) === "online";
    const city = str(address.city);
    const state = str(address.state);
    const country = str(record(address.country).name) || undefined;
    const closesAt = isoDate(item.end_date);

    return [
      {
        id: `unstop:${item.id}`,
        source: "Unstop",
        title,
        url: `https://unstop.com/${path}`,
        organiser: str(record(item.organisation).name),
        location: online ? "Online" : [city, state].filter(Boolean).join(", ") || "In person",
        online,
        country,
        dates: closesAt ? `Apply by ${formatRange(closesAt)}` : "",
        closesAt,
        prize: unstopPrize(list(item.prizes)),
        themes: [],
        thumbnail: imageUrl(item.logoUrl2, "https://d8it4huxumps7.cloudfront.net/uploads/"),
        point: online ? undefined : placeOf(state, country, String(item.id)),
      },
    ];
  });
}

// ---------- Hack Club ----------

export function parseHackClub(body: unknown): Hackathon[] {
  return list(body).flatMap((item): Hackathon[] => {
    const url = httpsUrl(item.website);
    const title = str(item.name);
    const id = str(item.id);
    if (!url || !title || !id) return [];

    const online = item.virtual === true;
    const startsAt = isoDate(item.start);
    const { latitude: lat, longitude: lng } = item;
    const hasPoint = typeof lat === "number" && typeof lng === "number" && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

    return [
      {
        id: `hackclub:${id}`,
        source: "Hack Club",
        title,
        url,
        organiser: "",
        location: online
          ? "Online"
          : [str(item.city), str(item.state), str(item.country)].filter(Boolean).join(", ") || "In person",
        online,
        country: str(item.country) || undefined,
        dates: formatRange(startsAt, isoDate(item.end)),
        // Sign-ups close when the event starts.
        closesAt: startsAt,
        themes: [],
        thumbnail: imageUrl(item.logo, "https://dash.hackathons.hackclub.com/"),
        point: !online && hasPoint ? { lat, lng } : undefined,
      },
    ];
  });
}

// ---------- feeds ----------

export const FEEDS: SourceFeed[] = [
  {
    source: "Devpost",
    url: "https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&order_by=deadline&per_page=40",
    parse: parseDevpost,
  },
  {
    source: "Devfolio",
    url: "https://api.devfolio.co/api/search/hackathons",
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "application_open", from: 0, size: 40 }),
    },
    parse: parseDevfolio,
  },
  {
    source: "Unstop",
    url: "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=40&oppstatus=open",
    parse: parseUnstop,
  },
  {
    source: "Hack Club",
    url: "https://hackathons.hackclub.com/api/events/upcoming/",
    parse: parseHackClub,
  },
];
