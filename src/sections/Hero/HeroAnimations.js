import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import { lerp, smoothstep } from "../../utils/math";
import { prepareSVG } from "../../utils/animations";

export function setupHeroAnimations({
  heroRef,
  videoRef,
  videoWrapRef,
  headingRef,
  marqueeRef,
  labelRef,
  logoRef,
  wave1Ref,
  wave2Ref,
  wave3Ref,
  titleRef,
  subtitleRef,
  scrollHintRef,
}) {
  const video = videoRef.current;
  const videoWrap = videoWrapRef.current;
  const marquee = marqueeRef.current;
  const label = labelRef.current;
  const heading = headingRef.current;
  const logo = logoRef.current;
  const title = titleRef.current;
  const subtitle = subtitleRef.current;
  const scrollHint = scrollHintRef?.current;
  const waves = [wave3Ref.current, wave2Ref.current, wave1Ref.current].filter(
    Boolean,
  );

  const waveLengths = waves.map(prepareSVG);

  const marqueeOpacity = gsap.quickSetter(marquee, "opacity");

  const labelOpacity = gsap.quickSetter(label, "opacity");

  const headingOpacity = gsap.quickSetter(heading, "opacity");

  const logoOpacity = gsap.quickSetter(logo, "opacity");

  const titleOpacity = gsap.quickSetter(title, "opacity");

  const subtitleOpacity = gsap.quickSetter(subtitle, "opacity");

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
  gsap.set([marquee, label, logo], { opacity: 0 });
  gsap.set([title, subtitle], { opacity: 0 });
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
    const reveal = smoothstep(0.12, 0.45, progress);
    const logoReveal = smoothstep(0.15, 0.35, progress);
    const wordmarkP = smoothstep(0.72, 0.92, progress);
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
    logoOpacity(logoReveal);

    waves.forEach((path, i) => {
      const winStart = 0.2 + i * 0.1;
      const dp = smoothstep(winStart, winStart + 0.35, progress);
      gsap.set(path, {
        strokeDashoffset: waveLengths[i] * (1 - dp),
        opacity: 0.35 + dp * 0.65,
      });
    });
    titleOpacity(wordmarkP);
    subtitleOpacity(wordmarkP);
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
