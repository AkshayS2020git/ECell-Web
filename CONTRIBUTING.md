# Contributing to ECell Website

First of all, thank you for contributing ❤️

Please read this guide before creating a pull request.

---

# Project Structure

```
src/
├── assets/
├── components/
│   ├── Hero/
│   ├── Story/
│   ├── Events/
│   ├── Team/
│   └── ...
├── utils/
├── hooks/
├── styles/
└── App.jsx
```

Each section should live inside its own folder.

Example:

```
Hero/
├── Hero.jsx
├── Hero.css
├── HeroAnimations.js
```

---

# Development Setup

Clone the repository

```bash
git clone <repo-url>
cd website
```

Install dependencies

```bash
npm install
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

- Use functional components.
- Export default components.

Example

```jsx
export default function Hero() {
    return (...);
}
```

---

## Folder Naming

Use PascalCase.

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
Hero.jsx
Hero.css
HeroAnimations.js
```

---

## CSS

- Do not use global styles.
- Scope styles to your section.
- Use existing CSS variables.
- Do not modify another section's CSS.

---

## Animations

- Keep animations inside your section.
- GSAP code belongs in a separate file when possible.
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

Before opening a PR ensure

- Project builds successfully
- No console errors
- Responsive on mobile
- No unused files
- No unnecessary comments
- Code is formatted

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

Your component should render correctly if placed anywhere inside `App.jsx`.

Avoid:

- Negative margins
- Positioning based on another section
- Editing another team's component

# Questions

If you're unsure about a design or implementation, ask before making major changes.

Let's build something awesome 🚀
