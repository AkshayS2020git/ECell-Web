# Contributing to ECell Website

First of all, thank you for contributing ❤️

Please read this guide before creating a pull request. For the full file map and placement rules, see [`projectmd/FOLDER_STRUCTURE.md`](./projectmd/FOLDER_STRUCTURE.md).

---

# Project Structure

```
app/                     # Next.js routes only (page.tsx, layout.tsx, metadata)
src/
├── assets/              # Imported images, grouped by feature
├── components/          # Shared components, one folder per component
│   ├── FloatingLogo/
│   ├── EventsArchive/
│   ├── ...
│   └── ui/              # Generic primitives
├── data/                # Data shared by several features (events)
├── sections/            # Homepage sections, one folder per section
│   ├── Hero/
│   ├── Nav/
│   ├── Team/
│   └── ...
├── styles/              # Global tokens and shared transitions
├── types/
└── utils/               # Shared helpers (gsapSetup, lenis, math, cn, ...)
tests/                   # Mirrors app/ and src/
```

The homepage is composed in `app/page.tsx`. There is no top-level `lib/`, and no loose files directly in `src/components/`.

Each section lives inside its own folder. A small section can stay flat:

```
Story/
├── Story.tsx
└── Story.css
```

A larger one splits into subfolders:

```
Hero/
├── Hero.tsx
├── HeroAnimations.ts
├── components/
├── styles/
└── webgl/
```

Other common subfolders are `data/`, `hooks/` and `animations/`. If the entry component moves into `components/`, add an `index.ts` that re-exports it (see `Team/`).

---

# Development Setup

Use Node.js 24 (`.nvmrc`).

Clone the repository

```bash
git clone https://github.com/ECell-RVUniversity/ECell-Web.git
cd ECell-Web
```

Install dependencies

```bash
nvm use
npm ci
```

Run development server

```bash
npm run dev
```

---

# Branch Naming

Never work directly on `main`.

Create a feature branch.

Examples

```
feature/hero
feature/story
feature/events
fix/navbar
fix/footer
refactor/utils
```

---

# Coding Guidelines

## Components

- Use TypeScript (`.tsx` / `.ts`) and type your props and data.
- Use functional components.
- Export default components.
- Add `"use client"` only when the component needs state, effects, event handlers, or browser APIs.

Example

```tsx
export default function Hero(): React.ReactElement {
  return (...);
}
```

---

## Folder Naming

Use PascalCase for component and section folders.

✅

```
Hero/
Story/
Team/
```

❌

```
hero/
storySection/
```

---

## File Naming

```
Hero.tsx            # Component
Hero.css            # Styles
HeroAnimations.ts   # GSAP timelines
useHeroThing.ts     # Hook (inside hooks/)
```

---

## Where Does My File Go?

- Only used by one section → inside that section's folder.
- Used by several sections or routes → `src/components/<Name>/<Name>.tsx`.
- A shared helper with no React → `src/utils/<name>.ts`.
- Data used in more than one place → `src/data/`.
- A test → the matching path under `tests/`.

Import across folders with the `@/` alias, for example `import { cn } from "@/src/utils/cn"`.

---

## CSS

- Section `.css` files are global, so prefix every selector with your section name (`.hero__...`, `.team-...`).
- Do not use bare element or generic selectors that can leak.
- Use existing CSS variables from `src/styles/global.css`.
- Do not modify another section's CSS.

---

## Animations

- Keep animations inside your section.
- Import GSAP from `src/utils/gsapSetup.ts`, and scroll with the helpers in `src/utils/lenis.ts`.
- GSAP code belongs in a separate file when possible.
- Clean up timelines, listeners, and animation frames on unmount, and respect reduced motion.
- Avoid affecting other sections.

---

## Responsiveness

Every section must work on

- Desktop
- Tablet
- Mobile

Test before creating a PR.

---

# Git Commits

Use meaningful commit messages.

Examples

```
feat: add hero animation
feat: create events section
fix: navbar spacing
refactor: split hero animations
docs: update contributing guide
```

Avoid

```
update
changes
final
done
```

---

# Pull Requests

Before opening a PR ensure all checks pass:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

And that there are

- No console errors
- No layout issues on mobile
- No unused files
- No unnecessary comments
- No unrelated formatting changes

---

# Rules

- Do not modify another person's section without discussing it.
- Keep components reusable.
- Do not hardcode values that should be configurable.
- Ask before adding new dependencies.
- Never commit secrets or API keys.

---

# Section Independence

Each section should work independently.

Do not assume what comes before or after your section.

Your section should render correctly wherever it is placed in `app/page.tsx`.

Avoid:

- Negative margins
- Positioning based on another section
- Editing another team's component

# Questions

If you're unsure about a design or implementation, ask before making major changes.

Let's build something awesome 🚀
