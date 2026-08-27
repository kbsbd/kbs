"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

export default function Hero({ videoUrl, posterUrl, headline, subheadline, children }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;

    const markReady = () => setReady(true);
    if (video.readyState >= 2) {
      markReady();
    } else {
      video.addEventListener("loadeddata", markReady, { once: true });
      video.addEventListener("canplay", markReady, { once: true });
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Muted autoplay can still be blocked by some browsers - the poster
        // image stays visible in that case, which is a fine fallback.
      });
    }

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
    };
  }, [videoUrl]);

  return (
    <section className={styles.hero} id="hero">
      <div className={styles.media} aria-hidden="true">
        <div
          className={styles.fallback}
          style={posterUrl ? { backgroundImage: `url('${posterUrl}')` } : undefined}
        />
        {videoUrl && (
          <video
            ref={videoRef}
            className={`${styles.video} ${ready ? styles.videoReady : ""}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={posterUrl}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
        <div className={styles.overlay} />
      </div>

      {(headline || subheadline) && (
        <div className={styles.copy}>
          {headline && <h1>{headline}</h1>}
          {subheadline && <p>{subheadline}</p>}
        </div>
      )}

      <div className={styles.searchDock}>{children}</div>
    </section>
  );
}
