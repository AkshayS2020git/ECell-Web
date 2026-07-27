
import { useState } from 'react';
import Loader from './sections/Loader/Loader';
import Nav from './sections/Nav/Nav';
import Hero from './sections/Hero/Hero';
import About from './sections/About/About';
import Story from './sections/Story/Story';
import Events from './sections/Events/Events';
import PageTransition from './components/PageTransition/PageTransition';

function App() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'events'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetView, setTargetView] = useState('events');

  const handleOpenEvents = () => {
    if (isTransitioning || currentView === 'events') return;
    setTargetView('events');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('events');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    }, 350);
  };

  const handleCloseEvents = () => {
    if (isTransitioning || currentView === 'main') return;
    setTargetView('main');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('main');
      document.body.style.overflow = '';
      setTimeout(() => {
        setIsTransitioning(false);
        window.dispatchEvent(new Event('resize'));
      }, 350);
    }, 350);
  };

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      {!loading && (
        <>
          <PageTransition active={isTransitioning} targetView={targetView} />

          {currentView === 'main' && (
            <div className="main-page-container">
              <Nav onOpenEvents={handleOpenEvents} />
              <Hero />
              <About />
              <Story />
            </div>
          )}

          {currentView === 'events' && (
            <Events onCloseEvents={handleCloseEvents} />
          )}
        </>
      )}
    </>
  );
}

export default App;
