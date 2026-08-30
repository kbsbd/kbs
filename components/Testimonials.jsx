/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import NativeSlider from "./NativeSlider";
import Fancybox from "./Fancybox";

/*
 * section.space.overflow-hidden.nm-front-testimonial — the customer-review
 * slider. Markup mirrors the WordPress output:
 *
 *   <section class="space overflow-hidden nm-front-testimonial">
 *     <div class="container">
 *       <div class="row gx-60 gy-60">
 *         <div class="col-xxl-12">
 *           <div class="row justify-content-md-between align-items-center">
 *             <div class="col-xxl-6 col-lg-7"><div class="title-area">
 *               <h2 class="sec-title text-white">What do our customers say?</h2>
 *             </div></div>
 *             <div class="col-auto"><div class="sec-btn"><div class="icon-box">
 *               …two .slider-arrow.style6.default buttons…
 *             </div></div></div>
 *           </div>
 *           <div class="swiper th-slider testi-slider9" id="testiSlider9" …>
 *             <div class="swiper-wrapper nm-popup-parent-container">…8 slides…</div>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </section>
 *
 * The section has NO background of its own — the page is dark because
 * `bg-theme` sits on <body>, which is why the heading carries `text-white`.
 *
 * Each slide is a plain <a class="popup-image"> in one Fancybox gallery
 * (data-fancybox="front-testimonials"), captioned "Customer review". The
 * images are theme assets with differing intrinsic ratios (1386x1080,
 * 800x624, 1000x1000 …) and the card does not constrain them, so cards
 * legitimately differ in height.
 *
 * The {" "} between the two arrow buttons is load-bearing: they are
 * inline-level, and the original markup has a newline between them, so the
 * collapsed whitespace contributes a real ~4.5px gap. JSX strips whitespace
 * between elements on separate lines, so without it the arrow group is
 * ~4.5px narrower than the original.
 */

const ICON = "/wp-content/themes/bti-new-properties-special/assets/img/icon";

/* verbatim from data-slider-options on #testiSlider9 */
const SLIDER_OPTIONS = {
  loop: true,
  speed: 1000,
  autoplay: { delay: 6000, disableOnInteraction: false },
  breakpoints: {
    0: { slidesPerView: 1 },
    576: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    992: { slidesPerView: 3 },
    1200: { slidesPerView: 4 },
  },
};

/* The review images and the heading are admin-managed (testimonials table +
   site_settings.testimonials_heading, migration 0006). They used to be a
   const array of theme asset paths right here.

   Each row carries its own intrinsic width/height: the images have differing
   ratios and the card does not constrain them, so declaring the real size is
   what keeps the slider from reflowing as they load. */
export default function Testimonials({ items = [], heading = "What do our customers say?" }) {
  const slider = useRef(null);

  if (items.length === 0) return null;

  return (
    <section className="space overflow-hidden nm-front-testimonial">
      {/* main.min.js: Fancybox.bind(".popup-image", {groupAll:true, …}) */}
      <Fancybox selector=".popup-image" />
      <div className="container">
        <div className="row gx-60 gy-60">
          <div className="col-xxl-12">
            <div className="row justify-content-md-between align-items-center">
              <div className="col-xxl-6 col-lg-7">
                <div className="title-area">
                  <h2 className="sec-title text-white">{heading}</h2>
                </div>
              </div>
              <div className="col-auto">
                <div className="sec-btn">
                  <div className="icon-box">
                    <button
                      type="button"
                      data-slider-prev="#testiSlider9"
                      className="slider-arrow style6 default slider-prev"
                      onClick={() => slider.current && slider.current.slidePrev()}
                    >
                      <img width="16" height="16" src={`${ICON}/arrow-left.svg`} alt="" />
                    </button>{" "}
                    <button
                      type="button"
                      data-slider-next="#testiSlider9"
                      className="slider-arrow style6 default slider-next"
                      onClick={() => slider.current && slider.current.slideNext()}
                    >
                      <img width="16" height="14" src={`${ICON}/arrow-right.svg`} alt="" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <NativeSlider
              ref={slider}
              id="testiSlider9"
              options={SLIDER_OPTIONS}
              clickFirstDrag
              className="th-slider testi-slider9"
              wrapperClassName="nm-popup-parent-container"
            >
              {items.map((item, index) => {
                const src = item.image_url;
                return (
                  <div className="swiper-slide" key={item.id || `${src}-${index}`}>
                    <div className="testi-card style7 nm-testi-card-home">
                      <a
                        className="popup-image"
                        href={src}
                        data-fancybox="front-testimonials"
                        data-caption={item.caption || "Customer review"}
                      >
                        <img
                          width={item.width || undefined}
                          height={item.height || undefined}
                          src={src}
                          alt={item.alt_text || "Customer review"}
                        />
                      </a>
                    </div>
                  </div>
                );
              })}
            </NativeSlider>
          </div>
        </div>
      </div>
    </section>
  );
}
