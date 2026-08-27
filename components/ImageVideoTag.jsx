"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ImageVideoTag.module.css";

function toEmbedId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]{6,})/);
  return match ? match[1] : null;
}

export default function ImageVideoTag({ src, alt, tag, youtubeUrl, width = 640, height = 830 }) {
  const [open, setOpen] = useState(false);
  const videoId = youtubeUrl ? toEmbedId(youtubeUrl) : null;

  return (
    <div className={styles.wrap}>
      <Image src={src} alt={alt} width={width} height={height} className={styles.image} />

      {(tag || videoId) && (
        <div className={styles.tag}>
          {tag && <span className={styles.tagLabel}>{tag}</span>}
          {videoId && (
            <button
              type="button"
              className={styles.playBtn}
              onClick={() => setOpen(true)}
              aria-label="Play video"
            >
              <svg width="16" height="16" viewBox="0 0 22 22" aria-hidden="true">
                <path fill="currentColor" d="M6 3.5v15l14-7.5-14-7.5Z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {open && videoId && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
          <div className={styles.lightboxFrame} onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              title={alt}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
