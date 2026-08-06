"use client";
import { useEffect, useRef } from "react";
const heroVideo = "/assets/videos/hero2-optimized.mp4";
const heroMobileVideo = "/assets/videos/hero-mobile.mp4";
const heroPoster = "/assets/videos/hero-poster.jpg";
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
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 0.5;

    let isVisible = false;
    let disposed = false;

    const handleVisibilityChange = () => {
      if (disposed) return;
      if (document.hidden) {
        video.pause();
      } else if (isVisible) {
        video.playbackRate = 0.5;
        video.play().catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (disposed) return;
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (entry.isIntersecting && !document.hidden) {
            video.playbackRate = 0.5;
            video.play().catch(() => {});
          } else {
            // Pause stops the decoder from accumulating frames in memory
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const cleanupAnimations = setupHeroAnimations({
      heroRef,
      videoRef,
      videoWrapRef,
      headingRef,
      marqueeRef,
      labelRef,
      scrollHintRef,
    });

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cleanupAnimations?.();
      video.pause();
    };
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
              WE&apos;RE HERE TO HELP YOU TURN THAT CURIOSITY INTO ACTION
              &nbsp;&nbsp;&nbsp; WE&apos;RE HERE TO HELP YOU TURN THAT CURIOSITY INTO
              ACTION &nbsp;&nbsp;&nbsp; WE&apos;RE HERE TO HELP YOU TURN THAT
              CURIOSITY INTO ACTION &nbsp;&nbsp;&nbsp; WE&apos;RE HERE TO HELP YOU
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
            poster={heroPoster}
            preload="metadata"
            suppressHydrationWarning
          >
            <source media="(max-width: 768px)" src={heroMobileVideo} type="video/mp4" />
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
