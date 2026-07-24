import { useEffect, useRef } from "react";
import heroVideo from "../../assets/videos/hero2.mp4";
import { setupHeroAnimations } from "./HeroAnimations";
import "./Hero.css";
import "./HeroLayout.css";
import "./HeroVideo.css";
import "./HeroMarquee.css";
import "./HeroLogo.css";
import "./HeroTypography.css";
import "./HeroResponsive.css";

export default function Hero() {
  const heroRef = useRef(null);
  const stickyRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoRef = useRef(null);
  const headingRef = useRef(null);
  const marqueeRef = useRef(null);
  const labelRef = useRef(null);
  const logoRef = useRef(null);
  const wave1Ref = useRef(null);
  const wave2Ref = useRef(null);
  const wave3Ref = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const scrollHintRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
    return setupHeroAnimations({
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
    });
  }, []);

  return (
    <section ref={heroRef} className="hero">
      <div ref={stickyRef} className="hero__sticky">
        <div ref={marqueeRef} className="hero__marquee-group">
          <div className="hero__marquee-line">
            <span>
              EVERY STARTUP BEGINS WITH CURIOSITY &nbsp;&nbsp;&nbsp; EVERY
              STARTUP BEGINS WITH CURIOSITY &nbsp;&nbsp;&nbsp; EVERY STARTUP
              BEGINS WITH CURIOSITY &nbsp;&nbsp;&nbsp; EVERY STARTUP BEGINS WITH
              CURIOSITY &nbsp;&nbsp;&nbsp;
            </span>
          </div>
          <div className="hero__marquee-line hero__marquee-line--dim hero__marquee-line--reverse">
            <span>
              WE'RE HERE TO HELP YOU TURN THAT CURIOSITY INTO ACTION
              &nbsp;&nbsp;&nbsp; WE'RE HERE TO HELP YOU TURN THAT CURIOSITY INTO
              ACTION &nbsp;&nbsp;&nbsp; WE'RE HERE TO HELP YOU TURN THAT
              CURIOSITY INTO ACTION &nbsp;&nbsp;&nbsp; WE'RE HERE TO HELP YOU
              TURN THAT CURIOSITY INTO ACTION &nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>

        <div ref={labelRef} className="hero__label">
          <span className="hero__label-mark">ECell</span>
          <span className="hero__label-cap">A note from the team</span>
        </div>

        <div ref={videoWrapRef} className="hero__video-wrapper">
          <video
            ref={videoRef}
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={heroVideo}
            onPlay={(e) => {
              e.currentTarget.playbackRate = 0.5;
            }}
            onCanPlay={(e) => {
              e.currentTarget.playbackRate = 0.5;
            }}
            onLoadedData={(e) => {
              e.currentTarget.playbackRate = 0.5;
            }}
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="hero__overlay" />
          <h1 ref={headingRef} className="hero__heading">
            <span className="hero__heading-sub">
              It all starts from an idea
            </span>
            <span className="hero__heading-main">ECell RV University</span>
          </h1>
        </div>

        <svg ref={logoRef} className="hero__logo" viewBox="0 0 300 300">
          <path
            ref={wave1Ref}
            d="M53 45 L118 45 C150.5 45,150.5 21,183 21 L248 21"
          />
          <path
            ref={wave2Ref}
            d="M53 100 L118 100 C150.5 100,150.5 76,183 76 L248 76"
          />
          <path
            ref={wave3Ref}
            d="M53 155 L118 155 C150.5 155,150.5 131,183 131 L248 131"
          />
          <text
            ref={titleRef}
            className="hero__logo-title"
            x="150"
            y="228"
            textAnchor="middle"
          >
            Entrepreneurship Cell
          </text>
          <text
            ref={subtitleRef}
            className="hero__logo-sub"
            x="150"
            y="256"
            textAnchor="middle"
          >
            RV University
          </text>
        </svg>

        <div ref={scrollHintRef} className="hero__scroll-hint">
          <div className="hero__scroll-track">
            <i />
          </div>
          <span>SCROLL</span>
        </div>
      </div>
    </section>
  );
}
