/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef } from "react";
import NativeSlider from "./NativeSlider";

const ARROW_LEFT = "/wp-content/themes/bti-new-properties-special/assets/img/icon/arrow-left.svg";
const ARROW_RIGHT = "/wp-content/themes/bti-new-properties-special/assets/img/icon/arrow-right.svg";

/* data-slider-options on #propertySlider */
const MAIN_OPTIONS = {
  effect: "fade",
  loop: true,
  autoplay: { delay: 6000, disableOnInteraction: false },
  allowTouchMove: false, // #propertySlider is in main.min.js's no-drag list
};

/* data-slider-options on .property-thumb-slider */
const THUMB_OPTIONS = {
  effect: "slide",
  loop: true,
  breakpoints: {
    0: { slidesPerView: 2 },
    576: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    992: { slidesPerView: 3 },
    1200: { slidesPerView: 4 },
  },
  autoplay: { delay: 6000, disableOnInteraction: false },
  allowTouchMove: false,
};

export default function PropertyGallery({ images, thumbs, alt }) {
  const mainRef = useRef(null);
  const thumbRef = useRef(null);

  /* main.min.js links the two sliders: mark the matching thumb and
     slideTo(i, true) on the thumb slider. Done imperatively, exactly as the
     original does, so it never fights the slider's own slide classes. */
  const markThumb = useCallback((index) => {
    const root = thumbRef.current && thumbRef.current.getRoot();
    if (root) {
      const slides = root.querySelectorAll(":scope > .swiper-wrapper > .swiper-slide");
      slides.forEach((el, i) => el.classList.toggle("swiper-slide-thumb-active", i === index));
    }
    if (thumbRef.current) thumbRef.current.slideTo(index, true);
  }, []);

  useEffect(() => {
    markThumb(0);
  }, [markThumb]);

  const onThumbClick = (index) => {
    if (mainRef.current) mainRef.current.slideTo(index);
    markThumb(index);
  };

  return (
    <div className="slider-area property-slider1">
      <NativeSlider
        id="propertySlider"
        ref={mainRef}
        options={MAIN_OPTIONS}
        className="th-slider mb-4"
        onSlideChange={markThumb}
      >
        {images.map((src, i) => (
          <div className="swiper-slide" key={`${src}-${i}`}>
            <div className="property-slider-img">
              <img src={src} alt={alt} />
            </div>
          </div>
        ))}
      </NativeSlider>

      <NativeSlider
        ref={thumbRef}
        options={THUMB_OPTIONS}
        className="th-slider property-thumb-slider"
      >
        {thumbs.map((thumb, i) => (
          <div
            className="swiper-slide"
            key={`${thumb.src}-${i}`}
            onClick={(e) => {
              e.preventDefault();
              onThumbClick(i);
            }}
          >
            <div className="property-slider-img">
              <img
                width="300"
                height="300"
                src={thumb.src}
                alt={alt}
                onError={(e) => {
                  if (e.currentTarget.src !== thumb.fallback) e.currentTarget.src = thumb.fallback;
                }}
              />
            </div>
          </div>
        ))}
      </NativeSlider>

      <button
        type="button"
        className="slider-arrow style3 slider-prev"
        aria-label="Previous image"
        onClick={() => mainRef.current && mainRef.current.slidePrev()}
      >
        <img width="16" height="16" src={ARROW_LEFT} alt="icon" />
      </button>
      <button
        type="button"
        className="slider-arrow style3 slider-next"
        aria-label="Next image"
        onClick={() => mainRef.current && mainRef.current.slideNext()}
      >
        <img width="16" height="14" src={ARROW_RIGHT} alt="icon" />
      </button>
    </div>
  );
}
