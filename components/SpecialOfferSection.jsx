/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import Link from "next/link";
import NativeSlider from "./NativeSlider";
import PropertyCard4 from "./PropertyCard4";

const ARROW_LEFT =
  "/wp-content/themes/bti-new-properties-special/assets/img/icon/arrow-left.svg";
const ARROW_RIGHT =
  "/wp-content/themes/bti-new-properties-special/assets/img/icon/arrow-right.svg";

/* data-slider-options on #CriticalPropertySlider in the original markup */
const SLIDER_OPTIONS = {
  loop: true,
  speed: 1000,
  spaceBetween: 24,
  autoplay: { delay: 6000, disableOnInteraction: false },
  breakpoints: {
    0: { slidesPerView: 1, slidesPerGroup: 1 },
    576: { slidesPerView: 2, slidesPerGroup: 2 },
    992: { slidesPerView: 3, slidesPerGroup: 3 },
    1200: { slidesPerView: 3, slidesPerGroup: 3 },
  },
};

/* Heading, blurb and the "view all" button are admin-managed (site_settings,
   migration 0006). The defaults below are what this component used to
   hardcode, so an un-migrated database renders the same band. */
export default function SpecialOfferSection({
  properties,
  heading = "Special offer",
  text = "Explore our ongoing projects across Dhaka and Chattogram.",
  ctaLabel = "View all properties",
  ctaHref = "/properties?category=special",
}) {
  const VIEW_ALL_HREF = ctaHref;
  const slider = useRef(null);

  return (
    <section
      className="space overflow-hidden property-area-5 nm-featured-property-grid-section nm-critical-property-section"
      id="property-sec"
    >
      <div className="container">
        <div className="row justify-content-between align-items-center nm-featured-property-heading-row">
          <div className="col-lg-8 nm-featured-property-heading-copy">
            <div className="title-area">
              <h2 className="sec-title">{heading}</h2>
              {text && <p className="sec-text">{text}</p>}
            </div>
          </div>
          <div className="col-auto nm-featured-property-desktop-btn">
            <div className="sec-btn">
              <Link href={VIEW_ALL_HREF} className="th-btn style4 th-btn-icon">
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="slider-area property-slider2 z-index-common nm-featured-property-slider-area">
          {properties.length === 0 ? (
            <div className="nm-featured-property-empty">
              <p>No properties to show right now.</p>
            </div>
          ) : (
            <>
              <NativeSlider
                ref={slider}
                options={SLIDER_OPTIONS}
                clickFirstDrag
                className="th-slider nm-featured-property-slider"
              >
                {properties.map((property) => (
                  <div className="swiper-slide" key={property.slug}>
                    <PropertyCard4 property={property} />
                  </div>
                ))}
              </NativeSlider>

              <div className="feature-property-slider-control">
                <button
                  type="button"
                  className="slider-arrow style5 slider-prev"
                  aria-label="Previous special offer properties"
                  onClick={() => slider.current && slider.current.slidePrev()}
                >
                  <img width="16" height="16" src={ARROW_LEFT} alt="" />
                </button>
                <button
                  type="button"
                  className="slider-arrow style5 slider-next"
                  aria-label="Next special offer properties"
                  onClick={() => slider.current && slider.current.slideNext()}
                >
                  <img width="16" height="14" src={ARROW_RIGHT} alt="" />
                </button>
              </div>

              <div className="nm-featured-property-mobile-btn">
                <Link href={VIEW_ALL_HREF} className="th-btn style4 th-btn-icon">
                  {ctaLabel}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
