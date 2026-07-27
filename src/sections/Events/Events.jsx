import { useEffect } from 'react';
import './Events.css';

export const GALLERY_ITEMS = [
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

export default function Events3DScene({ wrapperRef, sceneRef, captionRef, itemsRef }) {
  useEffect(() => {
    const items = itemsRef.current.filter(Boolean);
    const zSpacing = 1500;

    items.forEach((item, index) => {
      const isRightSide = index % 2 === 0;
      const xOffset = isRightSide ? '35%' : '-35%';
      const zOffset = -(index * zSpacing);

      item.dataset.z = zOffset;
      item.style.transform = `translate3d(${xOffset}, 0px, ${zOffset}px)`;
    });
  }, [itemsRef]);

  return (
    <div className="events-3d-wrapper" ref={wrapperRef} id="eventsSection">
      <div className="events-caption-container">
        <div className="events-caption-text" ref={captionRef} id="active-caption">
          Scroll Down to Explore
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
