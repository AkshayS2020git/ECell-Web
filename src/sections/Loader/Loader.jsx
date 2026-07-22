import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Loader.css";

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);

  const squiggleSvgRef = useRef(null);

  const wave1Ref = useRef(null);
  const wave2Ref = useRef(null);
  const wave3Ref = useRef(null);

  const wordmarkTitleRef = useRef(null);
  const wordmarkSubRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const loader = loaderRef.current;

    const squiggleSvg = squiggleSvgRef.current;

    const wave1 = wave1Ref.current;
    const wave2 = wave2Ref.current;
    const wave3 = wave3Ref.current;

    const title = wordmarkTitleRef.current;
    const subtitle = wordmarkSubRef.current;

    // Prepare SVG paths
    [wave1, wave2, wave3].forEach((path) => {
      const length = path.getTotalLength();

      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0.35,
      });
    });

    gsap.set(squiggleSvg, {
      opacity: 0,
      scale: 0.75,
      rotate: -6,
    });

    gsap.set([title, subtitle], {
      opacity: 0,
      y: 8,
    });

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";

        onComplete?.();
      },
    });

    // -----------------------------
    // Logo appears
    // -----------------------------

    tl.to(squiggleSvg, {
      opacity: 1,
      scale: 1,
      rotate: 0,
      duration: 0.55,
      ease: "back.out(2)",
    });

    // -----------------------------
    // Draw first wave
    // -----------------------------

    tl.to(
      wave1,
      {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power2.inOut",
      },
      "-=0.15"
    );

    // -----------------------------
    // Draw second wave
    // -----------------------------

    tl.to(
      wave2,
      {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power2.inOut",
      },
      "-=0.20"
    );

    // -----------------------------
    // Draw third wave
    // -----------------------------

    tl.to(
      wave3,
      {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.45,
        ease: "power2.inOut",
      },
      "-=0.20"
    );

    // -----------------------------
    // Wordmark
    // -----------------------------

    tl.to(
      title,
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
      },
      "-=0.10"
    );

    tl.to(
      subtitle,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
      },
      "-=0.25"
    );

    // -----------------------------
    // Small breathe
    // -----------------------------

    tl.to(squiggleSvg, {
      scale: 1.04,
      duration: 0.35,
      ease: "sine.inOut",
      repeat: 1,
      yoyo: true,
    });

    // -----------------------------
    // Exit
    // -----------------------------

    tl.to(loader, {
      yPercent: -100,
      skewY: -2,
      transformOrigin: "bottom center",
      duration: 0.8,
      ease: "power4.inOut",
    });

    return () => {
      document.body.style.overflow = "";
      tl.kill();
    };
  }, [onComplete]); return (
    <div ref={loaderRef} className="loader-wrap">
      <svg
        ref={squiggleSvgRef}
        className="loader-squiggle"
        viewBox="0 0 300 300"
      >
        <path
          ref={wave1Ref}
          d="M52 96 L117 96 C149.5 96,149.5 72,182 72 L248 72"
        />

        <path
          ref={wave2Ref}
          d="M52 130 L117 130 C149.5 130,149.5 106,182 106 L248 106"
        />

        <path
          ref={wave3Ref}
          d="M52 164 L117 164 C149.5 164,149.5 140,182 140 L248 140"
        />

        <text
          ref={wordmarkTitleRef}
          className="wordmark-title"
          x="150"
          y="216"
          textAnchor="middle"
        >
          Entrepreneurship Cell
        </text>

        <text
          ref={wordmarkSubRef}
          className="wordmark-sub"
          x="150"
          y="240"
          textAnchor="middle"
        >
          RV University
        </text>
      </svg>
    </div>
  );
}
