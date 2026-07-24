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

        <svg ref={logoRef} className="hero__logo" viewBox="0 0 806 920">
          <g transform="translate(0,808) scale(0.1,-0.1)">
            <path
              ref={wave1Ref}
              className="logo-stroke logo-big"
              d="M4280 5974 c-41 -19 -110 -60 -154 -91 -97 -67 -473 -364 -606 -478 -200 -172 -391 -303 -500 -345 l-35 -13 -242 -5 -243 -4 0 -304 0 -305 358 3 357 3 63 26 c135 58 309 185 642 469 347 298 503 412 633 468 l62 27 548 3 547 3 0 289 0 290 -678 0 -678 0 -74 -36z"
            />
            <path
              ref={wave2Ref}
              className="logo-stroke logo-big"
              d="M4740 4821 c-142 -46 -296 -152 -684 -470 -133 -109 -311 -251 -396 -315 l-155 -117 -80 -40 c-44 -21 -104 -44 -134 -49 l-54 -10 -368 0 -369 0 0 -295 0 -295 518 0 517 0 46 14 c147 45 254 121 810 578 227 186 408 317 512 372 l79 41 364 3 364 3 0 299 0 300 -457 -1 -458 0 -55 -18z"
            />
            <path
              ref={wave3Ref}
              className="logo-stroke logo-big"
              d="M5064 3631 c-133 -48 -270 -148 -762 -554 -249 -205 -437 -346 -526 -394 l-71 -38 -600 -5 -600 -5 -3 -297 -2 -298 692 0 693 0 47 15 c142 43 311 156 627 420 452 377 559 458 703 530 l90 45 179 0 179 0 0 300 0 300 -297 0 -298 -1 -51 -18z"
            />
          </g>
          <text
            ref={titleRef}
            className="hero__logo-title"
            x="403"
            y="720"
            textAnchor="middle"
          >
            Entrepreneurship Cell
          </text>
          <text
            ref={subtitleRef}
            className="hero__logo-sub"
            x="403"
            y="770"
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
