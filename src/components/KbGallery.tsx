"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { img } from "@/lib/media";
import Lightbox, { type LightboxItem } from "./Lightbox";

/**
 * The KB Homes image carousel — a full-width horizontal snap track. Each card
 * lifts and its photo zooms on hover, the same feel as the landing-page
 * amenities; clicking one opens the full-screen Lightbox at that image with its
 * caption shown under the photo. Autoplays, pausing on hover, focus, touch, a
 * hidden tab, an open Lightbox, or a reduced-motion preference.
 */
export default function KbGallery({
  items,
  label,
}: {
  items: LightboxItem[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const step = useCallback((dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const by = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    const atStart = el.scrollLeft <= 8;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && atStart) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * by, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (items.length < 2 || paused || open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => step(1), 3800);
    return () => window.clearInterval(id);
  }, [items.length, paused, open, step]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!items.length) return null;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-[clamp(1.25rem,5vw,2.5rem)] py-8 scroll-px-[clamp(1.25rem,5vw,2.5rem)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <figure
            key={i}
            data-card
            className="w-[74%] shrink-0 snap-start sm:w-[44%] lg:w-[30%] xl:w-[25%]"
          >
            <button
              type="button"
              onClick={() => openAt(i)}
              aria-label={it.title ? `Open ${it.title}` : `Open image ${i + 1}`}
              className="group relative block w-full overflow-hidden rounded-2xl bg-[color:var(--panel)] transition duration-500 ease-out will-change-transform hover:z-10 hover:scale-[1.04] hover:shadow-[0_22px_50px_-16px_rgba(7,16,26,.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--clay)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={img(it.image, 1100)}
                  alt={it.title || ""}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.1]"
                />
              </div>
            </button>
            {it.title && (
              <figcaption className="mt-3 px-1 text-sm text-[color:var(--text-secondary)]">
                {it.title}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous"
            className="absolute left-3 top-[42%] z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--panel-edge)] bg-[color:var(--canvas)]/90 text-xl leading-none shadow-md backdrop-blur transition-colors hover:text-[color:var(--accent)] sm:left-6"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next"
            className="absolute right-3 top-[42%] z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--panel-edge)] bg-[color:var(--canvas)]/90 text-xl leading-none shadow-md backdrop-blur transition-colors hover:text-[color:var(--accent)] sm:right-6"
          >
            ›
          </button>
        </>
      )}

      {open && (
        <Lightbox
          items={items}
          index={index}
          onIndex={setIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
