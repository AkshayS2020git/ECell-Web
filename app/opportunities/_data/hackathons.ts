import { FEEDS, type Hackathon, type Source } from "./sources";

export type { Hackathon, Source } from "./sources";

export interface Listings {
  hackathons: Hackathon[];
  /** The sources that answered, in FEEDS order. */
  sources: Source[];
}

/** Same title once lowercased with punctuation and spaces dropped. */
const titleKey = (title: string) => title.toLowerCase().replace(/[^a-z0-9]/g, "");

// ISO times sort correctly as plain strings; no deadline sorts after any date.
const closesKey = (hackathon: Hackathon) => hackathon.closesAt ?? "9999";

/**
 * Drops listings that already closed and repeats of the same hackathon (the
 * first source in FEEDS wins), then sorts by closing time, unknown last.
 */
export function mergeListings(lists: Hackathon[][], now = Date.now()): Hackathon[] {
  const seen = new Set<string>();
  return lists
    .flat()
    .filter((hackathon) => {
      const key = titleKey(hackathon.title);
      if (seen.has(key)) return false;
      seen.add(key);
      return !hackathon.closesAt || Date.parse(hackathon.closesAt) > now;
    })
    .sort((a, b) => (closesKey(a) < closesKey(b) ? -1 : closesKey(a) > closesKey(b) ? 1 : 0));
}

async function load(feed: (typeof FEEDS)[number]): Promise<Hackathon[]> {
  const response = await fetch(feed.url, { ...feed.init, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`${feed.source} answered ${response.status}`);
  return feed.parse(await response.json());
}

/** Every source at once. Null only when none of them could be reached. */
export async function getListings(): Promise<Listings | null> {
  const results = await Promise.allSettled(FEEDS.map(load));
  const loaded: Hackathon[][] = [];
  const sources: Source[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      loaded.push(result.value);
      sources.push(FEEDS[index].source);
    } else {
      console.error(`[opportunities] ${FEEDS[index].source} failed:`, result.reason);
    }
  });

  return sources.length > 0 ? { hackathons: mergeListings(loaded), sources } : null;
}
