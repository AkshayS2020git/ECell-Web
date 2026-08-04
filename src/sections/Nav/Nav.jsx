import { useState, useEffect, useRef } from 'react';
import './Nav.css';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        toggleRef.current && !toggleRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const scrollToSection = (id) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
  const handleScroll = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, [isOpen]);

  return (
    <>
      <nav>
        <button
          className="logo nav__logo-container nav__logo-button"
          onClick={() => window.location.reload()}
          type="button"
          aria-label="Reload homepage"
        >
          <div className="nav__logo-icon-target" />
        </button>
        <div className="nav-right">
          <button
            ref={toggleRef}
            className="chapters-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="chapters-menu"
            type="button"
          >
            Chapters
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            className="menu-icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close chapters menu' : 'Open chapters menu'}
            aria-expanded={isOpen}
            aria-controls="chapters-menu"
            type="button"
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div
        ref={dropdownRef}
        id="chapters-menu"
        className={`chapters-dropdown ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        <a
          href="#aboutSection"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('aboutSection');
            document.activeElement?.blur();
            setIsOpen(false);
          }}
          className="dropdown-about-link"
        >
          ABOUT ECELL
        </a>
        <a
          href="#teamSection"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('teamSection');
            document.activeElement?.blur();
            setIsOpen(false);
          }}
          className="dropdown-team-link"
        >
          THE TEAM
        </a>
        <a
          href="#eventsSection"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('eventsSection');
            document.activeElement?.blur();
            setIsOpen(false);
          }}
          className="dropdown-events-link"
        >
          EVENTS
        </a>
        <a
          href="#sponsors"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('sponsors');
            document.activeElement?.blur();
            setIsOpen(false);
          }}
          className="dropdown-sponsors-link"
        >
          PARTNERS & SPONSORS
        </a>
        <a
          href="#speakers"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('speakers');
            document.activeElement?.blur();
            setIsOpen(false);

          }}
          className="dropdown-speakers-link"
        >
          PREVIOUS SPEAKERS
        </a>
        <a
          href="#community"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('community');
            document.activeElement?.blur();
            setIsOpen(false);
          }}
          className="dropdown-footer-link"
        >
          WHATSAPP COMMUNITY
        </a>
        <a
          href="#footer"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('footer');
            document.activeElement?.blur();
            setIsOpen(false);
          }}
          className="dropdown-footer-link"
        >
          FOOTER
        </a>
      </div>
    </>
  );
}
