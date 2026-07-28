import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Motion Constants - Slow, gentle, luxurious transitions
const ANIM_DURATION = 0.85;
const EASE = "power2.inOut";

let isAnimating = false;
let scrollTriggerInstance = null;

export function getIsAnimating() {
  return isAnimating;
}

/**
 * Natural page reveal animation.
 */
export function setupTeamScroll({ teamRef } = {}) {
  if (!teamRef?.current) return;

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: teamRef.current,
    start: "top 80%",
    onEnter: () => {
      const activeCard = teamRef.current.querySelector('.team__card[data-active="true"]');
      if (activeCard) {
        gsap.fromTo(
          activeCard,
          { opacity: 0, y: 30, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
          }
        );
      }
    },
  });

  return () => {
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
export function getStackStyle(index, activeIndex) {
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

/**
 * Initializes card stack presentation.
 */
export function setupTeamAnimations({
  cardRefs = [],
  activeIndex = 0,
} = {}) {
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

/**
 * Easy, slow, calm transition between team members.
 */
export function selectMember(
  newIndex,
  { cardRefs = [], activeIndex = 0, onComplete } = {}
) {
  if (isAnimating || !cardRefs || cardRefs.length === 0) return;
  if (newIndex === activeIndex) return;

  isAnimating = true;

  const targetCard = cardRefs[newIndex];
  const activeCard = cardRefs[activeIndex];

  const direction = newIndex > activeIndex ? 1 : -1;

  const transitionTimeline = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
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
