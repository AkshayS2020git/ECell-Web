# Content Guide

## Content model

The website does not use a CMS or database. Text, links, dates, people, and media are committed with the source code and become public through a deployment. Every content edit should therefore receive the same review and validation as a code change.

## Content locations

Editable content lives in `src/content/`, separate from the components that display it. Components import from there and hold no copy of their own.

| Content | Source |
| --- | --- |
| Event list (archive page, homepage cards, slugs, aliases) | `src/content/events/index.ts` |
| Event page content | `src/content/events/<event>.ts` |
| Event data types | `src/content/events/types.ts` |
| About section timeline | `src/content/timeline.ts` |
| Team members | `src/content/team.ts` |
| Previous speakers | `src/content/speakers.ts` |
| Sponsors and logos | `src/content/sponsors.ts` |
| Why Join cards | `src/content/whyJoin.ts` |
| WhatsApp community chat answers | `src/content/community.ts` |
| Recruitment page, teams, questions, FAQ | `src/data/recruitment.ts` (kept in place while recruitment is live; move it into `src/content/` afterwards) |
| WhatsApp invite, Instagram, LinkedIn, GitHub, email | `src/content/site.ts` |
| Root SEO and structured data | `app/layout.tsx` |
| Route SEO | Relevant route `page.tsx` and each event's `meta` |
| Public icons/social preview | `public/` |

## Updating an event

Every event appears once in `EVENTS` in `src/content/events/index.ts`. Its title, category, status, dates, summary and images there feed both the `/events` archive and the homepage "Our Legacy" cards, so they cannot drift apart.

1. Edit the event's entry in `EVENTS` for list-level facts. Dates are ISO strings (`startDate`, optional `endDate`); leave them out while the date is TBA.
2. If the event has a page, edit its file in `src/content/events/` for the page content (hero, about, ledger, rounds, winners, sponsors, contacts, meta).
3. When an upcoming event finishes, set `status: "past"` in `EVENTS` and `isCompleted: true` on its page data, then add `winners` and `gallery`.
4. Add redirects in `next.config.ts` only if a legacy public URL must be preserved. Misspelt or short slugs go in the entry's `aliases`.

The About section timeline (`src/content/timeline.ts`) is a separate history of milestones; update it when an event becomes part of that story.

Check title, slug, date, timezone, venue, status, CTA label, destination URL, organizers, contacts, prize wording, image, metadata title/description, and structured data together.

For completed events, remove or relabel registration actions rather than leaving an active-looking registration CTA. For future events with unknown dates, consistently use a TBA state and avoid machine-readable dates that imply certainty.

## Adding an event

Add an entry to `EVENTS` in `src/content/events/index.ts`, in the position it should appear on `/events` (upcoming first). That alone lists it on the archive page and, once it is `past`, on the homepage.

To give it a page, create `src/content/events/<event>.ts` exporting an `EventDetailData` object and set it as the entry's `detail`. `getAllEventSlugs()` then exposes the slug to `generateStaticParams()`, the sitemap picks it up, and `/events/<slug>` renders it. Sections are optional: leave out `rounds`, `sponsors`, `winners` or `gallery` and that part of the page is not shown. Slugs are lowercase kebab-case; unknown slugs return not found.

## Images

Keep imported images in `src/assets/<feature>/`, one folder per event (`src/assets/events/<slug>/poster.webp`, `photo.webp`, `winners/`). Use lowercase kebab-case filenames without spaces. Put files that need a stable public URL under `public/`. Provide accurate alt text or captions, and do not add duplicate full-resolution files when an optimized copy is enough.

Event photo galleries should not be added as hundreds of static imports: the previous Argonyx gallery imported about 340 photos one by one and weighed 46 MB in the repository. Host gallery photos externally (for example Cloudflare R2) and keep only a list of image URLs in the event's `gallery` data.

## People and organizations

Confirm spelling, role/title, ordering, consent, and image attribution before publishing a person. For sponsors or partners, confirm the approved display name, logo, tier, and destination link. Avoid embedding private contact information unless it is explicitly intended for the public site.

## Links

External links should use HTTPS, have a clear destination, and be checked before release. Use meaningful CTA text instead of generic “click here.” When a link opens a third-party registration/community service, make that destination clear.

## SEO content

Keep page titles concise and unique. Write descriptions for humans, not keyword lists. Ensure Open Graph/Twitter content agrees with visible event facts. Root metadata applies a title template, so review the final rendered title when child metadata already includes the site name.

`app/sitemap.ts` lists the homepage, `/events`, `/recruit` and every event page, with their images. New events are picked up automatically; a new standalone route must be added to the sitemap by hand. Every page should set its own `alternates.canonical`, otherwise it inherits the homepage canonical from the root layout.

## Editorial checklist

- Facts match across homepage, archive, detail page, metadata, and structured data.
- Status and CTAs match whether the event is upcoming or completed.
- Dates, venue, prize, organizers, and links were independently verified.
- Public contact information is approved for publication.
- Images have appropriate quality, dimensions, and alternative text.
- Copy is readable on narrow layouts and does not break headings/buttons.
- The sitemap and redirects were considered.
- No credentials, private IDs, or internal notes were introduced.
