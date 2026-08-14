import { RefObject, CSSProperties } from "react";
import { gsap } from "@/src/utils/gsapSetup";

// Motion Constants - Slow, gentle, luxurious transitions
const ANIM_DURATION = 0.85;
const EASE = "power2.inOut";

let isAnimating = false;
let scrollTriggerInstance: globalThis.ScrollTrigger | null = null;
let transitionTimeline: gsap.core.Timeline | null = null;

export function getIsAnimating(): boolean {
  return isAnimating;
}

export function cleanupTeamAnimations(): void {
  transitionTimeline?.kill();
  transitionTimeline = null;
  isAnimating = false;

  scrollTriggerInstance?.kill();
  scrollTriggerInstance = null;
}

export interface SetupTeamScrollOptions {
  teamRef?: RefObject<HTMLElement | null>;
}

/**
 * Natural page reveal animation.
 */
export function setupTeamScroll({ teamRef }: SetupTeamScrollOptions = {}): (() => void) | undefined {
  if (!teamRef?.current) return;

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  const team = teamRef.current;
  const reduceMotion = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  const isMobile = typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false;
  if (reduceMotion) return;

  const header = team.querySelector(".team__header");
  const activeCard = team.querySelector('.team__card[data-active="true"]');
  const image = activeCard?.querySelector(".team__image");
  const content = activeCard?.querySelectorAll(
    ".team__role, .team__title, .team__description"
  );
  const wipe = team.querySelector(".team__transition-wipe");

  const entrance = gsap.timeline({
    scrollTrigger: {
      trigger: team,
      start: "top 88%",
      end: "top 38%",
      toggleActions: "play none none reverse",
    },
  });

  entrance
    .fromTo(
      wipe,
      { autoAlpha: 1, scaleX: 1, transformOrigin: "right center" },
      { autoAlpha: 0, scaleX: 0, duration: 0.72, ease: "power4.inOut" },
      0
    )
    .fromTo(
      header,
      { autoAlpha: 0, y: 28 },
      { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
      0.18
    )
    .fromTo(
      activeCard,
      { autoAlpha: 0, y: isMobile ? 48 : 84, scale: isMobile ? 0.95 : 0.9, rotate: isMobile ? 1 : 2.5 },
      { autoAlpha: 1, y: 0, scale: 1, rotate: 0, duration: 0.9, ease: "power4.out" },
      0.22
    );

  if (image) {
    entrance.fromTo(
      image,
      { clipPath: "inset(100% 0 0 0)", scale: isMobile ? 1.06 : 1.12 },
      { clipPath: "inset(0% 0 0 0)", scale: 1, duration: 0.7, ease: "power3.out" },
      0.46
    );
  }

  if (content && content.length > 0) {
    entrance.fromTo(
      content,
      { autoAlpha: 0, x: 28 },
      { autoAlpha: 1, x: 0, duration: 0.48, stagger: 0.08, ease: "power3.out" },
      0.56
    );
  }

  scrollTriggerInstance = entrance.scrollTrigger ?? null;

  return () => {
    entrance.kill();
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }
  };
}

/**
 * Clean card display style: Only active card is visible (opacity 1).
 * Inactive cards are fully hidden (opacity 0) to prevent any background clutter or bleed.
 */
export function getStackStyle(index: number, activeIndex: number): CSSProperties {
  const isActive = index === activeIndex;

  if (isActive) {
    return {
      opacity: 1,
      scale: 1,
      y: 0,
      zIndex: 20,
      boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      pointerEvents: "auto",
    };
  } else {
    return {
      opacity: 0,
      scale: 0.96,
      y: 0,
      zIndex: 1,
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
      pointerEvents: "none",
    };
  }
}

export interface SetupTeamAnimationsOptions {
  cardRefs?: (HTMLElement | null)[];
  activeIndex?: number;
}

/**
 * Initializes card stack presentation.
 */
export function setupTeamAnimations({
  cardRefs = [],
  activeIndex = 0,
}: SetupTeamAnimationsOptions = {}): void {
  if (!cardRefs || cardRefs.length === 0) return;

  cardRefs.forEach((card, index) => {
    if (!card) return;
    const style = getStackStyle(index, activeIndex);
    gsap.set(card, {
      ...style,
      xPercent: -50,
      yPercent: -50,
      x: 0,
      rotation: 0,
    });
  });
}

export interface SelectMemberOptions {
  cardRefs?: (HTMLElement | null)[];
  activeIndex?: number;
  onComplete?: (index: number) => void;
}

/**
 * Easy, slow, calm transition between team members.
 */
export function selectMember(
  newIndex: number,
  { cardRefs = [], activeIndex = 0, onComplete }: SelectMemberOptions = {}
): void {
  if (isAnimating || !cardRefs || cardRefs.length === 0) return;
  if (newIndex === activeIndex) return;

  if (transitionTimeline) {
    transitionTimeline.kill();
    transitionTimeline = null;
  }

  isAnimating = true;

  const targetCard = cardRefs[newIndex];
  const activeCard = cardRefs[activeIndex];

  const direction = newIndex > activeIndex ? 1 : -1;

  transitionTimeline = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
      transitionTimeline = null;
      if (onComplete) {
        onComplete(newIndex);
      }
    },
  });

  // Outgoing card smoothly fades & glides out
  if (activeCard) {
    transitionTimeline.to(
      activeCard,
      {
        y: -15 * direction,
        scale: 0.96,
        opacity: 0,
        zIndex: 10,
        pointerEvents: "none",
        duration: ANIM_DURATION,
        ease: EASE,
      },
      0
    );
  }

  // Incoming card smoothly glides in & fades up
  if (targetCard) {
    gsap.set(targetCard, {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 20 * direction,
      scale: 0.96,
      opacity: 0,
      zIndex: 20,
    });

    transitionTimeline.to(
      targetCard,
      {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        zIndex: 20,
        pointerEvents: "auto",
        duration: ANIM_DURATION,
        ease: EASE,
      },
      0
    );
  }

  // Ensure all other cards stay hidden cleanly
  cardRefs.forEach((card, i) => {
    if (i !== newIndex && i !== activeIndex && card) {
      gsap.set(card, {
        opacity: 0,
        zIndex: 1,
        pointerEvents: "none",
      });
    }
  });
}
