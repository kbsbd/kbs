"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { img } from "@/lib/media";
import Lightbox, { type LightboxItem } from "./Lightbox";

/**
 * The KB Homes image carousel. A horizontal snap track of cards; each card
 * lifts and its photo zooms on hover, the same feel as the landing-page
 * amenities. Clicking a card opens the full-screen Lightbox at that image,
 * with its caption shown under the photo.
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
  const trackRef = useRef<HTMLDivElement>(null);

  if (!items.length) return null;

  const nudge = (dir: number) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <div className="relative" role="group" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <figure
            key={i}
            className="w-[80%] shrink-0 snap-start sm:w-[47%] lg:w-[32%]"
          >
            <button
              type="button"
              onClick={() => openAt(i)}
              aria-label={it.title ? `Open ${it.title}` : `Open image ${i + 1}`}
              className="group relative block w-full overflow-hidden rounded-2xl bg-[color:var(--panel)] transition duration-500 ease-out will-change-transform hover:z-10 hover:scale-[1.035] hover:shadow-[0_34px_70px_-20px_rgba(7,16,26,.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--clay)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={img(it.image, 1100)}
                  alt={it.title || ""}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.09]"
                />
              </div>
            </button>
            {it.title && (
              <figcaption className="mt-3 text-sm text-[color:var(--text-quiet)]">
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
            onClick={() => nudge(-1)}
            aria-label="Previous"
            className="absolute -left-3 top-[calc(50%-1rem)] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] text-lg leading-none shadow-md transition-colors hover:text-[color:var(--accent)] sm:-left-5"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Next"
            className="absolute -right-3 top-[calc(50%-1rem)] grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] text-lg leading-none shadow-md transition-colors hover:text-[color:var(--accent)] sm:-right-5"
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
