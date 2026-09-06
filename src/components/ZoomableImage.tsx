"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * An image that opens full-size in an overlay when tapped. The card still shows
 * a cropped `object-cover` thumbnail; the overlay shows the whole picture
 * `object-contain` so nothing is cut off.
 */
export default function ZoomableImage({
  src,
  full,
  alt = "",
  className,
  loading = "lazy",
}: {
  src: string;
  /** higher-res source for the overlay; defaults to `src` */
  full?: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group/zoom block h-full w-full cursor-zoom-in"
        aria-label={alt ? `View ${alt} full size` : "View image full size"}
      >
        <img src={src} alt={alt} loading={loading} className={className} />
      </button>

      {open && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(6,10,16,0.92)] p-4 sm:p-8"
        >
          <img
            src={full || src}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white/90 transition-colors hover:bg-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
