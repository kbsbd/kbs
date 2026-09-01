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

/* `reviews` comes from the section's stored blocks so the quotes are
   editable; ABOUT_REVIEWS remains the fallback. Slider options, autoplay and
   drag behaviour are unchanged. */
export default function AboutReviewSlider({ reviews }) {
  const data = reviews?.length ? reviews : ABOUT_REVIEWS;
  const slider = useRef(null);

  if (data.length === 0) return null;

  return (
    <NativeSlider
      ref={slider}
      id="aboutCustomerReviewSlider"
      options={SLIDER_OPTIONS}
      clickFirstDrag
      className="th-slider landowner-review-slider"
    >
      {data.map((r) => (
        <div className="swiper-slide" key={`${r.name}-${r.desig || r.role || ""}`}>
          <div className="testi-card">
            <div className="testi-grid_review">
              {Array.from({ length: r.stars || 5 }).map((_, i) => (
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
                <span className="testi-card_desig">{r.desig || r.role}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </NativeSlider>
  );
}
