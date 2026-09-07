"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { img } from "@/lib/media";
import FancySlider, { type FancySliderHandle } from "./FancySlider";
import SliderArrows from "./SliderArrows";
import Lightbox, { type LightboxItem } from "./Lightbox";

/**
 * The KB Homes image carousel — the shared FancySlider engine (autoplay, loop,
 * drag/swipe, click-first-drag) with the pill arrows split to the left and
 * right edges. Each card lifts and its photo zooms on hover; a click opens the
 * full-screen Lightbox at that image with its caption under the photo.
 */
export default function KbGallery({
  items,
  label,
}: {
  items: LightboxItem[];
  label: string;
}) {
  const slider = useRef<FancySliderHandle>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  return (
    <div className="mx-auto max-w-[86rem] px-[clamp(1.25rem,5vw,2.5rem)]">
      <div className="relative">
        {items.length > 1 && (
          <SliderArrows
            split
            label="photo"
            onPrev={() => slider.current?.slidePrev()}
            onNext={() => slider.current?.slideNext()}
          />
        )}

        <FancySlider
          ref={slider}
          ariaLabel={label}
          clickFirstDrag
          className="overflow-hidden"
          options={{
            spaceBetween: 24,
            breakpoints: {
              "0": { slidesPerView: 1 },
              "640": { slidesPerView: 2 },
              "1024": { slidesPerView: 3 },
            },
          }}
        >
          {items.map((it, i) => (
            <div key={i} className="py-6">
              <figure className="group">
                <button
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    setOpen(true);
                  }}
                  aria-label={
                    it.title ? `Open ${it.title}` : `Open image ${i + 1}`
                  }
                  className="relative block w-full overflow-hidden rounded-2xl bg-[color:var(--panel)] transition duration-500 ease-out will-change-transform hover:z-10 hover:scale-[1.035] hover:shadow-[0_22px_50px_-16px_rgba(7,16,26,.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--clay)]"
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
            </div>
          ))}
        </FancySlider>
      </div>

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
