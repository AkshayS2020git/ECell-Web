import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollTrigger, Draggable);

// Motion Constants
const ANIM_DURATION = 0.5;
const EASE = "power3.out";

let isAnimating = false;
let scrollTriggerInstance = null;
let draggableInstance = null;
let pickedUpOrigin = null;
let currentHighlighted = null;
let pickupSetters = null;
let pickupCard = null;

export function getIsAnimating() {
  return isAnimating;
}

/**
 * Natural page flow scroll trigger.
 */
export function setupTeamScroll({ teamRef } = {}) {
  if (!teamRef?.current) return;

  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: teamRef.current,
    start: "top top",
    end: "+=100%",
    onEnter: () => {
      const cards = teamRef.current.querySelectorAll(".team__card");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: (i) => (i === 0 ? 1 : Math.max(0.2, 0.8 - i * 0.2)),
            y: (i) => i * 24,
            scale: (i) => 1 - i * 0.05,
            duration: 0.7,
            stagger: 0.05,
            ease: "power3.out",
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
 * Calculates persistent, structured stack depth properties.
 */
export function getStackStyle(index, activeIndex, total) {
  const diff = (index - activeIndex + total) % total;

  if (diff === 0) {
    return {
      opacity: 1,
      scale: 1,
      y: 0,
      rotation: 0,
      zIndex: 20,
      boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
      pointerEvents: "auto",
    };
  } else if (diff === 1) {
    return {
      opacity: 0.8,
      scale: 0.95,
      y: 22,
      rotation: 0,
      zIndex: 15,
      boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
      pointerEvents: "none",
    };
  } else if (diff === 2) {
    return {
      opacity: 0.6,
      scale: 0.9,
      y: 44,
      rotation: 0,
      zIndex: 10,
      boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      pointerEvents: "none",
    };
  } else if (diff === 3) {
    return {
      opacity: 0.4,
      scale: 0.85,
      y: 66,
      rotation: 0,
      zIndex: 5,
      boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
      pointerEvents: "none",
    };
  } else {
    return {
      opacity: 0.2,
      scale: 0.8,
      y: 88,
      rotation: 0,
      zIndex: 1,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      pointerEvents: "none",
    };
  }
}

/**
 * Updates real-time cursor attachment for right-click picked-up card.
 */
export function updatePickedUpCard({
  x,
  y,
  cardRefs = [],
  activeIndex = 0,
} = {}) {
  const activeCard = cardRefs[activeIndex];
  if (!activeCard) return;

  if (!pickedUpOrigin) {
    const rect = activeCard.getBoundingClientRect();
    pickedUpOrigin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  const dx = x - pickedUpOrigin.x + 24;
  const dy = y - pickedUpOrigin.y + 18;
  const rotation = Math.max(-4, Math.min(4, dx * 0.012));

  if (pickupCard !== activeCard) {
    pickupCard = activeCard;
    pickupSetters = {
      x: gsap.quickTo(activeCard, "x", { duration: 0.12, ease: "power3.out" }),
      y: gsap.quickTo(activeCard, "y", { duration: 0.12, ease: "power3.out" }),
      rotation: gsap.quickTo(activeCard, "rotation", { duration: 0.14, ease: "power3.out" }),
    };
    gsap.set(activeCard, {
      scale: 0.92,
      zIndex: 100,
      pointerEvents: "none",
      boxShadow: "0 70px 150px rgba(0,0,0,0.68)",
    });
  }

  pickupSetters.x(dx);
  pickupSetters.y(dy);
  pickupSetters.rotation(rotation);

  const dist = Math.hypot(dx, dy);
  const progress = Math.min(dist / 200, 1);

  cardRefs.forEach((card, i) => {
    if (i !== activeIndex && card) {
      const style = getStackStyle(i, activeIndex, cardRefs.length);
      gsap.set(card, {
        scale: style.scale + progress * 0.04,
        y: style.y + 12 + progress * 10,
        boxShadow: "0 34px 90px rgba(0,0,0,0.48)",
      });
    }
  });
}

/**
 * Highlights underlying card when held card hovers over it.
 */
export function highlightCard(cardRef) {
  if (currentHighlighted && currentHighlighted !== cardRef) {
    gsap.to(currentHighlighted, { y: "+=8", scale: "-=0.03", duration: 0.2, overwrite: true });
  }

  if (cardRef) {
    currentHighlighted = cardRef;
    gsap.to(cardRef, {
      y: "-=8",
      scale: 1.03,
      opacity: 1,
      boxShadow: "0 48px 110px rgba(0,0,0,0.62)",
      duration: 0.25,
      ease: "power3.out",
    });
  }
}

export function setInspectionMode({ cardRefs = [], activeIndex = 0, expanded = false } = {}) {
  cardRefs.forEach((card, index) => {
    if (!card || index === activeIndex) return;
    const style = getStackStyle(index, activeIndex, cardRefs.length);
    const depth = (index - activeIndex + cardRefs.length) % cardRefs.length;
    const side = depth % 2 ? 1 : -1;
    const tier = Math.ceil(depth / 2);
    const spread = 190 + (tier - 1) * 110;
    const rotation = side * (5 + (tier - 1) * 2);
    gsap.to(card, {
      x: expanded ? side * spread : 0,
      y: expanded ? 0 : style.y,
      rotation: expanded ? rotation : style.rotation,
      scale: expanded ? 0.92 : style.scale,
      opacity: expanded ? 1 : style.opacity,
      zIndex: expanded ? 18 - tier : style.zIndex,
      pointerEvents: expanded ? "auto" : "none",
      duration: 0.42,
      ease: "power4.out",
      overwrite: true,
    });
  });
}

/**
 * Handles release behavior for right-click picked-up card mode.
 */
export function releasePickedUpCard({
  hoveredIndex,
  activeIndex = 0,
  cardRefs = [],
  onComplete,
} = {}) {
  pickedUpOrigin = null;
  pickupSetters = null;
  pickupCard = null;
  highlightCard(null);
  currentHighlighted = null;

  const activeCard = cardRefs[activeIndex];

  if (
    hoveredIndex !== undefined &&
    hoveredIndex !== null &&
    hoveredIndex !== activeIndex
  ) {
    selectMember(hoveredIndex, {
      cardRefs,
      activeIndex,
      onComplete,
    });
  } else {
    if (activeCard) {
      gsap.to(activeCard, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        zIndex: 20,
        pointerEvents: "auto",
        boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        duration: 0.45,
        ease: "power3.out",
        onComplete: () => {
          if (onComplete) onComplete(activeIndex);
        },
      });
    }

    cardRefs.forEach((card, i) => {
      if (i !== activeIndex && card) {
        const style = getStackStyle(i, activeIndex, cardRefs.length);
        gsap.to(card, {
          x: 0,
          y: style.y,
          scale: style.scale,
          opacity: style.opacity,
          duration: 0.45,
          ease: "power3.out",
        });
      }
    });
  }
}

/**
 * Configures clean vertical drag physics.
 */
export function setupDraggable({
  activeCard,
  stackCards = [],
  onNavigate,
} = {}) {
  if (draggableInstance && draggableInstance[0]) {
    draggableInstance[0].kill();
    draggableInstance = null;
  }

  if (!activeCard) return;

  const THRESHOLD_Y = 70;

  draggableInstance = Draggable.create(activeCard, {
    type: "x,y",
    edgeResistance: 0.6,
    cursor: "grab",
    activeCursor: "grabbing",
    onPress: function (event) {
      if (event?.button !== 0) {
        this.endDrag(event);
        return;
      }
    },
    onDrag: function () {
      if (isAnimating) return;

      const progress = Math.min(Math.hypot(this.x, this.y) / 240, 1);

      stackCards.forEach((card, idx) => {
        if (!card) return;
        const currentStyle = getStackStyle(idx + 1, 0, stackCards.length + 1);
        const prevStyle = getStackStyle(idx, 0, stackCards.length + 1);

        gsap.set(card, {
          scale:
            currentStyle.scale +
            progress * (prevStyle.scale - currentStyle.scale),
          opacity:
            currentStyle.opacity +
            progress * (prevStyle.opacity - currentStyle.opacity),
          y: currentStyle.y - progress * (currentStyle.y - prevStyle.y),
        });
      });
    },
    onDragEnd: function () {
      if (isAnimating) return;

      const deltaY = this.y;
      const velY = this.velocityY || 0;
      const passedThreshold =
        Math.abs(deltaY) > THRESHOLD_Y || Math.abs(velY) > 300;

      if (passedThreshold) {
        const isUp = deltaY < 0 || velY < -300;

        gsap.to(this.target, {
          y: isUp ? -30 : 30,
          opacity: 0,
          scale: 0.98,
          duration: 0.45,
          ease: "power3.out",
          onComplete: () => {
            if (onNavigate) {
              onNavigate(isUp ? "next" : "prev");
            }
          },
        });
      } else {
        gsap.to(this.target, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: "power3.out",
          onComplete: () => {
          },
        });

        stackCards.forEach((card, idx) => {
          if (!card) return;
          const style = getStackStyle(idx + 1, 0, stackCards.length + 1);
          gsap.to(card, {
            scale: style.scale,
            opacity: style.opacity,
            y: style.y,
            duration: 0.45,
            ease: "power3.out",
          });
        });
      }
    },
  });
}

/**
 * Initializes card stack presentation.
 */
export function setupTeamAnimations({
  cardRefs = [],
  activeIndex = 0,
} = {}) {
  if (!cardRefs || cardRefs.length === 0) return;

  const total = cardRefs.length;

  cardRefs.forEach((card, index) => {
    if (!card) return;
    const style = getStackStyle(index, activeIndex, total);
    gsap.set(card, { ...style, xPercent: -50, yPercent: -50 });
  });

}

export function playTimeline() { }
export function reverseTimeline() { }

/**
 * Single Unified Calm Transition: Outgoing card fades upward; incoming card grows continuously from stack.
 */
export function selectMember(
  newIndex,
  { cardRefs = [], activeIndex = 0, onComplete } = {}
) {
  if (isAnimating || !cardRefs || cardRefs.length === 0) return;
  if (newIndex === activeIndex) return;

  isAnimating = true;

  const total = cardRefs.length;
  const targetCard = cardRefs[newIndex];
  const activeCard = cardRefs[activeIndex];

  const transitionTimeline = gsap.timeline({
    onComplete: () => {
      isAnimating = false;
      if (onComplete) {
        onComplete(newIndex);
      }
    },
  });

  if (activeCard) {
    transitionTimeline.to(
      activeCard,
      {
        y: -180,
        opacity: 0.18,
        scale: 0.985,
        rotation: 0,
        // Keep the departing photograph above the incoming card until it clears the stack.
        zIndex: 30,
        pointerEvents: "none",
        duration: 0.56,
        ease: "power3.in",
      },
      0
    );
  }

  if (targetCard) {
    const targetStackStyle = getStackStyle(newIndex, activeIndex, total);
    gsap.set(targetCard, {
      x: 0,
      y: targetStackStyle.y,
      scale: targetStackStyle.scale,
      opacity: Math.max(0.35, targetStackStyle.opacity),
      rotation: 0,
    });
    transitionTimeline.to(
      targetCard,
      {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 20,
        pointerEvents: "auto",
        duration: 0.64,
        ease: "power4.out",
      },
      0
    );
  }

  cardRefs.forEach((card, i) => {
    if (i !== newIndex && i !== activeIndex && card) {
      const style = getStackStyle(i, newIndex, total);
      transitionTimeline.to(
        card,
        {
          x: 0,
          y: style.y,
          rotation: 0,
          scale: style.scale,
          opacity: style.opacity,
          zIndex: style.zIndex,
          pointerEvents: "none",
          duration: ANIM_DURATION,
          ease: EASE,
        },
        0
      );
    }
  });
}
