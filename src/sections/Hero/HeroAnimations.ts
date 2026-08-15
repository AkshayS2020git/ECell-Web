import { RefObject } from "react";
import { gsap, ScrollTrigger } from "../../utils/gsapSetup";
import { lerp, smoothstep } from "../../utils/math";

export interface SetupHeroAnimationsOptions {
  heroRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  videoWrapRef: RefObject<HTMLElement | null>;
  headingRef: RefObject<HTMLElement | null>;
  marqueeRef: RefObject<HTMLElement | null>;
  labelRef: RefObject<HTMLElement | null>;
  scrollHintRef?: RefObject<HTMLElement | null>;
}

export function setupHeroAnimations({
  heroRef,
  videoRef,
  videoWrapRef,
  headingRef,
  marqueeRef,
  labelRef,
  scrollHintRef,
}: SetupHeroAnimationsOptions): () => void {
  const marqueeMaxOpacity = 0.82;
  const video = videoRef.current;
  const videoWrap = videoWrapRef.current;
  const marquee = marqueeRef.current;
  const label = labelRef.current;
  const heading = headingRef.current;
  const scrollHint = scrollHintRef?.current;
  const reduceMotion = typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
  const isMobile = typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false;

  if (reduceMotion) {
    gsap.set([videoWrap, label, heading, scrollHint].filter(Boolean), {
      clearProps: "all",
      opacity: 1,
    });
    gsap.set(marquee, { clearProps: "all", opacity: marqueeMaxOpacity });
    video?.pause();
    return () => {};
  }

  if (isMobile) {
    gsap.set(videoWrap, {
      scale: 1,
      opacity: 1,
      borderRadius: 0,
      boxShadow: "none",
      transformOrigin: "center center",
    });
    gsap.set([marquee, label], { opacity: 0 });
    gsap.set(heading, { opacity: 1 });
    if (scrollHint) gsap.set(scrollHint, { opacity: 1 });

    const mobileTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.25,
        invalidateOnRefresh: true,
      },
    });

    mobileTimeline
      .to(videoWrap, { scale: 0.78, opacity: 0.94, ease: "none", duration: 1 }, 0)
      .to(marquee, { opacity: marqueeMaxOpacity, ease: "none", duration: 0.32 }, 0.12)
      .to(label, { opacity: 1, ease: "none", duration: 0.28 }, 0.16)
      .to(heading, { opacity: 0, ease: "none", duration: 0.25 }, 0.06);

    if (scrollHint) {
      mobileTimeline.to(scrollHint, { opacity: 0, ease: "none", duration: 0.18 }, 0.02);
    }

    if (video) video.playbackRate = 0.5;

    return () => {
      if (mobileTimeline.scrollTrigger) mobileTimeline.scrollTrigger.kill();
      mobileTimeline.kill();
      // Pause video to release media resources
      if (video) {
        video.pause();
      }
    };
  }

  const marqueeOpacity = marquee ? gsap.quickSetter(marquee, "opacity") : () => {};
  const labelOpacity = label ? gsap.quickSetter(label, "opacity") : () => {};
  const headingOpacity = heading ? gsap.quickSetter(heading, "opacity") : () => {};
  const scrollHintOpacity = scrollHint
    ? gsap.quickSetter(scrollHint, "opacity")
    : null;

  gsap.set(videoWrap, {
    scale: 1,
    opacity: 1,
    borderRadius: 0,
    boxShadow: "0 0 0 rgba(0,0,0,0)",
    transformOrigin: "center center",
  });
  gsap.set([marquee, label], { opacity: 0 });
  gsap.set(heading, { opacity: 1 });
  if (scrollHint) gsap.set(scrollHint, { opacity: 1 });

  let targetProgress = 0;
  let heroSmoothed = 0;
  let lastAppliedProgress = -1;
  let disposed = false;

  const trigger = ScrollTrigger.create({
    trigger: heroRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      targetProgress = self.progress;
    },
  });

  const updateHero = () => {
    if (disposed) return;

    const diff = Math.abs(heroSmoothed - targetProgress);
    if (diff < 0.00005) {
      heroSmoothed = targetProgress;
      if (lastAppliedProgress === heroSmoothed) {
        return;
      }
    } else {
      heroSmoothed = lerp(heroSmoothed, targetProgress, 0.1);
    }
    lastAppliedProgress = heroSmoothed;

    const progress = heroSmoothed;
    const endSqueeze = smoothstep(0.72, 1, progress) * 0.07;
    const scale = 1 - progress * 0.55 - endSqueeze;
    const reveal = smoothstep(0.08, 0.35, progress);
    const cardP = smoothstep(0.18, 0.5, progress);

    gsap.set(videoWrap, {
      scale,
      opacity: 1 - progress * 0.15,
      borderRadius: `${cardP * 24}px`,
      boxShadow: `0 ${cardP * 48}px ${cardP * 110}px rgba(0,0,0,${cardP * 0.46})`,
    });
    marqueeOpacity(reveal * marqueeMaxOpacity);
    labelOpacity(reveal);
    headingOpacity(1 - smoothstep(0.05, 0.35, progress));
    if (scrollHintOpacity) {
      scrollHintOpacity(1 - smoothstep(0.02, 0.2, progress));
    }
  };

  if (video) {
    video.playbackRate = 0.5;
  }

  const handleVideoMetadata = () => {
    if (disposed) return;
    if (video) video.playbackRate = 0.5;
    ScrollTrigger.refresh();
  };

  gsap.ticker.add(updateHero);
  video?.addEventListener("loadedmetadata", handleVideoMetadata);

  return () => {
    disposed = true;
    video?.removeEventListener("loadedmetadata", handleVideoMetadata);
    gsap.ticker.remove(updateHero);
    trigger.kill();
    // Pause video to release media resources
    if (video) {
      video.pause();
    }
  };
}
