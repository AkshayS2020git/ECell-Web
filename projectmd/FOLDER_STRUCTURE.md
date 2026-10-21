# Folder Structure

## Repository map

```text
ECell-Web/
├── .github/
│   ├── pull_request_template.md    # Questions and checklist every new PR starts with
│   └── workflows/
│       ├── ci.yml                  # Typecheck, lint, tests, and production build
│       ├── pr-cd.yml               # Pull-request preview deployments (Vercel)
│       └── vercel-cd.yml           # Production deployment on main (Vercel)
├── app/                            # Next.js App Router: routes and route metadata only
│   ├── events/
│   │   ├── [slug]/
│   │   │   ├── _components/        # One component + stylesheet per page section (hero, rounds, winners, ...)
│   │   │   ├── EventDetail.css     # Only @imports: shared styles, then each section's CSS in page order
│   │   │   ├── EventDetailShared.css  # Page shell, buttons, eyebrows, accents
│   │   │   ├── EventDetailClient.tsx  # Top bar, anchor scrolling, section order
│   │   │   └── page.tsx
│   │   └── page.tsx                # Events archive route
│   ├── opportunities/              # Points students to hackathons.fun, with credit
│   │   ├── _components/            # Globe (three.js) + generated land mask
│   │   └── page.tsx
│   ├── globals.css                 # Tailwind and global style imports
│   ├── layout.tsx                  # Root shell, metadata, fonts, telemetry
│   ├── manifest.ts                 # Web app manifest
│   ├── page.tsx                    # Homepage section composition
│   ├── robots.ts                   # robots.txt generator
│   └── sitemap.ts                  # sitemap.xml generator
├── public/                         # Files served from stable public URLs
│   ├── _headers                    # Cloudflare edge cache headers
│   ├── favicon* / apple-touch-icon # Browser icons
│   ├── logo-* / logo.webp          # Install/brand images
│   └── og-image.webp               # Social sharing image
├── scripts/
│   └── deploy-cloudflare.mjs       # Cloudflare deploy wrapper (see Deployment)
├── src/                            # All application source outside routing
│   ├── assets/                     # Bundled, imported media, one folder per feature
│   │   ├── events/<slug>/          # poster, photo, winners/ for each event
│   │   ├── home/                   # Homepage section backgrounds
│   │   ├── joinus/  speakers/  sponsors/  team/
│   ├── components/                 # Shared components, one folder each
│   │   ├── HalftoneWordmarkFooter/ # Homepage footer
│   │   ├── CircularTestimonials/   # Carousel used by Speakers
│   │   ├── EventsArchive/          # /events listing (filters, calendar, archive rows)
│   │   ├── FloatingLogo/           # Scroll-driven logo that docks into the nav
│   │   ├── GameLauncher/           # Launcher and four minigames
│   │   ├── HorizontalFlow/         # Pinned vertical-to-horizontal flow
│   │   ├── InfiniteSpiral/         # 3D image spiral, kept for the upcoming event galleries
│   │   ├── LaserFlow/              # Three.js shader used by WhatsApp Community
│   │   ├── LogoModal/              # Logo story dialog
│   │   ├── PageTransition/         # Route transition overlay
│   │   ├── RouteScrollManager/     # Scroll reset on pathname change (root layout)
│   │   ├── SiteCredit/             # "Built by" credit used on route pages
│   │   ├── SmoothScroll/           # Shared Lenis lifecycle (root layout)
│   │   └── Timeline/               # Horizontal journey in the About section
│   ├── content/                    # Editable site content (see Content Guide)
│   │   ├── events/
│   │   │   ├── index.ts            # EVENTS list, lookup, aliases, date labels
│   │   │   ├── types.ts
│   │   │   └── <event>.ts          # Page content for events that have a page
│   │   ├── community.ts  site.ts  speakers.ts
│   │   └── sponsors.ts  team.ts  timeline.ts  whyJoin.ts
│   ├── data/recruitment.ts         # Live recruitment content, left in place until the drive ends
│   ├── sections/                   # Independent homepage feature domains
│   │   ├── About/
│   │   ├── Events/
│   │   ├── Hero/                   # Hero.tsx + HeroAnimations.ts (scroll shrink)
│   │   │   ├── components/         # HeroReveal (WebGL), HeroIntro, HeroScrollHint, HeroSocials
│   │   │   ├── webgl/              # Shaders, title layout, glass letters, nebula
│   │   │   └── styles/             # Hero section CSS
│   │   ├── Loader/
│   │   ├── Nav/                    # Nav, NavBar, SubNav, LogoHint, ChaptersDropdown, navUtils
│   │   │   └── hooks/              # useChaptersMenu, useHomeScroll, useSectionNavigation
│   │   ├── Speakers/               # Speakers.tsx + styles/
│   │   ├── Sponsors/
│   │   ├── Story/
│   │   ├── Team/                   # animations/, components/, styles/, index.ts
│   │   ├── WhatsAppCommunity/
│   │   └── WhyJoin/
│   ├── styles/                     # Global tokens and shared transitions
│   ├── types/                      # Ambient asset declarations
│   └── utils/                      # Shared helpers: scroll, input, math, `cn`, site constants
├── tests/
│   ├── app/                        # Route and metadata tests
│   ├── src/                        # Component, section, and utility tests (mirrors src/)
│   └── setup.ts                    # JSDOM setup and browser/Next mocks
├── projectmd/                      # Project documentation (this directory)
├── .nvmrc                          # Node 24 selection
├── CONTRIBUTING.md                 # Team contribution policy
├── README.md                       # Public repository overview
├── eslint.config.mjs               # ESLint flat configuration
├── next.config.ts                  # Next image and redirect configuration
├── open-next.config.ts             # OpenNext adapter config for Cloudflare
├── package.json                    # Scripts, dependencies, Node engine
├── postcss.config.mjs              # Tailwind PostCSS plugin
├── tsconfig.json                   # Strict TypeScript configuration
├── vercel.json                     # Vercel framework/output settings
├── vitest.config.mts               # Vitest, JSDOM, aliases, and test inclusion
└── wrangler.jsonc                  # Cloudflare Worker configuration
```

Generated/local directories such as `.next/`, `.open-next/`, `.wrangler/`, `dist/`, `node_modules/`, and `.vercel/` are not application source and should not be edited as feature code.

## Top-level boundaries

| Folder | Holds | Does not hold |
| --- | --- | --- |
| `app/` | Routes, layouts, metadata files, and route-only code in `_components/`, `_data/`, `_hooks/` | Code reused by other routes |
| `src/sections/` | One folder per homepage section, owning its markup, styles, hooks, and animation | Content, or code another section imports |
| `src/components/` | Components used by more than one route or section, or mounted globally | Section-only UI |
| `src/content/` | Every piece of editable content: text, lists, links, and the images they reference | JSX or behaviour |
| `src/utils/` | Framework-agnostic helpers and shared runtime singletons | React components |
| `tests/` | Tests, mirroring the path of the code under test | Test helpers inside `src/` |

There is no top-level `lib/`: shared helpers live in `src/utils/`, so everything that is not routing is under `src/`.

## Placement rules

### New route

Create a route directory under `app/`. Keep its server `page.tsx` responsible for route data, metadata, and not-found behavior. Place interactive browser UI in a nearby client component when it is route-specific (in `_components/` or `_hooks/`, as `app/events/[slug]/` does), or in `src/components/` when reusable.

### New homepage section

Use a PascalCase directory under `src/sections/`. Start flat and add subfolders as the section grows:

```text
src/sections/NewSection/
├── NewSection.tsx      # Or components/NewSection.tsx once there are several components
├── NewSection.css      # Or styles/ once there are several stylesheets
├── components/         # Optional section-only UI
├── hooks/              # Optional behavior (see Nav/hooks)
├── animations/         # Optional complex timelines
└── index.ts            # Optional barrel when the entry component lives in a subfolder
```

When the entry component moves into `components/`, add an `index.ts` that re-exports it (as `Team/` does) so `app/page.tsx` can keep importing `@/src/sections/NewSection`. Do not leave one-line re-export files next to the real ones.

### New shared component

Place it in its own PascalCase folder, `src/components/<ComponentName>/<ComponentName>.tsx`, even when it is a single file, and keep its CSS and internal helpers inside that folder. Loose files directly under `src/components/` are not used.

### New content

Put text, lists, links and the images they use in `src/content/`, one file per topic, as typed exports. Components import it; they never keep their own copy. A list shown in two places (like events) is defined once and the second place derives from it. Links to ECell's own channels come from `SITE_LINKS` in `src/content/site.ts`.

### New helper

Put shared, non-React helpers in `src/utils/<name>.ts`, one concern per file (for example `cn.ts`, `math.ts`, `scrollLock.ts`). Keep helpers used by a single section inside that section.

### New styles

Use shared CSS only for tokens, reset behavior, or genuinely reusable primitives. Feature styles should be colocated and selectors should be prefixed because the project does not use CSS Modules for these files.

### New assets

- Use `src/assets/<feature>/` when importing media from TypeScript/TSX so Next/build tooling owns it. Event media goes in `src/assets/events/<slug>/`.
- Name files in lowercase kebab-case without spaces (`red-bull.webp`, not `Red Bull LOGO .webp`).
- Host large photo galleries outside the repository and reference them by URL.
- Use `public/` when a file needs a stable URL, such as favicons, verification files, social images, or `<video>` sources.
- Do not duplicate the same large media file across both locations.

### New tests

Mirror the implementation path under `tests/app/` or `tests/src/` (for example `src/sections/Nav/` → `tests/src/sections/Nav.test.tsx`) and use the `.test.ts` or `.test.tsx` suffix configured by Vitest.

## Import conventions

The only path alias is `@/*`, which resolves from the repository root in both TypeScript and Vitest. Import across folders with it, and use relative `./` imports only within the same folder. ESLint rejects parent-relative `../` imports:

```ts
import Nav from "@/src/sections/Nav/Nav";
import Team from "@/src/sections/Team";
import EventsArchive from "@/src/components/EventsArchive/EventsArchive";
import { getEventBySlug } from "@/src/content/events";
import { cn } from "@/src/utils/cn";
```

Prefer clear feature boundaries over deep imports into another feature's private implementation.
