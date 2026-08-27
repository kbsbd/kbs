"use client";

import { useEffect, useRef } from "react";
import styles from "./Carousel.module.css";

export default function Carousel({ children, ariaLabel, autoplay }) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  function scrollByAmount(direction) {
    const track = trackRef.current;
    if (!track) return;
    const atEnd =
      direction > 0 && track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const atStart = direction < 0 && track.scrollLeft <= 4;

    if (atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      return;
    }
    const amount = track.clientWidth * 0.9 * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  }

  useEffect(() => {
    if (!autoplay) return;
    const track = trackRef.current;
    if (!track) return;

    const interval = setInterval(() => {
      if (!pausedRef.current) scrollByAmount(1);
    }, autoplay);

    const pause = () => {
      pausedRef.current = true;
    };
    const resume = () => {
      pausedRef.current = false;
    };

    track.addEventListener("pointerenter", pause);
    track.addEventListener("pointerleave", resume);
    track.addEventListener("touchstart", pause, { passive: true });

    return () => {
      clearInterval(interval);
      track.removeEventListener("pointerenter", pause);
      track.removeEventListener("pointerleave", resume);
      track.removeEventListener("touchstart", pause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className={styles.wrap}>
      <div className={styles.track} ref={trackRef} role="group" aria-label={ariaLabel}>
        {children}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => scrollByAmount(-1)}
          aria-label={`Previous ${ariaLabel || "items"}`}
        >
          ‹
        </button>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => scrollByAmount(1)}
          aria-label={`Next ${ariaLabel || "items"}`}
        >
          ›
        </button>
      </div>
    </div>
  );
}
