import type { StaticImageData } from "next/image";

export interface LedgerItem {
  number: string;
  label: string;
  value: string;
}

export interface ContactItem {
  name: string;
  phone: string;
  role?: string;
}

export interface WinnerItem {
  place: string;
  badge?: string;
  prize?: string;
  teamName: string;
  projectTitle: string;
  description?: string;
  photoCaption?: string;
  photo?: StaticImageData;
}

export interface GallerySpace {
  id: string;
  title: string;
  category: string;
}

export interface EventRoundItem {
  number: string;
  badge: string;
  title: string;
  type: string;
  description: string;
}

export interface EventDetailData {
  slug: string;
  title: string;
  isCompleted?: boolean;
  heroHeadline: string;
  heroAccent: string;
  heroBody: string;
  eyebrow: string;
  aboutEyebrow: string;
  aboutHeadline: string;
  aboutHeadlineAccent: string;
  aboutDescription: string;
  aboutNote?: string;
  format: string;
  dateBadge: string;
  date: string;
  venue: string;
  prizePool?: string;
  registrationUrl: string;
  registrationCtaText: string;
  registrationHeadline: string;
  registrationAccent: string;
  registrationHint: string;
  image: StaticImageData;
  /** The image is a designed poster: show it whole at its own proportions
   *  instead of cropping it to the photo frame. */
  imageIsPoster?: boolean;
  ledger: LedgerItem[];
  organizers: string[];
  contacts: ContactItem[];
  metaTitle: string;
  metaDescription: string;
  winnersHeadline?: string;
  winnersAccent?: string;
  winnersSubhead?: string;
  winners?: WinnerItem[];
  /** Small pills under each winner, e.g. the edition and format. */
  winnersBadges?: string[];
  /** Line above the gallery headline. Defaults to "Captured Moments". */
  galleryEyebrow?: string;
  galleryHeadline?: string;
  galleryAccent?: string;
  gallerySubhead?: string;
  gallerySpaces?: GallerySpace[];
  galleryDriveUrl?: string;
  roundsHeadline?: string;
  roundsAccent?: string;
  roundsSubhead?: string;
  rounds?: EventRoundItem[];
  expectedOutcomes?: string[];
  logisticsNotice?: string;
  sponsorsHeadline?: string;
  sponsorsAccent?: string;
  sponsorsSubhead?: string;
  sponsorsPoweredBy?: { name: string; tag?: string; logo?: string }[];
  sponsorsPresenting?: { name: string; tag?: string; logo?: string };
  sponsorsList?: { name: string; tag?: string; url?: string; logo?: string }[];
}

export type EventCategory = "Hackathons" | "Talks" | "Competitions";

/** One entry in the events list. Drives the /events archive and the homepage
 *  cards; entries with `detail` also get a page at /events/<slug>. */
export interface EventSummary {
  slug: string;
  title: string;
  category: EventCategory;
  status: "upcoming" | "past";
  /** ISO date (YYYY-MM-DD). Leave out while the date is TBA. */
  startDate?: string;
  /** ISO date of the last day, for events that run over several days. */
  endDate?: string;
  /** One or two sentences for event cards. */
  summary: string;
  /** Photo used on cards and in previews. */
  image: StaticImageData;
  /** Designed poster, shown whole (never cropped) where cards support it. */
  poster?: StaticImageData;
  /** Other slugs that should resolve to this event, e.g. common misspellings. */
  aliases?: string[];
  detail?: EventDetailData;
}
