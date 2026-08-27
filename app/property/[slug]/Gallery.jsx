"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./property-detail.module.css";

export default function Gallery({ images, alt }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) return null;

  function show(delta) {
    setActive((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryMain}>
        <Image
          src={images[active]}
          alt={alt}
          fill
          className={styles.galleryMainImage}
          sizes="(max-width: 900px) 100vw, 66vw"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={styles.galleryArrow}
              onClick={() => show(-1)}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.galleryArrow} ${styles.galleryArrowNext}`}
              onClick={() => show(1)}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.galleryStrip}>
          <div className={styles.galleryThumbs}>
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`${styles.galleryThumb} ${i === active ? styles.galleryThumbActive : ""}`}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="150px" style={{ objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
