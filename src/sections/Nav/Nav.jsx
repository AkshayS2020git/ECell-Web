import { useState, useEffect, useRef } from 'react';
import './Nav.css';

export default function Nav({ onOpenEvents }) {
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

  return (
    <>
      <nav>
        <div className="logo">E-CELL</div>
        <div className="nav-right">
          <button
            className="events-nav-btn"
            onClick={() => onOpenEvents && onOpenEvents()}
          >
            Events &or;
          </button>
          <button
            ref={toggleRef}
            className="chapters-toggle"
            onClick={() => setIsOpen(!isOpen)}
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
        className={`chapters-dropdown ${isOpen ? 'open' : ''}`}
      >
        <a href="#aboutSection" onClick={() => setIsOpen(false)}>
          About — Core Mission
        </a>
        <a
          href="#events"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(false);
            if (onOpenEvents) onOpenEvents();
          }}
          className="dropdown-events-link"
        >
          Events — 3D Virtual Gallery ✦
        </a>
      </div>
    </>
  );
}
