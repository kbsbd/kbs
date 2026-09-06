"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { img } from "@/lib/media";

export type LightboxItem = { image: string; title?: string; body?: string };

/**
 * A full-screen popup image slider: dark overlay, one large image, prev / next
 * arrows, keyboard control, a details panel under the image and a thumbnail
 * strip. Click the image to toggle a 2x zoom, click the backdrop or press Esc
 * to close. Rendered through a portal on document.body so no ancestor's
 * transform or overflow can trap it.
 */
export default function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const count = items.length;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const go = useCallback(
    (delta: number) => {
      onIndex(((index + delta) % count + count) % count);
      setZoomed(false);
    },
    [index, count, onIndex]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, onClose]);

  if (!mounted) return null;
  const cur = items[index];
  if (!cur) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-[100] flex flex-col bg-[rgba(6,10,16,0.94)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white/80 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="font-mono-label text-sm">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-10 w-10 place-items-center rounded-full text-2xl leading-none hover:bg-white/10"
        >
          ×
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={cur.image}
          src={img(cur.image, 2000)}
          alt={cur.title || ""}
          onClick={() => setZoomed((z) => !z)}
          className={`max-h-full max-w-full select-none rounded-lg object-contain transition-transform duration-500 ${
            zoomed ? "scale-[1.8] cursor-zoom-out" : "cursor-zoom-in"
          }`}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/25 sm:left-6"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/25 sm:right-6"
            >
              ›
            </button>
          </>
        )}
      </div>

      {(cur.title || cur.body) && (
        <div
          className="mx-auto w-full max-w-[64rem] px-6 pb-5 pt-4 text-center text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {cur.title && (
            <h3 className="font-display text-lg sm:text-xl">{cur.title}</h3>
          )}
          {cur.body && (
            <p className="mx-auto mt-2 max-w-[60ch] text-sm leading-relaxed text-white/75">
              {cur.body}
            </p>
          )}
        </div>
      )}

      {count > 1 && (
        <div
          className="flex justify-center gap-2 overflow-x-auto px-4 pb-5"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onIndex(i);
                setZoomed(false);
              }}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-white/10 transition ${
                i === index
                  ? "border-white"
                  : "border-white/25 opacity-50 hover:opacity-90"
              }`}
            >
              <img
                src={img(it.image, 200)}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
