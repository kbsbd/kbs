/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import Fancybox from "./Fancybox";

/*
 * .video-area-6 — the "A Statement of Arrival" band between Featured
 * properties and the testimonials. Markup mirrors the WordPress output:
 *
 *   <div class="video-area-6 overflow-hidden">
 *     <div class="container-fluid p-0">
 *       <div class="row align-items-center">
 *         <div class="col-lg-12">
 *           <div class="video-wrap6">
 *             <img width="1920" height="800" src=".../home-video-thumb.webp" alt="img">
 *             <a href="https://www.youtube.com/watch?v=..."
 *                class="video-btn popup-video justify-content-lg-start justify-content-center">
 *               <span class="play-btn style4"><i class="fa-sharp fa-solid fa-play"></i></span>
 *             </a>
 *           </div>
 *         </div>
 *         <div style="height: 0">
 *           <h2 class="sec-title text-white nm-video-type-text" data-speed="80">…</h2>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Two details that look like mistakes but are not:
 *  - the heading's wrapper is `height: 0`, so the heading contributes no
 *    layout height and `top:-100px` floats it over the bottom of the video;
 *  - `fa-sharp` is a Font Awesome Pro class that never loads on the original
 *    either, so only `fa-solid fa-play` actually renders. Kept for parity.
 */

const THUMB_SRC =
  "/wp-content/themes/bti-new-properties-special/assets/img/demo/home-video-thumb.webp";

export default function StatementOfArrival({ youtubeId, heading }) {
  const headingRef = useRef(null);

  /*
   * Typewriter, ported from main.min.js:
   *   an IntersectionObserver (default options) empties the node, then types
   *   data-text back one character every data-speed ms and unobserves.
   */
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;

    const text = el.textContent.trim();
    const speed = Number(el.dataset.speed) || 80;
    el.dataset.text = text;
    el.textContent = "";

    let timer = null;
    let i = 0;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        const tick = () => {
          if (i >= text.length) return;
          node.textContent += text[i++];
          timer = window.setTimeout(tick, speed);
        };
        tick();
        obs.unobserve(node);
      });
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      // restore the text so a re-mount starts from a complete heading
      el.textContent = text;
    };
  }, [heading]);

  if (!youtubeId) return null;

  return (
    <div className="video-area-6 overflow-hidden">
      {/* main.min.js: Fancybox.bind(".popup-video", {dragToClose: false}) */}
      <Fancybox selector=".popup-video" options={{ dragToClose: false }} />
      <div className="container-fluid p-0">
        <div className="row align-items-center">
          <div className="col-lg-12">
            <div className="video-wrap6">
              <img width="1920" height="800" src={THUMB_SRC} alt="img" />
              <a
                href={`https://www.youtube.com/watch?v=${youtubeId}`}
                className="video-btn popup-video justify-content-lg-start justify-content-center"
              >
                <span className="play-btn style4">
                  <i className="fa-sharp fa-solid fa-play" />
                </span>
              </a>
            </div>
          </div>
          <div style={{ height: 0 }}>
            <h2
              ref={headingRef}
              className="sec-title text-white nm-video-type-text"
              data-speed="80"
            >
              {heading}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
