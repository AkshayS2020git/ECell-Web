import { gsap } from "@/src/utils/gsapSetup";

interface SponsorsAnimationTargets {
  section: HTMLElement;
  header: HTMLElement | null;
  constellation: HTMLElement | null;
  glow: HTMLElement | null;
  wipeBar: HTMLElement | null;
}

/**
 * Scroll-driven entrance, story and exit timelines for the Sponsors section.
 * Returns a cleanup that reverts every timeline, or nothing when reduced
 * motion is on (the content is simply shown).
 */
export function setupSponsorsAnimations({
  section,
  header,
  constellation,
  glow,
  wipeBar,
}: SponsorsAnimationTargets): (() => void) | undefined {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    if (header) gsap.set(header, { opacity: 1, y: 0 });
    if (constellation) gsap.set(constellation, { opacity: 1, y: 0 });
    if (glow) gsap.set(glow, { opacity: 0.35, scale: 1 });
    return;
  }

  const wipeCtx = gsap.context(() => {
    // ── Luminous Wipe Bar Sweep (Scroll Scrub) ──
    if (wipeBar) {
      gsap.fromTo(
        wipeBar,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            end: "top 55%",
            scrub: 0.5,
          },
        }
      );
      gsap.to(wipeBar, {
        opacity: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 50%",
          end: "top 30%",
          scrub: 0.5,
        },
      });
    }
  }, section);

  const headerCtx = gsap.context(() => {
    // ── Kinetic Typography: Partners slides from left, & stays center, Sponsors from right ──
    const headerTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 88%",
        end: "top 35%",
        scrub: 0.8,
      },
    });

    // Badge enters from top
    headerTl.fromTo(
      ".sponsors-badge-container",
      { y: -20, opacity: 0, scale: 0.92, filter: "blur(6px)" },
      { y: 0, opacity: 1, scale: 1, filter: "blur(0px)", ease: "power3.out" },
      0
    );

    // "Partners" slides in with momentum from the left
    headerTl.fromTo(
      ".sponsors-word-left",
      { x: -110, opacity: 0, filter: "blur(10px)", letterSpacing: "0.08em" },
      { x: 0, opacity: 1, filter: "blur(0px)", letterSpacing: "-0.03em", ease: "power3.out" },
      0.05
    );

    // "&" stays anchored in center, scaling from a luminous focal spark
    headerTl.fromTo(
      ".sponsors-headline-amp",
      { scale: 0, opacity: 0, filter: "blur(8px)" },
      { scale: 1, opacity: 0.65, filter: "blur(0px)", ease: "back.out(2.2)" },
      0.1
    );

    // "Sponsors" slides in with momentum from the right
    headerTl.fromTo(
      ".sponsors-word-right",
      { x: 110, opacity: 0, filter: "blur(10px)", letterSpacing: "0.08em" },
      { x: 0, opacity: 1, filter: "blur(0px)", letterSpacing: "-0.03em", ease: "power3.out" },
      0.05
    );

    // Subtitle unmasks as the headline locks together
    headerTl.fromTo(
      ".sponsors-intro",
      { y: 22, opacity: 0, filter: "blur(6px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", ease: "power3.out" },
      0.2
    );
  }, section);

  const glowCtx = gsap.context(() => {
    // ── Ambient Radial Glow Expansion ──
    if (glow) {
      gsap.fromTo(
        glow,
        { scale: 0.3, opacity: 0 },
        {
          scale: 1.25,
          opacity: 0.4,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 92%",
            end: "top 20%",
            scrub: 0.8,
          },
        }
      );
    }
  }, section);

  const storyCtx = gsap.context(() => {
    // ══════════════════════════════════════════════════════════════
    // ── AWWWARDS STORYTELLING TIMELINE: NODES → PATHS → CARDS → LOGOS ──
    // ══════════════════════════════════════════════════════════════
    const storyTl = gsap.timeline({
      scrollTrigger: {
        trigger: constellation,
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
    });

    // Prepare SVG path lengths for clean line-drawing
    const pathElements = gsap.utils.toArray<SVGPathElement>(".constellation-line-path");
    pathElements.forEach((path) => {
      const length = path.getTotalLength ? path.getTotalLength() : 300;
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0,
      });
    });

    // ── PHASE 1: NODES (Seed Origin & Constellation Ignition) ──
    // 1.1 Origin seed beacon dots ignite with scale bounce & shockwave ripple
    const anchorNodes = gsap.utils.toArray<SVGElement>(".constellation-anchor-node");
    const junctionDots = gsap.utils.toArray<SVGElement>(".constellation-junction-dot");
    const pingRings = gsap.utils.toArray<SVGElement>(".node-ping-ring");
    const stars = gsap.utils.toArray<HTMLElement>(".constellation-star");

    // Stars in backdrop awaken
    if (stars.length > 0) {
      storyTl.fromTo(
        stars,
        { opacity: 0, scale: 0 },
        { opacity: 0.7, scale: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" },
        0
      );
    }

    // Extra backdrop stars fade up, and the faint margin constellations
    // trace themselves in, behind the main network
    const backdropStars = gsap.utils.toArray<HTMLElement>(".backdrop-star");
    if (backdropStars.length > 0) {
      storyTl.fromTo(
        backdropStars,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, stagger: { amount: 0.8, from: "random" }, ease: "power2.out" },
        0
      );
    }

    const planets = gsap.utils.toArray<HTMLElement>(".bg-planet");
    if (planets.length > 0) {
      storyTl.fromTo(
        planets,
        { opacity: 0, y: 24, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.15, ease: "power3.out" },
        0
      );
    }

    const backdropLines = gsap.utils.toArray<SVGPathElement>(".bg-constellation-line");
    backdropLines.forEach((path) => {
      const length = path.getTotalLength ? path.getTotalLength() : 40;
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    const backdropFigureStars = gsap.utils.toArray<SVGElement>(".bg-constellation-star");
    if (backdropFigureStars.length > 0) {
      storyTl.fromTo(
        backdropFigureStars,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: { amount: 0.6, from: "random" }, ease: "back.out(2)" },
        0.05
      );
    }
    if (backdropLines.length > 0) {
      storyTl.to(
        backdropLines,
        { strokeDashoffset: 0, duration: 0.6, stagger: { amount: 0.9 }, ease: "power2.inOut" },
        0.2
      );
    }

    // The ECELL RVU wordmark spells itself out: each letter's stars light up,
    // then its strokes trace, before the next letter begins.
    gsap.utils.toArray<SVGGElement>(".bg-wordmark-letter").forEach((letter, i) => {
      const at = 0.15 + i * 0.28;
      const letterStars = letter.querySelectorAll<SVGCircleElement>(".bg-wordmark-star");
      const letterLines = Array.from(letter.querySelectorAll<SVGPathElement>(".bg-wordmark-line"));
      letterLines.forEach((path) => {
        const length = path.getTotalLength ? path.getTotalLength() : 20;
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      storyTl.fromTo(
        letterStars,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.3, stagger: 0.04, ease: "back.out(2)" },
        at
      );
      storyTl.to(
        letterLines,
        { strokeDashoffset: 0, duration: 0.22, stagger: 0.07, ease: "power1.inOut" },
        at + 0.08
      );
    });

    // Top anchor nodes & central hub ignite first
    if (anchorNodes.length > 0) {
      storyTl.fromTo(
        anchorNodes,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 0.9,
          duration: 0.45,
          stagger: {
            each: 0.05,
            from: "start",
          },
          ease: "back.out(2.4)",
        },
        0.05
      );
    }

    // Radar ping rings expand out from origin nodes
    if (pingRings.length > 0) {
      storyTl.fromTo(
        pingRings,
        { r: 2, opacity: 0.9, strokeWidth: 1.5 },
        {
          r: 18,
          opacity: 0,
          strokeWidth: 0.2,
          duration: 0.7,
          stagger: 0.06,
          ease: "power2.out",
        },
        0.1
      );
    }

    // Junction points appear
    if (junctionDots.length > 0) {
      storyTl.fromTo(
        junctionDots,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 0.65,
          duration: 0.35,
          stagger: 0.04,
          ease: "back.out(2)",
        },
        0.2
      );
    }

    // ── PHASE 2: PATHS (Vector Circuit Propagation) ──
    // The paths draw in organized cascading waves down the network tree
    const branchTier1 = gsap.utils.toArray<SVGPathElement>(".path-tier-1");
    const branchTier2 = gsap.utils.toArray<SVGPathElement>(".path-tier-2");
    const branchTier3 = gsap.utils.toArray<SVGPathElement>(".path-tier-3");
    const branchTier4 = gsap.utils.toArray<SVGPathElement>(".path-tier-4");

    // Tier 1 branches (North anchors down/up: Nokia->Waffle, Herody->RedBull)
    if (branchTier1.length > 0) {
      storyTl.to(
        branchTier1,
        {
          strokeDashoffset: 0,
          opacity: 0.45,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.inOut",
        },
        0.3
      );
    }

    // Tier 2 branches (Horizontal bridge: Waffle->TVS, Herody->Mercedes)
    if (branchTier2.length > 0) {
      storyTl.to(
        branchTier2,
        {
          strokeDashoffset: 0,
          opacity: 0.45,
          duration: 0.4,
          stagger: 0.06,
          ease: "power2.inOut",
        },
        0.5
      );
    }

    // Tier 3 branches (Mid down to Core: TVS->Attys, Herody->Cube, Merc->Justvend)
    if (branchTier3.length > 0) {
      storyTl.to(
        branchTier3,
        {
          strokeDashoffset: 0,
          opacity: 0.45,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.inOut",
        },
        0.68
      );
    }

    // Tier 4 branches (Core down to Base: Attys->EasyBites, Justvend->Mile)
    if (branchTier4.length > 0) {
      storyTl.to(
        branchTier4,
        {
          strokeDashoffset: 0,
          opacity: 0.45,
          duration: 0.45,
          stagger: 0.06,
          ease: "power2.inOut",
        },
        0.88
      );
    }

    // ── PHASE 3: CARDS (Materializing Along The Network) ──
    // Once paths illuminate, cards blossom into existence row by row
    const row1Cards = gsap.utils.toArray<HTMLElement>(".row-1 .sponsor-card-inner");
    const row2Cards = gsap.utils.toArray<HTMLElement>(".row-2 .sponsor-card-inner");
    const row3Cards = gsap.utils.toArray<HTMLElement>(".row-3 .sponsor-card-inner");
    const row4Cards = gsap.utils.toArray<HTMLElement>(".row-4 .sponsor-card-inner");
    const row5Cards = gsap.utils.toArray<HTMLElement>(".row-5 .sponsor-card-inner");

    // Row 1 Cards (Pioneers) materialize
    if (row1Cards.length > 0) {
      storyTl.fromTo(
        row1Cards,
        {
          opacity: 0,
          scale: 0.84,
          y: 18,
          filter: "blur(8px)",
          borderColor: "rgba(255, 255, 255, 0.45)",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          borderColor: "rgba(244, 244, 242, 0.16)",
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
        },
        0.55
      );
    }

    // Row 2 Cards materialize
    if (row2Cards.length > 0) {
      storyTl.fromTo(
        row2Cards,
        {
          opacity: 0,
          scale: 0.86,
          y: 16,
          filter: "blur(6px)",
          borderColor: "rgba(255, 255, 255, 0.4)",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          borderColor: "rgba(244, 244, 242, 0.12)",
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
        },
        0.8
      );
    }

    // Row 3 Cards materialize
    if (row3Cards.length > 0) {
      storyTl.fromTo(
        row3Cards,
        {
          opacity: 0,
          scale: 0.88,
          y: 14,
          filter: "blur(6px)",
          borderColor: "rgba(255, 255, 255, 0.35)",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          borderColor: "rgba(244, 244, 242, 0.12)",
          duration: 0.45,
          stagger: 0.06,
          ease: "power3.out",
        },
        1.05
      );
    }

    // Row 4 Cards materialize
    if (row4Cards.length > 0) {
      storyTl.fromTo(
        row4Cards,
        {
          opacity: 0,
          scale: 0.88,
          y: 12,
          filter: "blur(6px)",
          borderColor: "rgba(255, 255, 255, 0.35)",
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          borderColor: "rgba(244, 244, 242, 0.12)",
          duration: 0.45,
          stagger: 0.06,
          ease: "power3.out",
        },
        1.25
      );
    }

    if (row5Cards.length > 0) {
      storyTl.fromTo(
        row5Cards,
        { opacity: 0, scale: 0.88, y: 12, filter: "blur(6px)" },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          stagger: 0.06,
          ease: "power3.out",
        },
        1.45
      );
    }

    // ══════════════════════════════════════════════════════════════
    // ── PHASE 4: LOGOS (Living Signal Lock-In) ──
    // Logos surge with exposure/contrast before settling into crisp clarity
    const logos = gsap.utils.toArray<HTMLElement>(".sponsor-logo");
    if (logos.length > 0) {
      storyTl.fromTo(
        logos,
        {
          opacity: 0,
          filter: "brightness(2) contrast(1.2)",
          scale: 0.94,
        },
        {
          opacity: 1,
          filter: "brightness(1) contrast(1.02)",
          scale: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.out",
        },
        0.9
      );
    }
  }, section);

  const exitCtx = gsap.context(() => {
    // ═══════════════════════════════════════════════════════════════
    // ── MORPHIC TRANSITION: ONLY FIRES ON SECTION EXIT ──
    // ══════════════════════════════════════════════════════════════
    const exitTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "bottom 85%",
        end: "bottom 10%",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    // 1. Left and right cards collapse towards center axis with blur & scale down
    exitTl.to(
      ".constellation-col:nth-child(odd)",
      {
        x: 140,
        scale: 0.2,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.5,
        ease: "power2.in",
      },
      0
    );

    exitTl.to(
      ".constellation-col:nth-child(even)",
      {
        x: -140,
        scale: 0.2,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.5,
        ease: "power2.in",
      },
      0
    );

    // 2. Nodes and dots implode to center
    exitTl.to(
      ".constellation-anchor-node, .constellation-junction-dot, .node-ping-ring, .constellation-star, .backdrop-star, .bg-constellation, .bg-planet:not(.bg-planet--blackhole)",
      {
        scale: 0,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      },
      0
    );

    // 3. Constellation network lines stretch and collapse into center vertical conduit
    exitTl.to(
      ".constellation-line-path",
      {
        scaleX: 0.02,
        transformOrigin: "50% 50%",
        opacity: 0.7,
        duration: 0.45,
        ease: "power2.inOut",
      },
      0.05
    );

    // 4. Central vertical spine ignites and shoots down rapidly into bottom boundary
    exitTl.fromTo(
      ".morphic-central-spine",
      { scaleY: 0, opacity: 0 },
      {
        scaleY: 1,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
        transformOrigin: "top center",
      },
      0.05
    );

    // 5. The spine strikes the bottom and immediately erupts horizontally into the horizon divider
    exitTl.fromTo(
      ".morphic-horizon-divider",
      { scaleX: 0, opacity: 0 },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.35,
        ease: "power3.out",
        transformOrigin: "center center",
      },
      0.25
    );
  }, section);

  return () => {
    wipeCtx.revert();
    headerCtx.revert();
    glowCtx.revert();
    storyCtx.revert();
    exitCtx.revert();
  };
}
