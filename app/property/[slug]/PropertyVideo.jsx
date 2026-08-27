"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./property-detail.module.css";

export default function PropertyVideo({ youtubeId, title }) {
  const [playing, setPlaying] = useState(false);

  if (!youtubeId) return null;

  const thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  return (
    <section className={styles.section}>
      <h2>Property video</h2>
      <div className={styles.videoBox}>
        {playing ? (
          <iframe
            className={styles.videoIframe}
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={`${title} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.videoTrigger}
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
          >
            <Image src={thumbnail} alt="" fill className={styles.videoThumb} sizes="(max-width: 900px) 100vw, 66vw" />
            <span className={styles.videoPlayBtn}>
              <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
                <path fill="currentColor" d="M6 3.5v15l14-7.5-14-7.5Z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
