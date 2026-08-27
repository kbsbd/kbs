"use client";

import { useRef } from "react";
import NativeSlider from "./NativeSlider";
import { ABOUT_REVIEWS } from "@/lib/data/reviews";

/*
 * #aboutCustomerReviewSlider.swiper.th-slider.landowner-review-slider —
 * the customer-review carousel at the foot of the About page.
 *
 * Options verbatim from the original's data-slider-options:
 *   {"loop":true,"spaceBetween":24,
 *    "breakpoints":{"0":{"slidesPerView":1},"768":{"slidesPerView":2},
 *                   "1200":{"slidesPerView":3}},
 *    "autoplay":{"delay":6000,"disableOnInteraction":false}}
 *
 * There are no prev/next arrows in the markup — autoplay and drag only.
 * Each card is five `fa-solid fa-star` icons, the (already truncated) quote,
 * then a `fa-solid fa-user` avatar with name and project.
 */

const SLIDER_OPTIONS = {
  loop: true,
  spaceBetween: 24,
  breakpoints: {
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1200: { slidesPerView: 3 },
  },
  autoplay: { delay: 6000, disableOnInteraction: false },
};

export default function AboutReviewSlider() {
  const slider = useRef(null);

  return (
    <NativeSlider
      ref={slider}
      id="aboutCustomerReviewSlider"
      options={SLIDER_OPTIONS}
      clickFirstDrag
      className="th-slider landowner-review-slider"
    >
      {ABOUT_REVIEWS.map((r) => (
        <div className="swiper-slide" key={`${r.name}-${r.desig}`}>
          <div className="testi-card">
            <div className="testi-grid_review">
              {Array.from({ length: r.stars }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <i className="fa-solid fa-star" key={i} />
              ))}
            </div>
            <p className="testi-card_text">{r.text}</p>
            <div className="testi-card_profile">
              <div className="avatar">
                <i className="fa-solid fa-user" />
              </div>
              <div className="media-body">
                <h3 className="testi-card_name">{r.name}</h3>
                <span className="testi-card_desig">{r.desig}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </NativeSlider>
  );
}
