import { useEffect, useRef, useState } from 'react';
import './Events.css';

const GALLERY_ITEMS = [
  {
    caption: 'Ideation Workshop - Fall 2025',
    src: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop',
    alt: 'Workshop',
  },
  {
    caption: 'Founders Panel - Winter 2025',
    src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop',
    alt: 'Founders Panel',
  },
  {
    caption: 'Annual Hackathon - Spring 2026',
    src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop',
    alt: 'Hackathon',
  },
  {
    caption: 'Startup Pitch Day - Summer 2026',
    src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=800&auto=format&fit=crop',
    alt: 'Pitch Day',
  },
  {
    caption: 'Networking Mixer - Fall 2026',
    src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    alt: 'Networking',
  },
];

export default function Events({ onCloseEvents }) {
  const sceneRef = useRef(null);
  const captionRef = useRef(null);
  const itemsRef = useRef([]);

  const [activeCaptionText, setActiveCaptionText] = useState('Scroll Down to Explore');

  useEffect(() => {
    const scene = sceneRef.current;
    const items = itemsRef.current.filter(Boolean);
    if (!scene || items.length === 0) return;

    const zSpacing = 1500;
    const maxCameraZ = (items.length - 1) * zSpacing + 800;

    let targetZ = 0;
    let currentZ = 0;
    let animFrameId = null;

    // Position items initially in 3D space
    items.forEach((item, index) => {
      const isRightSide = index % 2 === 0;
      const xOffset = isRightSide ? '35%' : '-35%';
      const zOffset = -(index * zSpacing);

      item.dataset.z = zOffset;
      item.style.transform = `translate3d(${xOffset}, 0px, ${zOffset}px)`;
    });

    // 1. Mouse Wheel
    const handleWheel = (e) => {
      targetZ += e.deltaY * 2.5;
      targetZ = Math.max(0, Math.min(targetZ, maxCameraZ));
    };

    // 2. Touch
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const touchDelta = touchStartY - e.touches[0].clientY;
      targetZ += touchDelta * 5;
      targetZ = Math.max(0, Math.min(targetZ, maxCameraZ));
      touchStartY = e.touches[0].clientY;
    };

    // 3. Keyboard arrow navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        targetZ += 300;
        targetZ = Math.max(0, Math.min(targetZ, maxCameraZ));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        targetZ -= 300;
        targetZ = Math.max(0, Math.min(targetZ, maxCameraZ));
      } else if (e.key === 'Escape') {
        if (onCloseEvents) onCloseEvents();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    let lastCaption = 'Scroll Down to Explore';

    function animate() {
      currentZ += (targetZ - currentZ) * 0.08;
      if (scene) {
        scene.style.transform = `translateZ(${currentZ}px)`;
      }

      let activeIndex = 0;
      let minDistance = Infinity;

      items.forEach((item, index) => {
        const itemZ = parseFloat(item.dataset.z || '0');
        const currentRelZ = itemZ + currentZ;

        if (currentRelZ > 400) {
          item.style.opacity = '0';
        } else {
          let opacity = 1 - Math.abs(currentRelZ) / 3000;
          item.style.opacity = `${Math.max(0.05, Math.min(1, opacity))}`;
        }

        if (currentRelZ <= 300) {
          const distanceToCamera = Math.abs(currentRelZ);
          if (distanceToCamera < minDistance) {
            minDistance = distanceToCamera;
            activeIndex = index;
          }
        }
      });

      const newCaption = items[activeIndex]?.getAttribute('data-caption') || 'Scroll Down to Explore';
      if (lastCaption !== newCaption) {
        lastCaption = newCaption;
        if (captionRef.current) {
          captionRef.current.style.opacity = '0';
          setTimeout(() => {
            if (captionRef.current) {
              setActiveCaptionText(newCaption);
              captionRef.current.style.opacity = '1';
            }
          }, 150);
        }
      }

      animFrameId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [onCloseEvents]);

  return (
    <div className="events-viewport" id="eventsSection">
      <div className="events-bg-layer"></div>

      <header className="events-header">
        <div className="events-logo" onClick={onCloseEvents} title="Return to Main Page">
          E<span>Cell</span>
        </div>
        <div className="events-nav-right">
          <div className="events-label">Events &or;</div>
          <button className="events-back-btn" onClick={onCloseEvents} aria-label="Back to main page">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Main Page</span>
          </button>
          <div className="events-hamburger" onClick={onCloseEvents} title="Close Events View">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>

      <div className="events-caption-container">
        <div className="events-caption-text" ref={captionRef} id="active-caption">
          {activeCaptionText}
        </div>
      </div>

      <div className="events-scene" ref={sceneRef} id="scene">
        {GALLERY_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="events-gallery-item"
            data-caption={item.caption}
            ref={(el) => (itemsRef.current[idx] = el)}
          >
            <img src={item.src} alt={item.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}
