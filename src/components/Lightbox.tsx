"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { img } from "@/lib/media";

export type LightboxItem = { image: string; title?: string; body?: string };

/**
 * A full-screen popup image slider in the Fancybox spirit: dark overlay, the
 * slides laid out on one horizontal track that eases sideways on prev / next
 * (arrows, arrow keys or a swipe), a details panel under the image and a
 * thumbnail strip. Click the image to toggle a 2x zoom, click the backdrop or
 * press Esc to close. Rendered through a portal on document.body so no
 * ancestor's transform or overflow can trap it.
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
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const count = items.length;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const select = useCallback(
    (next: number) => {
      const clamped = Math.min(count - 1, Math.max(0, next));
      if (clamped !== index) {
        onIndex(clamped);
        setZoomed(false);
      }
    },
    [index, count, onIndex]
  );
  const go = useCallback((delta: number) => select(index + delta), [select, index]);

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

  const onDown = (x: number) => {
    if (zoomed) return;
    startX.current = x;
    setDragging(true);
  };
  const onMove = (x: number) => {
    if (startX.current === null) return;
    setDrag(x - startX.current);
  };
  const onUp = () => {
    if (startX.current === null) return;
    const d = drag;
    startX.current = null;
    setDragging(false);
    setDrag(0);
    if (Math.abs(d) > 60) go(d < 0 ? 1 : -1);
  };

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
        className="relative flex-1 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => onDown(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onUp}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${drag}px))`,
            transition: dragging ? "none" : "transform 420ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {items.map((it, i) => {
            const s = img(it.image, 2000);
            return (
              <div
                key={i}
                className="flex h-full w-full shrink-0 items-center justify-center px-4 sm:px-16"
              >
                {s ? (
                  <img
                    src={s}
                    alt={it.title || ""}
                    draggable={false}
                    onClick={() => i === index && setZoomed((z) => !z)}
                    className={`max-h-full max-w-full select-none rounded-lg object-contain transition-transform duration-500 ${
                      i === index && zoomed
                        ? "scale-[1.8] cursor-zoom-out"
                        : "cursor-zoom-in"
                    }`}
                  />
                ) : (
                  <div className="max-h-full max-w-[46rem] overflow-y-auto rounded-2xl bg-white/5 p-8 text-center sm:p-12">
                    {it.title && (
                      <h3 className="font-display text-2xl text-white sm:text-3xl">
                        {it.title}
                      </h3>
                    )}
                    {it.body && (
                      <p className="mx-auto mt-4 max-w-[54ch] leading-relaxed text-white/80">
                        {it.body}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/25 disabled:pointer-events-none disabled:opacity-25 sm:left-6"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={index === count - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/25 disabled:pointer-events-none disabled:opacity-25 sm:right-6"
            >
              ›
            </button>
          </>
        )}
      </div>

      {(cur.title || cur.body) && img(cur.image, 2000) && (
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
              onClick={() => select(i)}
              aria-label={`Image ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-white/10 transition ${
                i === index
                  ? "border-white"
                  : "border-white/25 opacity-50 hover:opacity-90"
              }`}
            >
              {img(it.image, 200) ? (
                <img
                  src={img(it.image, 200)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center px-1 text-center text-[9px] font-medium leading-tight text-white/70">
                  {it.title || i + 1}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
