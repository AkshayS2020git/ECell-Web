"use client";

import { useState, useEffect } from "react";
import { gsap, ScrollTrigger } from "@/src/utils/gsapSetup";
import Loader from "@/src/sections/Loader/Loader";
import Nav from "@/src/sections/Nav/Nav";
import Hero from "@/src/sections/Hero/Hero";
import About from "@/src/sections/About/About";
import Story from "@/src/sections/Story/Story";
import Events from "@/src/sections/Events/Events";
import Sponsors from "@/src/sections/Sponsors/Sponsors";
import Speakers from "@/src/sections/Speakers/Speakers";
import WhatsAppCommunity from "@/src/sections/WhatsAppCommunity/WhatsAppCommunity";
import Footer from "@/src/sections/Footer/Footer";
import FloatingLogo from "@/src/components/FloatingLogo/FloatingLogo";
import GameLauncher from "@/src/components/GameLauncher/GameLauncher";
import Team from "@/src/sections/Team/Team";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    // Global cleanup: kill all GSAP/ScrollTrigger instances on page unmount
    // to prevent stale instances accumulating in memory across navigations
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.globalTimeline.clear();
    };
  }, []);

  const handleLoaderComplete = () => {
    setLoading(false);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 50);
    }
  };

  return (
    <main>
      {loading && <Loader onComplete={handleLoaderComplete} />}
      <Nav />
      <FloatingLogo />
      <GameLauncher />
      <Hero />
      <About />
      <Story />
      <Team />
      <Events />
      <Sponsors />
      <Speakers />
      <WhatsAppCommunity />
      <Footer />
    </main>
  );
}
