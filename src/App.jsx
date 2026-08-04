import { useState } from 'react';
import Loader from './sections/Loader/Loader';
import Nav from './sections/Nav/Nav';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Story from './sections/Story/Story';
import Events from './sections/Events/Events';
import Sponsors from './sections/Sponsors/Sponsors';
import Speakers from './sections/Speakers/Speakers';
import WhatsAppCommunity from './sections/WhatsAppCommunity/WhatsAppCommunity';
import Footer from './sections/Footer/Footer';
import FloatingLogo from './components/FloatingLogo/FloatingLogo';
import GameLauncher from './components/GameLauncher/GameLauncher';
import Team from "./sections/Team/Team";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
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
    </>
  );
}

export default App;
