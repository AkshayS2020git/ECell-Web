import { useEffect, useRef } from "react";
import heroVideo from "../../assets/videos/hero2.mp4";
import { setupHeroAnimations } from "./HeroAnimations";
import "./Hero.css";
import "./HeroLayout.css";
import "./HeroVideo.css";
import "./HeroMarquee.css";
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
            preload="metadata"
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
