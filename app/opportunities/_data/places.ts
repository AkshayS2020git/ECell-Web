/**
 * Rough globe positions for sources that give a state or country but no
 * coordinates (Devfolio, Unstop).
 *
 * shortcut: an Indian event is placed at its state's main city and anything
 * abroad at its country; a place not listed here stays off the globe. Swap in
 * a geocoder if the globe ever needs city-level accuracy.
 */
export interface Point {
  lat: number;
  lng: number;
}

// Each state's main city, since that's where most of its hackathons are.
const INDIAN_STATES: Record<string, Point> = {
  "andhra pradesh": { lat: 16.51, lng: 80.65 },
  assam: { lat: 26.14, lng: 91.74 },
  bihar: { lat: 25.59, lng: 85.14 },
  chandigarh: { lat: 30.73, lng: 76.78 },
  "chandigarh state": { lat: 30.73, lng: 76.78 },
  chhattisgarh: { lat: 21.25, lng: 81.63 },
  delhi: { lat: 28.61, lng: 77.21 },
  "new delhi": { lat: 28.61, lng: 77.21 },
  goa: { lat: 15.49, lng: 73.83 },
  gujarat: { lat: 23.02, lng: 72.57 },
  haryana: { lat: 28.46, lng: 77.03 },
  "himachal pradesh": { lat: 31.1, lng: 77.17 },
  "jammu and kashmir": { lat: 34.08, lng: 74.8 },
  jharkhand: { lat: 23.34, lng: 85.31 },
  karnataka: { lat: 12.97, lng: 77.59 },
  kerala: { lat: 10.0, lng: 76.27 },
  "madhya pradesh": { lat: 23.26, lng: 77.41 },
  maharashtra: { lat: 19.08, lng: 72.88 },
  odisha: { lat: 20.3, lng: 85.82 },
  puducherry: { lat: 11.94, lng: 79.81 },
  punjab: { lat: 30.9, lng: 75.86 },
  rajasthan: { lat: 26.91, lng: 75.79 },
  "tamil nadu": { lat: 13.08, lng: 80.27 },
  telangana: { lat: 17.39, lng: 78.49 },
  "uttar pradesh": { lat: 28.54, lng: 77.39 },
  uttarakhand: { lat: 30.32, lng: 78.03 },
  "west bengal": { lat: 22.57, lng: 88.36 },
};

const COUNTRIES: Record<string, Point> = {
  india: { lat: 21.0, lng: 78.0 },
  "united states": { lat: 39.8, lng: -98.6 },
  canada: { lat: 56.1, lng: -106.3 },
  "united kingdom": { lat: 52.4, lng: -1.5 },
  ireland: { lat: 53.4, lng: -8.2 },
  germany: { lat: 51.2, lng: 10.4 },
  france: { lat: 46.6, lng: 2.2 },
  netherlands: { lat: 52.1, lng: 5.3 },
  switzerland: { lat: 46.8, lng: 8.2 },
  spain: { lat: 40.4, lng: -3.7 },
  italy: { lat: 41.9, lng: 12.6 },
  portugal: { lat: 39.4, lng: -8.2 },
  poland: { lat: 51.9, lng: 19.1 },
  sweden: { lat: 60.1, lng: 18.6 },
  "united arab emirates": { lat: 24.5, lng: 54.4 },
  singapore: { lat: 1.35, lng: 103.82 },
  malaysia: { lat: 4.2, lng: 101.98 },
  indonesia: { lat: -2.5, lng: 118.0 },
  thailand: { lat: 15.9, lng: 100.99 },
  vietnam: { lat: 14.06, lng: 108.28 },
  philippines: { lat: 12.88, lng: 121.77 },
  japan: { lat: 36.2, lng: 138.25 },
  "south korea": { lat: 35.91, lng: 127.77 },
  "hong kong": { lat: 22.32, lng: 114.17 },
  australia: { lat: -25.27, lng: 133.78 },
  bangladesh: { lat: 23.68, lng: 90.36 },
  pakistan: { lat: 30.38, lng: 69.35 },
  nepal: { lat: 28.39, lng: 84.12 },
  "sri lanka": { lat: 7.87, lng: 80.77 },
  nigeria: { lat: 9.08, lng: 8.68 },
  kenya: { lat: -0.02, lng: 37.91 },
  "south africa": { lat: -30.56, lng: 22.94 },
  egypt: { lat: 26.82, lng: 30.8 },
  brazil: { lat: -14.24, lng: -51.93 },
  mexico: { lat: 23.63, lng: -102.55 },
};

/** A small, stable offset per event so several in one city don't sit on one dot. */
function jitter(point: Point, seed: string): Point {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.4 + ((hash >>> 8) % 50) / 100;
  return { lat: point.lat + Math.sin(angle) * radius, lng: point.lng + Math.cos(angle) * radius };
}

export function placeOf(state: string, country: string | undefined, seed: string): Point | undefined {
  const countryKey = country?.toLowerCase();
  const base =
    (countryKey === "india" || !countryKey ? INDIAN_STATES[state.toLowerCase()] : undefined) ??
    (countryKey ? COUNTRIES[countryKey] : undefined);
  return base && jitter(base, seed);
}
