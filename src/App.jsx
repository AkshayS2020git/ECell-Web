import { useState } from 'react';
import Loader from './sections/Loader/Loader';
import Nav from './sections/Nav/Nav';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Story from './sections/Story/Story';
import Sponsors from './sections/Sponsors/Sponsors';
import Speakers from './sections/Speakers/Speakers';
import FloatingLogo from './components/FloatingLogo/FloatingLogo';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      {!loading && (
        <>
          <Nav />
          <FloatingLogo />
          <Hero />
          <About />
          <Story />
          <Sponsors />
          <Speakers />
        </>
      )}
    </>
  );
}

export default App;
