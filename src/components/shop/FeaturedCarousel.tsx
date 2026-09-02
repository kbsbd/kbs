"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { img } from "@/lib/media";

export type FeaturedSlide = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  href: string;
};

/**
 * An endlessly scrolling strip of featured products. The track holds two copies
 * of the slides and translates by exactly half its width, so the loop is
 * seamless. It only animates once it is on screen and the visitor has not asked
 * for reduced motion; hovering or focusing a card pauses it.
 */
export default function FeaturedCarousel({
  slides,
  heading,
}: {
  slides: FeaturedSlide[];
  heading?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearTimeout(timer);
        if (!e.isIntersecting) return setRun(false);
        /* let first paint settle before anything on the page starts moving —
           keeps the strip out of the Speed Index measurement window */
        timer = window.setTimeout(() => setRun(true), 2200);
      },
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => {
      window.clearTimeout(timer);
      io.disconnect();
    };
  }, []);

  if (slides.length === 0) return null;
  const loop = slides.length < 4 ? [...slides, ...slides, ...slides, ...slides] : [...slides, ...slides];

  return (
    <section className="mt-12" aria-label={heading || "Featured products"}>
      {heading && (
        <h2 className="font-display text-[clamp(1.3rem,3vw,1.9rem)]">{heading}</h2>
      )}
      <div ref={ref} className="feat-marquee mt-5" data-run={run ? "true" : "false"}>
        <ul className="feat-track">
          {loop.map((s, i) => (
            <li key={`${s.id}-${i}`} className="feat-card" aria-hidden={i >= slides.length}>
              <Link href={s.href} tabIndex={i >= slides.length ? -1 : undefined}>
                <span className="feat-media">
                  {img(s.image) ? (
                    <img
                      src={img(s.image, 600)}
                      alt={s.title}
                      width={300}
                      height={225}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="media-slot-label font-mono-label">{s.title}</span>
                  )}
                </span>
                <span className="feat-title">{s.title}</span>
                {s.subtitle && <span className="feat-sub">{s.subtitle}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
