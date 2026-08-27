/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { SBU_UNITS } from "@/lib/data/sbu";
import NativeSlider from "./NativeSlider";

/*
 * The "SBU" band — a right-aligned outline heading followed by
 * section.project-area-1, a fixed-attachment background photo under a
 * title-coloured 50% overlay, carrying a slider of six business units.
 *
 * Markup mirrors the WordPress output:
 *
 *   <div class="container nm-business-section">
 *     <div class="row g-0"><div class="col-12">
 *       <div class="nm-business-container">
 *         <span class="shadow-title" data-fill-text="Other Initiatives">SBU</span>
 *       </div>
 *     </div></div>
 *   </div>
 *   <section class="project-area-1 overflow-hidden" data-bg-src=… data-opacity="5" data-overlay="title">
 *     <div class="container"><div class="project-wrap1 mt-40">
 *       <div class="row gy-50 justify-content-between align-items-center">
 *         <div class="col-xl-12"><div class="slider-area project-slider-area">
 *           <div class="swiper th-slider project-slider1" id="projectSlider1" …>
 *
 * Things that look wrong but are faithful to the original:
 *
 *  - `data-fill-text="Other Initiatives"` is read by NO css and NO js
 *    anywhere in the theme. The heading renders literally "SBU". The
 *    attribute is kept only so the markup matches.
 *  - The slider options really do say `"576":{"slidesPerView":"0"}`. That
 *    is a bug in the original, but it is the original's behaviour, so it is
 *    reproduced verbatim rather than "corrected" to 1.
 *  - `data-bs-toggle="modal" data-bs-target="#portfolioModal"` points at a
 *    modal that does not exist on this page, so clicking a card image does
 *    nothing. Kept as-is.
 *  - main.min.js rewrites `data-bg-src` into an inline background-image plus
 *    the `.background-image` class, and `data-mask-src` into inline
 *    mask-image plus `.bg-mask`, deleting both attributes. Since there is no
 *    jQuery here, the component renders that end state directly.
 *    `data-overlay` / `data-opacity` are plain CSS attribute selectors, so
 *    those two attributes stay on the element.
 */

const THEME = "/wp-content/themes/bti-new-properties-special/assets/img";
const BG_SRC = `${THEME}/demo/business-logo-bg.webp`;
const MASK_SRC = `${THEME}/shape/project-card1-img-mask.png`;
const ARROW_RIGHT = `${THEME}/icon/arrow-right.svg`;

/* verbatim from data-slider-options on #projectSlider1 */
const SLIDER_OPTIONS = {
  breakpoints: {
    0: { slidesPerView: 1 },
    576: { slidesPerView: "0" },
    768: { slidesPerView: "2" },
    992: { slidesPerView: "3" },
    1200: { slidesPerView: "3" },
  },
  loop: true,
  autoplay: { delay: 6000, disableOnInteraction: false },
};

export default function SbuSection() {
  const slider = useRef(null);

  return (
    <>
      <div className="container nm-business-section">
        <div className="row g-0">
          <div className="col-12">
            <div className="nm-business-container">
              <span className="shadow-title" data-fill-text="Other Initiatives">
                SBU
              </span>
            </div>
          </div>
        </div>
      </div>

      <section
        className="project-area-1 overflow-hidden background-image"
        style={{ backgroundImage: `url(${BG_SRC})` }}
        data-opacity="5"
        data-overlay="title"
      >
        <div className="container">
          <div className="project-wrap1 mt-40">
            <div className="row gy-50 justify-content-between align-items-center">
              <div className="col-xl-12">
                <div className="slider-area project-slider-area">
                  <NativeSlider
                    ref={slider}
                    id="projectSlider1"
                    options={SLIDER_OPTIONS}
                    clickFirstDrag
                    className="th-slider project-slider1"
                    wrapperClassName="pb-2"
                  >
                    {SBU_UNITS.map((unit) => (
                      <div className="swiper-slide" key={unit.name}>
                        <div className="portfolio-card">
                          <div
                            className="portfolio-img img-shine bg-mask"
                            style={{
                              maskImage: `url(${MASK_SRC})`,
                              WebkitMaskImage: `url(${MASK_SRC})`,
                            }}
                            data-bs-toggle="modal"
                            data-bs-target="#portfolioModal"
                          >
                            <img
                              width="500"
                              height="500"
                              src={unit.logo}
                              alt="project image"
                            />
                            <div className="portfolio-card-shape">
                              <p>{unit.description}</p>
                            </div>
                          </div>
                          <div className="portfolio-content">
                            <a href={unit.url} className="icon-btn">
                              <img width="16" height="14" src={ARROW_RIGHT} alt="img" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </NativeSlider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
