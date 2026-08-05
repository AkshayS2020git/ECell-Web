"use client";

import { useState } from "react";
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

  return (
    <main>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      {!loading && (
        <>
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
        </>
      )}
    </main>
  );
}
