import { useEffect, useRef, useState } from "react";
import teamMembers from "./TeamData.js";
import {
  setupTeamAnimations,
  setupTeamScroll,
  selectMember,
  setInspectionMode,
  getIsAnimating,
} from "./TeamAnimations";
import "./Team.css";
import "./TeamLayout.css";
import "./TeamResponsive.css";

export default function Team() {
  const teamRef = useRef(null);
  const backgroundRef = useRef(null);
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const stackRef = useRef(null);
  const navigationRef = useRef(null);
  const cardRefs = useRef([]);
  const activeCardHoverRef = useRef(false);
  const holdTimerRef = useRef(null);
  const isSelectorHoldingRef = useRef(false);
  const suppressActiveClickRef = useRef(false);
  const slideshowTimerRef = useRef(null);
  const slideshowResumeRef = useRef(null);
  const slideshowPausedRef = useRef(false);
  const expandedRef = useRef(false);
  const navigateMemberRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const cleanupScroll = setupTeamScroll({ teamRef, stageRef });
    return () => {
      cleanupScroll?.();
    };
  }, []);

  const navigateMember = (direction) => {
    if (getIsAnimating && getIsAnimating()) return;

    const total = teamMembers.length;
    const targetIndex =
      direction === "next"
        ? (activeIndex + 1) % total
        : (activeIndex - 1 + total) % total;

    selectMember(targetIndex, {
      cardRefs: cardRefs.current,
      activeIndex,
      onComplete: (newIndex) => {
        setActiveIndex(newIndex);
        expandedRef.current = false;
        setExpanded(false);
        resumeSlideshow();
      },
    });
  };

  navigateMemberRef.current = navigateMember;
  expandedRef.current = expanded;

  const stopSlideshow = () => {
    slideshowPausedRef.current = true;
    if (slideshowTimerRef.current) {
      clearTimeout(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }
    if (slideshowResumeRef.current) {
      clearTimeout(slideshowResumeRef.current);
      slideshowResumeRef.current = null;
    }
  };

  const startSlideshow = () => {
    if (slideshowPausedRef.current || expandedRef.current) return;
    if (slideshowTimerRef.current) clearTimeout(slideshowTimerRef.current);
    slideshowTimerRef.current = setTimeout(() => {
      slideshowTimerRef.current = null;
      if (!slideshowPausedRef.current && !expandedRef.current && !getIsAnimating()) {
        navigateMemberRef.current?.("next");
      }
      startSlideshow();
    }, 4500);
  };

  const resumeSlideshow = () => {
    if (slideshowResumeRef.current) clearTimeout(slideshowResumeRef.current);
    slideshowResumeRef.current = setTimeout(() => {
      slideshowResumeRef.current = null;
      if (expandedRef.current || activeCardHoverRef.current) return;
      slideshowPausedRef.current = false;
      startSlideshow();
    }, 2800);
  };

  useEffect(() => {
    startSlideshow();
    return () => {
      if (slideshowTimerRef.current) clearTimeout(slideshowTimerRef.current);
      if (slideshowResumeRef.current) clearTimeout(slideshowResumeRef.current);
    };
  }, []);

  useEffect(() => {
    setupTeamAnimations({
      cardRefs: cardRefs.current,
      activeIndex,
      onNavigate: navigateMember,
    });
  }, [activeIndex]);

  useEffect(() => {
    setInspectionMode({ cardRefs: cardRefs.current, activeIndex, expanded });
  }, [activeIndex, expanded]);

  // Wheel navigation is deliberately scoped to the card the pointer is over.
  useEffect(() => {
    const activeCard = cardRefs.current[activeIndex];
    if (!activeCard) return;

    let wheelTimeout = null;
    let isListening = false;

    const handleWheel = (e) => {
      e.preventDefault();
      if (getIsAnimating && getIsAnimating()) return;

      if (!wheelTimeout && Math.abs(e.deltaY) > 20) {
        if (e.deltaY > 0) {
          navigateMember("next");
        } else {
          navigateMember("prev");
        }
        wheelTimeout = setTimeout(() => {
          wheelTimeout = null;
        }, 500);
      }
    };

    const attachWheelNavigation = () => {
      if (isListening) return;
      isListening = true;
      window.addEventListener("wheel", handleWheel, {
        passive: false,
        capture: true,
      });
    };

    const detachWheelNavigation = () => {
      if (!isListening) return;
      isListening = false;
      window.removeEventListener("wheel", handleWheel, { capture: true });
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
        wheelTimeout = null;
      }
    };

    const startWheelNavigation = () => {
      stopSlideshow();
      activeCardHoverRef.current = true;
      attachWheelNavigation();
    };

    const stopWheelNavigation = () => {
      activeCardHoverRef.current = false;
      detachWheelNavigation();
      resumeSlideshow();
    };

    activeCard.addEventListener("pointerenter", startWheelNavigation);
    activeCard.addEventListener("pointerleave", stopWheelNavigation);
    if (activeCardHoverRef.current || activeCard.matches(":hover")) {
      activeCardHoverRef.current = true;
      attachWheelNavigation();
    }

    return () => {
      activeCard.removeEventListener("pointerenter", startWheelNavigation);
      activeCard.removeEventListener("pointerleave", stopWheelNavigation);
      detachWheelNavigation();
    };
  }, [activeIndex]);

  useEffect(() => {
    const handlePointerUp = () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      if (isSelectorHoldingRef.current) {
        isSelectorHoldingRef.current = false;
        suppressActiveClickRef.current = true;
        expandedRef.current = false;
        setExpanded(false);
        resumeSlideshow();
      }
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handleCardPointerDown = (e, index) => {
    if (e.button === 2) {
      e.preventDefault();
      return;
    }
    if (e.button !== 0 || index !== activeIndex || getIsAnimating()) return;

    stopSlideshow();
    holdTimerRef.current = setTimeout(() => {
      isSelectorHoldingRef.current = true;
      expandedRef.current = true;
      setExpanded(true);
    }, 160);
  };

  const handleCardClick = (e, index) => {
    stopSlideshow();
    if (getIsAnimating && getIsAnimating()) return;

    if (index === activeIndex) {
      if (suppressActiveClickRef.current) {
        suppressActiveClickRef.current = false;
        return;
      }
      navigateMember("next");
    } else if (expanded) {
      selectMember(index, {
        cardRefs: cardRefs.current,
        activeIndex,
        onComplete: (newIndex) => {
          setActiveIndex(newIndex);
          expandedRef.current = false;
          setExpanded(false);
          resumeSlideshow();
        },
      });
    }
  };

  return (
    <section ref={teamRef} className="team">
      <div ref={containerRef} className="team__container">
        <div className="team__label">
          <span className="team__label-mark">THE TEAM</span>
        </div>
        <div ref={stageRef} className="team__stage">
          <div ref={backgroundRef} className="team__background" />

          <div ref={stackRef} className="team__stack">
            {teamMembers.map((member, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={member.id}
                  ref={(el) => (cardRefs.current[index] = el)}
                  className="team__card"
                  data-index={index}
                  data-active={isActive}
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  onPointerDown={(e) => handleCardPointerDown(e, index)}
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={(e) => handleCardClick(e, index)}
                >
                  <div className="team__image">
                    <img
                      src={member.image}
                      alt={member.name}
                      loading={isActive ? "eager" : "lazy"}
                      draggable="false"
                    />
                  </div>

                  <div className="team__content">
                    <span className="team__role">{member.role}</span>
                    <h2 className="team__title">{member.name}</h2>
                    <p className="team__description">{member.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div ref={navigationRef} className="team__navigation" />
        </div>
      </div>
    </section>
  );
}
