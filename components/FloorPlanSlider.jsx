/* eslint-disable @next/next/no-img-element */
"use client";

import NativeSlider from "./NativeSlider";
import Fancybox from "./Fancybox";

/* data-slider-options on #propertyFloorPlanSlider */
const OPTIONS = {
  loop: true,
  spaceBetween: 18,
  breakpoints: {
    0: { slidesPerView: 1 },
    576: { slidesPerView: 2 },
    768: { slidesPerView: 3 },
    992: { slidesPerView: 3 },
    1200: { slidesPerView: 4 },
  },
  autoplay: { delay: 6000, disableOnInteraction: false },
  allowTouchMove: false, // #propertyFloorPlanSlider is in the no-drag list
};

export default function FloorPlanSlider({ plans, alt }) {
  return (
    <>
      <NativeSlider
        id="propertyFloorPlanSlider"
        options={OPTIONS}
        className="th-slider property-floorplan-slider"
      >
        {plans.map((plan, i) => (
          <div className="swiper-slide" key={`${plan.full}-${i}`}>
            <a
              className="popup-image property-floorplan-slide"
              href={plan.full}
              data-fancybox="floorplans"
            >
              <img
                width="300"
                height="300"
                src={plan.thumb}
                alt={alt}
                onError={(e) => {
                  if (e.currentTarget.src !== plan.full) e.currentTarget.src = plan.full;
                }}
              />
              <i className="fal fa-plus" />
            </a>
          </div>
        ))}
      </NativeSlider>
      <Fancybox selector=".popup-image" />
    </>
  );
}
