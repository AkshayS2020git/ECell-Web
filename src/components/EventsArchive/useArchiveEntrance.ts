import { useEffect, type RefObject } from "react";
import { gsap } from "@/src/utils/gsapSetup";
import { refreshScroll } from "@/src/utils/lenis";
import { TRANSITION_REVEAL_EVENT } from "@/src/components/PageTransition/PageTransition";

interface ArchiveEntranceRefs {
  heroRef: RefObject<HTMLDivElement | null>;
  calendarRef: RefObject<HTMLDivElement | null>;
  cardsRef: RefObject<HTMLDivElement | null>;
  archiveRef: RefObject<HTMLDivElement | null>;
}

/** GSAP entrance animations for the /events page: hero and featured card on
 *  mount (or once the page transition lifts), the rest as they scroll in. */
export function useArchiveEntrance({ heroRef, calendarRef, cardsRef, archiveRef }: ArchiveEntranceRefs): void {
  useEffect(() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion) return;

  let ctx: ReturnType<typeof gsap.context> | undefined;

  // When arriving through the page transition, hold the hero entrance
  // until the curtain lifts so it plays in view instead of behind it.
  const heroTweens: gsap.core.Tween[] = [];
  let revealFallback: number | undefined;
  const playHero = () => {
    window.clearTimeout(revealFallback);
    heroTweens.forEach((tween) => tween.play());
  };

  const initializeAnimations = () => {
    const waitForReveal = Boolean(document.documentElement.dataset.pageTransition);
    if (waitForReveal) {
      window.addEventListener(TRANSITION_REVEAL_EVENT, playHero, { once: true });
      revealFallback = window.setTimeout(playHero, 4000);
    }

    ctx = gsap.context(() => {
      /* Hero elements - animate immediately on mount */

      const heroElements =
        heroRef.current?.querySelectorAll(
          ".ea-eyebrow, .ea-hero h1, .ea-hero-intro, .ea-actions",
        );

      if (heroElements?.length) {
        heroTweens.push(gsap.fromTo(
          heroElements,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform",
            paused: waitForReveal,
          },
        ));
      }

      /* Featured card - animate immediately on mount */

      const featureCard =
        heroRef.current?.querySelector(
          ".ea-feature",
        );

      if (featureCard) {
        heroTweens.push(gsap.fromTo(
          featureCard,
          {
            opacity: 0,
            y: 40,
            rotate: 0,
          },
          {
            opacity: 1,
            y: 0,
            rotate: 1.5,
            duration: 0.8,
            delay: waitForReveal ? 0.15 : 0,
            ease: "power3.out",
            clearProps: "transform",
            paused: waitForReveal,
          },
        ));
      }

      /* Calendar dates */

      const dateElements =
        calendarRef.current?.querySelectorAll(
          ".ea-date",
        );

      if (dateElements?.length) {
        gsap.fromTo(
          dateElements,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: calendarRef.current,
              start: "top 85%",
              once: true,
            },
            clearProps: "transform",
          },
        );
      }

      /* Event cards */

      const cardElements =
        cardsRef.current?.querySelectorAll(
          ".ea-card",
        );

      if (cardElements?.length) {
        gsap.fromTo(
          cardElements,
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              once: true,
            },
            clearProps: "transform",
          },
        );
      }

      /* Archive rows */

      const archiveElements =
        archiveRef.current?.querySelectorAll(
          ".ea-archive-row",
        );

      if (archiveElements?.length) {
        gsap.fromTo(
          archiveElements,
          {
            opacity: 0,
            x: -20,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: archiveRef.current,
              start: "top 85%",
              once: true,
            },
            clearProps: "transform",
          },
        );
      }

      /*
       * Recalculate ScrollTrigger after layout pass
       */
      window.setTimeout(refreshScroll, 100);
    });
  };

  /*
   * Wait for the browser to complete one layout pass
   * before GSAP calculates animation positions.
   */
  const frame = window.requestAnimationFrame(() => {
    initializeAnimations();
  });

  return () => {
    window.cancelAnimationFrame(frame);
    // `ctx.revert()` already kills the triggers created above. The previous
    // `ScrollTrigger.getAll().forEach(kill)` here also destroyed triggers
    // belonging to other components that happened to be mounted.
    window.clearTimeout(revealFallback);
    window.removeEventListener(TRANSITION_REVEAL_EVENT, playHero);
    ctx?.revert();
  };
  }, [heroRef, calendarRef, cardsRef, archiveRef]);
}
