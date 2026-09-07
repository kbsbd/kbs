"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import Link from "next/link";
import { img } from "@/lib/media";
import FancySlider, { type FancySliderHandle } from "@/components/FancySlider";
import SliderArrows from "@/components/SliderArrows";

export type FeaturedSlide = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  href: string;
};

/**
 * The featured-products strip — the shared FancySlider engine (autoplay, loop,
 * swipe). A tap on a card follows its link; a deliberate horizontal drag pages
 * the slider (click-first-drag).
 */
export default function FeaturedCarousel({
  slides,
  heading,
}: {
  slides: FeaturedSlide[];
  heading?: string;
}) {
  const slider = useRef<FancySliderHandle>(null);
  if (slides.length === 0) return null;

  return (
    <section className="mt-12" aria-label={heading || "Featured products"}>
      <div className="mb-5 flex items-end justify-between gap-6">
        {heading && (
          <h2 className="font-display text-[clamp(1.3rem,3vw,1.9rem)]">{heading}</h2>
        )}
        {slides.length > 1 && (
          <SliderArrows
            label="product"
            onPrev={() => slider.current?.slidePrev()}
            onNext={() => slider.current?.slideNext()}
          />
        )}
      </div>

      <FancySlider
        ref={slider}
        ariaLabel={heading || "Featured products"}
        clickFirstDrag
        className="overflow-hidden"
        options={{
          spaceBetween: 16,
          breakpoints: {
            "0": { slidesPerView: 2 },
            "768": { slidesPerView: 3 },
            "1100": { slidesPerView: 4 },
          },
        }}
      >
        {slides.map((s) => (
          <div key={s.id} className="py-2">
            <Link
              href={s.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--panel-edge)] bg-[color-mix(in_srgb,var(--panel)_45%,transparent)] pb-3.5 transition-colors duration-300 hover:border-[color:var(--accent)]"
            >
              <span className="grid aspect-[4/3] place-items-center overflow-hidden bg-[color:var(--panel)]">
                {img(s.image) ? (
                  <img
                    src={img(s.image, 600)}
                    alt={s.title}
                    width={300}
                    height={225}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                ) : (
                  <span className="media-slot-label font-mono-label">{s.title}</span>
                )}
              </span>
              <span className="mt-2 px-3.5 text-sm font-semibold leading-tight">
                {s.title}
              </span>
              {s.subtitle && (
                <span className="mt-1 px-3.5 text-xs text-[color:var(--text-quiet)]">
                  {s.subtitle}
                </span>
              )}
            </Link>
          </div>
        ))}
      </FancySlider>
    </section>
  );
}
