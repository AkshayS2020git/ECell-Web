import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Events.css';

gsap.registerPlugin(ScrollTrigger);

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

export default function Events() {
  const sectionRef = useRef(null);
  const sceneRef = useRef(null);
  const captionRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const items = itemsRef.current.filter(Boolean);
    const section = sectionRef.current;
    const scene = sceneRef.current;
    const caption = captionRef.current;
    if (!section || !scene || !caption || !items.length) return undefined;

    const zSpacing = 1500;

    items.forEach((item, index) => {
      const isRightSide = index % 2 === 0;
      const xOffset = isRightSide ? '35%' : '-35%';
      const zOffset = -(index * zSpacing);

      item.dataset.z = zOffset;
      item.style.transform = `translate3d(${xOffset}, 0px, ${zOffset}px)`;
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      caption.textContent = GALLERY_ITEMS[0].caption;
      return undefined;
    }

    const camera = { z: 0 };
    let activeIndex = -1;
    const updateScene = () => {
      scene.style.transform = `translateZ(${camera.z}px)`;
      let nearest = 0;
      let nearestDistance = Infinity;

      items.forEach((item, index) => {
        const relativeZ = Number(item.dataset.z) + camera.z;
        item.style.opacity = `${Math.max(0, Math.min(1, 1 - Math.abs(relativeZ) / 2800))}`;
        if (relativeZ <= 300 && Math.abs(relativeZ) < nearestDistance) {
          nearest = index;
          nearestDistance = Math.abs(relativeZ);
        }
      });

      if (nearest !== activeIndex) {
        activeIndex = nearest;
        caption.textContent = GALLERY_ITEMS[nearest].caption;
      }
    };

    updateScene();
    const tween = gsap.to(camera, {
      z: (GALLERY_ITEMS.length - 1) * zSpacing + 800,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=450%',
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
      onUpdate: updateScene,
    });

    return () => tween.kill();
  }, []);

  return (
    <section className="events-section" ref={sectionRef} id="eventsSection">
      <div className="events-intro" aria-hidden="true">
        <span>ECELL / EVENTS</span>
        <h2>Moments that move ideas forward</h2>
      </div>
      <div className="events-3d-wrapper">
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
    </section>
  );
}
