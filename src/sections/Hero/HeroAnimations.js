import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import { lerp, smoothstep } from "../../utils/math";

export function setupHeroAnimations({
  heroRef,
  videoRef,
  videoWrapRef,
  headingRef,
  marqueeRef,
  labelRef,
  scrollHintRef,
}) {
  const video = videoRef.current;
  const videoWrap = videoWrapRef.current;
  const marquee = marqueeRef.current;
  const label = labelRef.current;
  const heading = headingRef.current;
  const scrollHint = scrollHintRef?.current;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    gsap.set([videoWrap, marquee, label, heading, scrollHint].filter(Boolean), {
      clearProps: "all",
      opacity: 1,
    });
    video?.pause();
    return () => {};
  }

  const marqueeOpacity = gsap.quickSetter(marquee, "opacity");
  const labelOpacity = gsap.quickSetter(label, "opacity");
  const headingOpacity = gsap.quickSetter(heading, "opacity");
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
    heroSmoothed = lerp(heroSmoothed, targetProgress, 0.1);
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
    marqueeOpacity(reveal);
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
    if (video) video.playbackRate = 0.5;
    ScrollTrigger.refresh();
  };

  gsap.ticker.add(updateHero);
  video?.addEventListener("loadedmetadata", handleVideoMetadata);

  return () => {
    video?.removeEventListener("loadedmetadata", handleVideoMetadata);
    gsap.ticker.remove(updateHero);
    trigger.kill();
  };
}
