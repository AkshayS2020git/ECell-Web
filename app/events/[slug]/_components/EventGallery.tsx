"use client";
import React from "react";
import type { EventDetailData } from "@/src/content/events";

interface EventGalleryProps {
  gallery: EventDetailData["gallery"];
}

export default function EventGallery({ gallery }: EventGalleryProps): React.ReactElement {
  return (
    <section className="event-gallery" id="gallery">
      <div className="event-gallery__inner">
        <div className="event-gallery__header">
          <div className="event-gallery__title-wrap">
            <p className="eyebrow">
              <span className="eyebrow__rule" />
              {gallery?.eyebrow || "Captured Moments"}
            </p>
            <h2 className="event-gallery__headline">
              {gallery?.headline || "View Images"}
              {gallery?.accent && (
                <span className="hero__accent">{gallery?.accent}</span>
              )}
            </h2>
            {gallery?.subhead && (
              <p className="event-gallery__subhead">{gallery?.subhead}</p>
            )}
          </div>
        </div>

        {/* Gallery images are coming soon; the button is a placeholder until then */}
        <div className="spiral-gallery-wrapper">
          {/* View Images button at the middle of this section */}
          <div className="spiral-center-action">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="btn btn--solid spiral-view-btn"
              aria-label="View Images Gallery"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  ry="2"
                />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>View Images</span>
              <span className="spiral-view-btn__arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
