import { gsap, SplitText } from "@/src/utils/gsapSetup";

// Pointer-driven effects for the team section: the spotlight card tilts toward
// the cursor with its photo drifting the other way, a soft accent glow follows
// the pointer, the slider buttons pull toward it, and directory cards light up
// where the cursor sits. Only mice/trackpads get these, and never with
// reduced motion, so touch devices keep the plain swipe slider.

const MAX_TILT = 6;
const PHOTO_DRIFT = 14;
const MAGNET_STRENGTH = 0.35;

function canHover(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type Tilt = {
  rx: gsap.QuickToFunc;
  ry: gsap.QuickToFunc;
  px: gsap.QuickToFunc;
  py: gsap.QuickToFunc;
};

export interface SetupTeamInteractionsOptions {
  stage: HTMLElement | null;
  getActiveCard: () => HTMLElement | null;
  magnets?: (HTMLElement | null)[];
  directory?: HTMLElement | null;
}

export function setupTeamInteractions({
  stage,
  getActiveCard,
  magnets = [],
  directory = null,
}: SetupTeamInteractionsOptions): (() => void) | undefined {
  if (!stage || !canHover()) return;

  const cleanups: (() => void)[] = [];

  // ── Spotlight card tilt + photo parallax ──
  // quickTo setters are built per card on first use, since any card can
  // become the active one.
  const tilts = new WeakMap<HTMLElement, Tilt>();
  const tiltFor = (card: HTMLElement): Tilt => {
    let tilt = tilts.get(card);
    if (!tilt) {
      const photo = card.querySelector<HTMLElement>(".team__image img");
      const opts = { duration: 0.6, ease: "power3.out" };
      const noop = (() => 0) as unknown as gsap.QuickToFunc;
      if (photo) gsap.set(photo, { scale: 1.08 });
      tilt = {
        rx: gsap.quickTo(card, "rotationX", opts),
        ry: gsap.quickTo(card, "rotationY", opts),
        px: photo ? gsap.quickTo(photo, "x", opts) : noop,
        py: photo ? gsap.quickTo(photo, "y", opts) : noop,
      };
      gsap.set(card, { transformPerspective: 1400 });
      tilts.set(card, tilt);
    }
    return tilt;
  };

  let lastCard: HTMLElement | null = null;
  const settle = (card: HTMLElement | null) => {
    if (!card) return;
    const tilt = tiltFor(card);
    tilt.rx(0);
    tilt.ry(0);
    tilt.px(0);
    tilt.py(0);
    card.classList.remove("is-hovered");
  };

  const onStageMove = (e: PointerEvent) => {
    const card = getActiveCard();
    if (!card) return;
    if (lastCard && lastCard !== card) settle(lastCard);
    lastCard = card;

    const rect = card.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const inside = Math.abs(nx) <= 0.5 && Math.abs(ny) <= 0.5;

    if (!inside) {
      settle(card);
      return;
    }

    const tilt = tiltFor(card);
    tilt.ry(nx * MAX_TILT * 2);
    tilt.rx(-ny * MAX_TILT * 2);
    tilt.px(-nx * PHOTO_DRIFT * 2);
    tilt.py(-ny * PHOTO_DRIFT * 2);
    card.style.setProperty("--glow-x", `${(nx + 0.5) * 100}%`);
    card.style.setProperty("--glow-y", `${(ny + 0.5) * 100}%`);
    card.classList.add("is-hovered");
  };
  const onStageLeave = () => settle(lastCard ?? getActiveCard());

  stage.addEventListener("pointermove", onStageMove);
  stage.addEventListener("pointerleave", onStageLeave);
  cleanups.push(() => {
    stage.removeEventListener("pointermove", onStageMove);
    stage.removeEventListener("pointerleave", onStageLeave);
  });

  // ── Magnetic slider buttons ──
  magnets.forEach((btn) => {
    if (!btn) return;
    const opts = { duration: 0.45, ease: "power3.out" };
    const xTo = gsap.quickTo(btn, "x", opts);
    const yTo = gsap.quickTo(btn, "y", opts);
    const onMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      xTo((e.clientX - rect.left - rect.width / 2) * MAGNET_STRENGTH);
      yTo((e.clientY - rect.top - rect.height / 2) * MAGNET_STRENGTH);
    };
    const onLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    };
    btn.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      btn.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(btn);
      gsap.set(btn, { clearProps: "x,y" });
    });
  });

  // ── Directory cards: cursor glow + photo drift (CSS reads the vars) ──
  if (directory) {
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>(".team-directory__card");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      card.style.setProperty("--glow-x", `${nx * 100}%`);
      card.style.setProperty("--glow-y", `${ny * 100}%`);
      card.style.setProperty("--drift-x", `${(0.5 - nx) * 10}px`);
      card.style.setProperty("--drift-y", `${(0.5 - ny) * 8}px`);
    };
    directory.addEventListener("pointermove", onMove);
    cleanups.push(() => directory.removeEventListener("pointermove", onMove));
  }

  return () => {
    cleanups.forEach((fn) => fn());
    settle(lastCard);
  };
}

// Splits still mid-reveal, so a quick re-select never splits a split title.
const activeSplits = new WeakMap<HTMLElement, SplitText>();

/**
 * Staggered reveal of a card's text as it becomes active: role and
 * description rise in, the name rolls up letter by letter from a mask.
 * Runs alongside the card swap rather than inside its timeline, so the
 * slider unlocks at the same moment it always has.
 */
export function revealCardText(card: HTMLElement | null): void {
  if (!card || typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const role = card.querySelector(".team__role");
  const title = card.querySelector<HTMLElement>(".team__title");
  const description = card.querySelector(".team__description");

  let split: SplitText | null = null;
  if (title && SplitText) {
    activeSplits.get(title)?.revert();
    split = SplitText.create(title, { type: "chars", mask: "chars" });
    activeSplits.set(title, split);
  }

  const tl = gsap.timeline({
    delay: 0.22,
    onComplete: () => {
      if (title && split && activeSplits.get(title) === split) {
        split.revert();
        activeSplits.delete(title);
      }
    },
  });

  if (role) {
    tl.fromTo(role, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0);
  }

  if (split) {
    tl.fromTo(
      split.chars,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.022 },
      0.06
    );
  }

  if (description) {
    tl.fromTo(description, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.2);
  }
}
