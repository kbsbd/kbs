"use client";

/*
 * Lightbox — a small, dependency-free replacement for the theme's Fancybox
 * binding (`Fancybox.bind(".popup-image", { groupAll:true, ... })`).
 *
 * Give it the gallery `items` (each { src, caption? }) and control it with
 * `openAt` / `onClose`. It renders a portal-free fixed overlay with:
 *   - backdrop fade-in + image scale-in
 *   - prev / next + a "3 / 8" counter
 *   - ArrowLeft / ArrowRight / Escape keys, click-backdrop to close
 *   - body scroll lock while open
 *
 * Prefer the real Fancybox? See reference/fancybox-swap.md in this skill.
 *
 * Requires Lightbox.css.
 */

import { useCallback, useEffect, useState } from "react";

export default function Lightbox({ items, openAt = null, onClose }) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const open = openAt !== null;
  const count = items.length;

  useEffect(() => {
    if (openAt !== null) {
      setIndex(openAt);
      setMounted(true);
    }
  }, [openAt]);

  const close = useCallback(() => {
    setMounted(false);
    // let the exit transition play before unmounting
    window.setTimeout(() => onClose && onClose(), 180);
  }, [onClose]);

  const go = useCallback(
    (delta) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, go]);

  if (!open) return null;

  const current = items[index] || {};

  return (
    <div
      className={`fslbx${mounted ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={current.caption || "Image viewer"}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button
        type="button"
        className="fslbx__close"
        aria-label="Close"
        onClick={close}
      >
        &times;
      </button>

      {count > 1 && (
        <button
          type="button"
          className="fslbx__nav fslbx__nav--prev"
          aria-label="Previous image"
          onClick={() => go(-1)}
        >
          &#8249;
        </button>
      )}

      <figure className="fslbx__stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.src}
          className="fslbx__img"
          src={current.src}
          alt={current.caption || ""}
        />
        {current.caption && (
          <figcaption className="fslbx__caption">{current.caption}</figcaption>
        )}
      </figure>

      {count > 1 && (
        <button
          type="button"
          className="fslbx__nav fslbx__nav--next"
          aria-label="Next image"
          onClick={() => go(1)}
        >
          &#8250;
        </button>
      )}

      {count > 1 && (
        <div className="fslbx__counter">
          {index + 1} / {count}
        </div>
      )}
    </div>
  );
}
