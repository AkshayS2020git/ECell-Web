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

  return (
    <>
      <nav>
        <div className="logo nav__logo-container">
          <div className="nav__logo-icon-target" />
          <span className="nav__logo-label">ECELL</span>
        </div>
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
          <div className="menu-icon" onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      <div
        ref={dropdownRef}
        id="chapters-menu"
        className={`chapters-dropdown ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        <a href="#aboutSection" onClick={(e) => { e.preventDefault(); scrollToSection('aboutSection'); }}>
          About — Core Mission
        </a>
        <a
          href="#eventsSection"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('eventsSection');
          }}
          className="dropdown-events-link"
        >
          Events — 3D Virtual Gallery ✦
        </a>
      </div>
    </>
  );
}
