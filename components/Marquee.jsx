"use client";

import { useCallback, useEffect, useRef } from "react";

/*
 * .nm-marquee-section — port of the marquee block in main.min.js:
 *
 *   let els = document.querySelectorAll(
 *     ".nm-marquee-section:not(.nm-home-marquee-original-hidden) .nm-marquee");
 *   function size(wrap){
 *     let track = wrap.querySelector(".nm-marquee-track");
 *     let items = [...wrap.querySelectorAll(".nm-marquee-item")];
 *     if(track && items.length){
 *       let w = wrap.offsetWidth || window.innerWidth, n = 0;
 *       while(track.scrollWidth < 2*w && n < 20){
 *         items.forEach(el => track.appendChild(el.cloneNode(true))); n++;
 *       }
 *       track.classList.add("nm-marquee-css-motion");
 *       track.style.animationDuration = Math.max(track.scrollWidth/2/100, 12) + "s";
 *     }
 *   }
 *   run on rAF, on load, and on resize (debounced 120ms)
 *
 * Two details that matter:
 *  - the selector EXCLUDES `.nm-home-marquee-original-hidden`, so the copy
 *    inside the about container is never cloned or animated (it is
 *    `display:none` anyway). `animate={false}` reproduces that.
 *  - `items` is captured BEFORE the clone loop, so each pass appends copies of
 *    the ORIGINAL items only — not of the growing set.
 *
 * Each item carries `data-text` because the CSS draws the fill via
 * `::after { content: attr(data-text) }` over a stroked, transparent parent.
 */

const CLONE_CAP = 20;

export default function Marquee({ text, className = "", animate = true }) {
  const wrapRef = useRef(null);

  const size = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap || !animate) return;
    const track = wrap.querySelector(".nm-marquee-track");
    if (!track) return;
    const items = Array.from(track.querySelectorAll(".nm-marquee-item"));
    if (!items.length) return;
    const w = wrap.offsetWidth || window.innerWidth;
    let n = 0;
    while (track.scrollWidth < 2 * w && n < CLONE_CAP) {
      items.forEach((el) => track.appendChild(el.cloneNode(true)));
      n++;
    }
    track.classList.add("nm-marquee-css-motion");
    track.style.animationDuration = `${Math.max(track.scrollWidth / 2 / 100, 12)}s`;
  }, [animate]);

  useEffect(() => {
    if (!animate) return undefined;
    const raf = requestAnimationFrame(size);
    window.addEventListener("load", size);
    let timer = null;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(size, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("load", size);
      window.removeEventListener("resize", onResize);
    };
  }, [size, animate]);

  return (
    <div className={`nm-marquee-section nm-marquee-section-alter ${className}`.trim()} ref={wrapRef}>
      <div className="nm-marquee">
        <div className="nm-marquee-track">
          <span className="nm-marquee-item" data-text={text}>
            {text}
          </span>
          <span className="nm-marquee-item" data-text={text}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
