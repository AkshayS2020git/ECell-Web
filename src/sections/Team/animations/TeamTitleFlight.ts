import { clamp, easeInOutCubic, lerp } from "@/src/utils/math";

/**
 * Story -> Team handoff, part 3: the Story headline's on-screen letters lift
 * off and fly into "Meet the team.". Matching letters keep their shape; the
 * rest morph mid-air into the title letter they land as. Leftovers fall.
 *
 * Clones live in a fixed layer and track the real Story letters (hidden while
 * the clones are up) until they lift off, so take-off is seamless. Each clone has
 * two glyphs: one styled like the Story letter, one like the title letter,
 * crossfaded mid-flight, then swapped for the real title character on landing.
 */

// In flight progress (0..1 over Team's rise plus its hold at the top, see
// TeamAnimations): first take-off, flight length of one letter, spread of
// take-offs across the title, and when the leftovers are gone.
const START = 0.06;
const SPAN = 0.5;
const STAGGER = 0.28;
const FALL = 0.45;

// Progress at which the last letter has landed.
export const TITLE_LANDED = START + STAGGER + SPAN;

/**
 * For each target letter, the index of the source letter it flies from, or -1.
 * Same letters (case-insensitive) pair first, then the rest pair in order.
 */
export function pairLetters(targets: string[], sources: string[]): number[] {
  const used = new Set<number>();
  const take = (match: (s: string) => boolean) => {
    const i = sources.findIndex((s, j) => !used.has(j) && match(s));
    if (i >= 0) used.add(i);
    return i;
  };
  const pairs = targets.map((t) => take((s) => s.toUpperCase() === t.toUpperCase()));
  return pairs.map((i) => (i >= 0 ? i : take(() => true)));
}

interface Flight {
  target: HTMLElement;
  // Offset of the target inside the title, measured at take-off.
  ox: number;
  oy: number;
  // Story letter it lifts off from; read live, Story is still scrolling.
  source: HTMLElement | null;
  fromScale: number;
  story: HTMLElement | null;
  title: HTMLElement;
  delay: number;
  arc: number;
  spin: number;
}

interface Faller {
  el: HTMLElement;
  source: HTMLElement;
  drift: number;
  spin: number;
}

export interface TitleFlight {
  start(): void;
  render(progress: number): void;
  stop(): void;
}

export function createTitleFlight(team: HTMLElement): TitleFlight {
  let layer: HTMLDivElement | null = null;
  let storyText: HTMLElement | null = null;
  let flights: Flight[] = [];
  let fallers: Faller[] = [];
  let ratio = 1;

  const title = team.querySelector<HTMLElement>(".team__section-title");
  const targets = Array.from(team.querySelectorAll<HTMLElement>(".team__title-char")).filter((c) =>
    c.textContent?.trim()
  );

  const glyph = (char: string, style: CSSStyleDeclaration, fontSize: number, lineHeight: string) => {
    const el = document.createElement("span");
    el.className = "team__flying-letter";
    el.textContent = char;
    el.style.fontFamily = style.fontFamily;
    el.style.fontWeight = style.fontWeight;
    el.style.fontStretch = style.fontStretch;
    el.style.color = style.color;
    el.style.fontSize = `${fontSize}px`;
    el.style.lineHeight = lineHeight;
    layer!.appendChild(el);
    return el;
  };

  return {
    start() {
      if (!title || layer || targets.length === 0) return;

      storyText = document.querySelector<HTMLElement>(".story-reveal-text");
      const vw = window.innerWidth;
      const showing = storyText && parseFloat(getComputedStyle(storyText).opacity) > 0.5;
      const pool = showing
        ? // Headline only: the "ECELL" eyebrow above it has faded out by now.
          Array.from(storyText!.querySelectorAll<HTMLElement>(".story-reveal-text-inner .jiggle-char"))
            .map((el) => ({ el, r: el.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && r.right > 0 && r.left < vw)
        : [];

      layer = document.createElement("div");
      layer.className = "team__letters";
      layer.setAttribute("aria-hidden", "true");
      // On <body>: pinning makes .team the containing block for fixed children,
      // which would clip the letters to the section while Story is still on screen.
      document.body.appendChild(layer);

      const titleRect = title.getBoundingClientRect();
      const titleSize = parseFloat(getComputedStyle(title).fontSize);
      const storyStyle = pool[0] ? getComputedStyle(pool[0].el) : null;
      const storySize = storyStyle ? parseFloat(storyStyle.fontSize) : titleSize;
      ratio = titleSize / storySize;

      const pairs = pairLetters(
        targets.map((t) => t.textContent ?? ""),
        pool.map((s) => s.el.textContent ?? "")
      );

      flights = targets.map((target, i) => {
        const r = target.getBoundingClientRect();
        const src = pool[pairs[i]];
        // Both glyphs render at the Story size and are scaled down in flight,
        // so the title glyph is exactly title-sized on landing.
        const titleGlyph = glyph(target.textContent ?? "", getComputedStyle(target), storySize, "normal");
        const storyGlyph =
          src && storyStyle ? glyph(src.el.textContent ?? "", storyStyle, storySize, storyStyle.lineHeight) : null;
        target.style.opacity = "0";
        return {
          target,
          ox: r.left - titleRect.left,
          oy: r.top - titleRect.top,
          source: src?.el ?? null,
          // Without a source letter it rises from below, already title-sized.
          fromScale: src ? 1 : ratio,
          story: storyGlyph,
          title: titleGlyph,
          delay: (i / Math.max(targets.length - 1, 1)) * STAGGER,
          arc: 80 + Math.random() * 160,
          spin: (Math.random() - 0.5) * 50,
        };
      });

      const usedSources = new Set(pairs);
      fallers = storyStyle
        ? pool
            .filter((_, i) => !usedSources.has(i))
            .map(({ el }) => ({
              el: glyph(el.textContent ?? "", storyStyle, storySize, storyStyle.lineHeight),
              source: el,
              drift: (Math.random() - 0.5) * 200,
              spin: (Math.random() - 0.5) * 120,
            }))
        : [];

      // The clones take over from here.
      if (storyText) storyText.style.visibility = "hidden";
    },

    render(progress) {
      if (!layer || !title) return;
      const tr = title.getBoundingClientRect();
      const vh = window.innerHeight;

      for (const f of flights) {
        const t = clamp((progress - START - f.delay) / SPAN);
        const e = easeInOutCubic(t);
        const tx = tr.left + f.ox;
        const ty = tr.top + f.oy;
        const from = f.source?.getBoundingClientRect();
        const x = lerp(from ? from.left : tx, tx, e);
        const y = lerp(from ? from.top : vh + 80, ty, e) - Math.sin(Math.PI * e) * f.arc;
        const transform = `translate(${x}px, ${y}px) rotate(${Math.sin(Math.PI * e) * f.spin}deg) scale(${lerp(f.fromScale, ratio, e)})`;
        const morph = clamp((t - 0.35) / 0.4);
        const land = clamp((t - 0.92) / 0.08);

        if (f.story) {
          f.story.style.transform = transform;
          f.story.style.opacity = String(1 - morph);
        }
        f.title.style.transform = transform;
        f.title.style.opacity = String((f.story ? morph : clamp(t / 0.3)) * (1 - land));
        f.target.style.opacity = String(land);
      }

      const q = clamp(progress / FALL);
      for (const f of fallers) {
        const r = f.source.getBoundingClientRect();
        f.el.style.transform = `translate(${r.left + f.drift * q}px, ${r.top + vh * 1.2 * q * q}px) rotate(${f.spin * q}deg)`;
        f.el.style.opacity = String(1 - q);
      }
    },

    stop() {
      if (!layer) return;
      for (const f of flights) f.target.style.opacity = "";
      if (storyText) storyText.style.visibility = "";
      layer.remove();
      layer = null;
      storyText = null;
      flights = [];
      fallers = [];
    },
  };
}
