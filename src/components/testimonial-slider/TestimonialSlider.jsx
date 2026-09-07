"use client";

/*
 * TestimonialSlider — the "What do our customers say?" card slider, extracted
 * from the bti real-estate theme (section.nm-front-testimonial +
 * .testi-slider9 + .testi-card.style7 + .slider-arrow.style6).
 *
 * Two card shapes, auto-detected per item:
 *   - image card : item has `src` -> full-bleed image, click opens the Lightbox
 *   - quote card : otherwise -> star rating + quote + person
 * Force one with the `variant` prop ("image" | "quote"), or pass `renderItem`
 * to render the card body yourself.
 *
 * Props
 *   items        [{ src, caption?, alt? }]  or  [{ text, name, role?, rating?, avatar? }]
 *   heading      string | ReactNode                     (section title, optional)
 *   eyebrow      string                                 (small label above heading, optional)
 *   perView      { 0:1, 576:1, 768:2, 992:3, 1200:4 }   (breakpoint -> slides in view)
 *   options      partial FancySlider options            (merged over the defaults)
 *   arrows       boolean = true                         (prev / next buttons)
 *   lightbox     boolean = true                         (image cards open a zoom viewer)
 *   bleed        boolean | number = false               (let the last card run off the
 *                                                        right edge; number = px, default -430)
 *   variant      "image" | "quote"                      (force a card shape)
 *   renderItem   (item, index) => ReactNode             (custom card body)
 *   className    string
 *
 * Requires: FancySlider.jsx, FancySlider.css, TestimonialSlider.css.
 * Lightbox needs Lightbox.jsx + Lightbox.css (only when `lightbox` is on).
 */

import { useMemo, useRef, useState } from "react";
import FancySlider from "./FancySlider";
import Lightbox from "./Lightbox";

const DEFAULT_PER_VIEW = { 0: 1, 576: 1, 768: 2, 992: 3, 1200: 4 };

const DEFAULT_OPTIONS = {
  loop: true,
  speed: 1000,
  spaceBetween: 24,
  autoplay: { delay: 6000, disableOnInteraction: false },
};

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        d={dir === "prev" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({ rating = 5 }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="fts__stars" aria-label={`${full} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
          <path
            d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 15l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
            fill={i < full ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ))}
    </span>
  );
}

export default function TestimonialSlider({
  items = [],
  heading,
  eyebrow,
  perView = DEFAULT_PER_VIEW,
  options,
  arrows = true,
  lightbox = true,
  bleed = false,
  variant,
  renderItem,
  className = "",
}) {
  const slider = useRef(null);
  const [openAt, setOpenAt] = useState(null);

  const sliderOptions = useMemo(() => {
    const breakpoints = Object.fromEntries(
      Object.entries(perView).map(([bp, n]) => [bp, { slidesPerView: n }])
    );
    return { ...DEFAULT_OPTIONS, ...options, breakpoints };
  }, [perView, options]);

  const imageItems = useMemo(
    () =>
      items.map((it) => ({
        src: it.src,
        caption: it.caption ?? it.alt ?? "",
      })),
    [items]
  );

  const bleedPx = bleed === true ? -430 : typeof bleed === "number" ? bleed : 0;
  const rootStyle = bleedPx ? { "--fts-bleed": `${bleedPx}px` } : undefined;

  function cardBody(item, i) {
    if (renderItem) return renderItem(item, i);

    const isImage = variant === "image" || (variant !== "quote" && item.src);

    if (isImage) {
      const canZoom = lightbox && item.src;
      const inner = (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.src} alt={item.alt ?? item.caption ?? ""} loading="lazy" />
      );
      return (
        <div className="fts__card fts__card--image">
          {canZoom ? (
            <button
              type="button"
              className="fts__media fts__media--btn"
              onClick={() => setOpenAt(i)}
              aria-label={item.caption ? `Open: ${item.caption}` : "Open image"}
            >
              {inner}
              <span className="fts__zoom" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M11 5v12M5 11h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          ) : (
            <span className="fts__media">{inner}</span>
          )}
        </div>
      );
    }

    return (
      <div className="fts__card fts__card--quote">
        {item.rating !== null && <Stars rating={item.rating ?? 5} />}
        <p className="fts__text">{item.text}</p>
        <div className="fts__person">
          {item.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="fts__avatar" src={item.avatar} alt="" />
          ) : item.name ? (
            <span className="fts__avatar fts__avatar--initial" aria-hidden="true">
              {item.name.charAt(0)}
            </span>
          ) : null}
          <span className="fts__person-meta">
            {item.name && <span className="fts__name">{item.name}</span>}
            {item.role && <span className="fts__role">{item.role}</span>}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className={`fts ${className}`.trim()} style={rootStyle}>
      <div className="fts__inner">
        {(heading || (arrows && items.length > 1)) && (
          <div className="fts__head">
            <div className="fts__head-copy">
              {eyebrow && <span className="fts__eyebrow">{eyebrow}</span>}
              {heading && <h2 className="fts__title">{heading}</h2>}
            </div>

            {arrows && items.length > 1 && (
              <div className="fts__arrows">
                <button
                  type="button"
                  className="fts__arrow"
                  aria-label="Previous"
                  onClick={() => slider.current && slider.current.slidePrev()}
                >
                  <Chevron dir="prev" />
                </button>
                <button
                  type="button"
                  className="fts__arrow"
                  aria-label="Next"
                  onClick={() => slider.current && slider.current.slideNext()}
                >
                  <Chevron dir="next" />
                </button>
              </div>
            )}
          </div>
        )}

        <FancySlider
          ref={slider}
          options={sliderOptions}
          clickFirstDrag
          ariaLabel={typeof heading === "string" ? heading : "Testimonials"}
          className="fts__slider"
        >
          {items.map((item, i) => (
            <div className="fts__slide" key={item.src || item.name || i}>
              {cardBody(item, i)}
            </div>
          ))}
        </FancySlider>
      </div>

      {lightbox && imageItems.some((it) => it.src) && (
        <Lightbox items={imageItems} openAt={openAt} onClose={() => setOpenAt(null)} />
      )}
    </section>
  );
}
