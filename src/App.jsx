
import { useState } from 'react';
import Loader from './sections/Loader/Loader';
import Nav from './sections/Nav/Nav';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Story from './sections/Story/Story';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      {!loading && (
        <>
          <Nav />
          <Hero />
          <About />
          <Story />
        </>
      )}
    </>
  );
}

export default App;
