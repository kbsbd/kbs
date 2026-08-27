"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./property-detail.module.css";

export default function FloorPlanGallery({ images, alt }) {
  const [active, setActive] = useState(null);

  if (!images || images.length === 0) return null;

  function show(delta) {
    setActive((i) => (i + delta + images.length) % images.length);
  }

  return (
    <>
      <div className={styles.floorplanGrid}>
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            className={styles.floorplanSlide}
            onClick={() => setActive(i)}
            aria-label={`Open floor plan ${i + 1}`}
          >
            <img src={src} alt={alt} loading="lazy" />
            <span className={styles.floorplanIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            ×
          </button>
          {images.length > 1 && (
            <button
              type="button"
              className={styles.lightboxNav}
              style={{ left: "1rem" }}
              onClick={(e) => {
                e.stopPropagation();
                show(-1);
              }}
              aria-label="Previous floor plan"
            >
              ‹
            </button>
          )}
          <div className={styles.lightboxImageWrap} onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[active]}
              alt={alt}
              fill
              className={styles.lightboxImage}
              sizes="90vw"
            />
          </div>
          {images.length > 1 && (
            <button
              type="button"
              className={styles.lightboxNav}
              style={{ right: "1rem" }}
              onClick={(e) => {
                e.stopPropagation();
                show(1);
              }}
              aria-label="Next floor plan"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
