"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import { img } from "@/lib/media";
import FancySlider, { type FancySliderHandle } from "./FancySlider";
import SliderArrows from "./SliderArrows";

type Slide = { id: string; name: string; image: string };

/**
 * Client-projects carousel — one image at a time, cross-fading on the shared
 * FancySlider engine (autoplay, loop, swipe) with the pill arrows.
 */
export default function ClientCarousel({ slides }: { slides: Slide[] }) {
  const slider = useRef<FancySliderHandle>(null);
  if (slides.length === 0) return null;

  return (
    <div>
      {slides.length > 1 && (
        <div className="mb-4 flex justify-end">
          <SliderArrows
            label="project"
            onPrev={() => slider.current?.slidePrev()}
            onNext={() => slider.current?.slideNext()}
          />
        </div>
      )}

      <FancySlider
        ref={slider}
        ariaLabel="Client projects"
        className="overflow-hidden rounded-2xl border border-[color:var(--panel-edge)] bg-[color:var(--panel)]"
        options={{ effect: "fade", speed: 700, autoplay: { delay: 5000 } }}
      >
        {slides.map((s, i) => (
          <figure key={s.id} className="relative">
            <div className="grid aspect-[16/10] w-full place-items-center overflow-hidden bg-[color:var(--panel)] sm:aspect-[16/9]">
              {img(s.image) ? (
                <img
                  src={img(s.image, 1400)}
                  alt={s.name}
                  width={1400}
                  height={788}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ) : (
                <span className="media-slot-label font-mono-label">{s.name || "Project"}</span>
              )}
            </div>
            {s.name && (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4 text-sm font-medium text-white">
                {s.name}
              </figcaption>
            )}
          </figure>
        ))}
      </FancySlider>
    </div>
  );
}
