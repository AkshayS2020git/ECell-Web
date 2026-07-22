// src/utils/animations.js

import { gsap } from "gsap";

/* =====================================================
   DEFAULTS
===================================================== */

export const DEFAULTS = {
  duration: 0.8,
  ease: "power3.out",
};

/* =====================================================
   INITIAL STATE
===================================================== */

export function setInitial(target, vars = {}) {
  return gsap.set(target, vars);
}

/* =====================================================
   TIMELINES
===================================================== */

export function createTimeline(options = {}) {
  return gsap.timeline({
    defaults: DEFAULTS,
    ...options,
  });
}

/* =====================================================
   FADE IN
===================================================== */

export function fadeIn(target, options = {}) {
  return gsap.fromTo(
    target,
    {
      opacity: 0,
      ...options.from,
    },
    {
      opacity: 1,
      duration: DEFAULTS.duration,
      ease: DEFAULTS.ease,
      ...options.to,
    }
  );
}

/* =====================================================
   FADE UP
===================================================== */

export function fadeUp(target, options = {}) {
  return gsap.fromTo(
    target,
    {
      opacity: 0,
      y: 40,
      ...options.from,
    },
    {
      opacity: 1,
      y: 0,
      duration: DEFAULTS.duration,
      ease: DEFAULTS.ease,
      ...options.to,
    }
  );
}

/* =====================================================
   STAGGER FADE UP
===================================================== */

export function staggerFadeUp(targets, options = {}) {
  return gsap.fromTo(
    targets,
    {
      opacity: 0,
      y: 40,
    },
    {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      duration: DEFAULTS.duration,
      ease: DEFAULTS.ease,
      ...options,
    }
  );
}

/* =====================================================
   SCALE IN
===================================================== */

export function scaleIn(target, options = {}) {
  return gsap.fromTo(
    target,
    {
      opacity: 0,
      scale: 0.9,
      ...options.from,
    },
    {
      opacity: 1,
      scale: 1,
      duration: DEFAULTS.duration,
      ease: DEFAULTS.ease,
      ...options.to,
    }
  );
}

/* =====================================================
   SVG HELPERS
===================================================== */

export function prepareSVG(path) {
  const length = path.getTotalLength();

  gsap.set(path, {
    strokeDasharray: length,
    strokeDashoffset: length,
    opacity: 0.35,
  });

  return length;
}

export function drawSVG(path, options = {}) {
  return gsap.to(path, {
    strokeDashoffset: 0,
    opacity: 1,
    duration: 0.6,
    ease: "power2.inOut",
    ...options,
  });
}

/* =====================================================
   QUICK SETTERS
===================================================== */

export function quickSetters(element) {
  return {
    x: gsap.quickSetter(element, "x", "px"),
    y: gsap.quickSetter(element, "y", "px"),
    scale: gsap.quickSetter(element, "scale"),
    opacity: gsap.quickSetter(element, "opacity"),
    rotate: gsap.quickSetter(element, "rotate"),
    rotateX: gsap.quickSetter(element, "rotateX"),
    rotateY: gsap.quickSetter(element, "rotateY"),
    width: gsap.quickSetter(element, "width"),
    height: gsap.quickSetter(element, "height"),
  };
}

/* =====================================================
   COUNTER
===================================================== */

export function animateCounter(target, end, options = {}) {
  return gsap.to(target, {
    innerText: end,
    snap: { innerText: 1 },
    duration: 1.5,
    ease: "power2.out",
    ...options,
  });
}

/* =====================================================
   CLEANUP
===================================================== */

export function kill(animation) {
  if (animation) {
    animation.kill();
  }
}