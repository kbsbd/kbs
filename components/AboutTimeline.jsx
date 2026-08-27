/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TIMELINE } from "@/lib/data/timeline";

/*
 * .nm-timeline — the 40-year interactive timeline. Port of the block in
 * main.min.js that runs when `document.querySelector(".nm-timeline")` exists.
 *
 * The original ships EMPTY containers in the markup:
 *
 *   <div class="nm-timeline">
 *     <div class="nm-timeline__bar">
 *       <button class="nm-timeline__ctl" id="nmPrevBtn" aria-label="Previous">‹</button>
 *       <div class="nm-timeline__rail"><div class="nm-timeline__railInner" id="nmRailInner"></div></div>
 *       <button class="nm-timeline__ctl" id="nmNextBtn" aria-label="Next">›</button>
 *     </div>
 *     <div class="nm-timeline__content"><div class="nm-timeline__panel" id="nmPanel"></div></div>
 *   </div>
 *
 * and the script fills them from a 16-entry array. Behaviour reproduced:
 *
 *   - rail = one .nm-timeline__dateBtn per entry, each holding a
 *     .nm-timeline__dot span then a span with the date
 *   - the active button gets .isActive
 *   - the panel renders .nm-timeline__layout with is-image-left/is-image-right
 *     from the entry's imagePosition, and the media/body order is SWAPPED in
 *     the markup itself (not only by CSS order)
 *   - the link block renders only when link is set and is not "#"
 *   - selecting scrolls the rail so the active button is centred
 *   - prev is disabled at 0, next at the last entry
 */

export default function AboutTimeline() {
  const [index, setIndex] = useState(0);
  const railRef = useRef(null);

  const go = useCallback((i) => {
    setIndex(Math.max(0, Math.min(i, TIMELINE.length - 1)));
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const btn = rail.querySelector(`.nm-timeline__dateBtn[data-index="${index}"]`);
    if (btn) {
      rail.scrollLeft = btn.offsetLeft - rail.clientWidth / 2 + btn.clientWidth / 2;
    }
  }, [index]);

  const entry = TIMELINE[index];
  const imageLeft = entry.imagePosition === "left";
  const hasLink = entry.link && entry.link !== "#";

  const media = entry.image ? (
    <div className="nm-timeline__media">
      <img src={entry.image} alt={entry.title} />
    </div>
  ) : null;

  const body = (
    <div className="nm-timeline__body">
      <h4 className="nm-timeline__title">{entry.title}</h4>
      <div className="nm-timeline__text">{entry.text}</div>
      {hasLink && (
        <div className="nm-timeline__link">
          <a href={entry.link}>{entry.linkLabel || "Learn more"}</a>
        </div>
      )}
    </div>
  );

  return (
    <div className="nm-timeline">
      <div className="nm-timeline__bar">
        <button
          type="button"
          className="nm-timeline__ctl"
          id="nmPrevBtn"
          aria-label="Previous"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          ‹
        </button>
        <div className="nm-timeline__rail">
          <div className="nm-timeline__railInner" id="nmRailInner" ref={railRef}>
            {TIMELINE.map((e, i) => (
              <button
                key={e.date + e.title}
                type="button"
                className={`nm-timeline__dateBtn${i === index ? " isActive" : ""}`}
                data-index={i}
                onClick={() => go(i)}
              >
                <span className="nm-timeline__dot" />
                <span>{e.date}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="nm-timeline__ctl"
          id="nmNextBtn"
          aria-label="Next"
          disabled={index === TIMELINE.length - 1}
          onClick={() => go(index + 1)}
        >
          ›
        </button>
      </div>
      <div className="nm-timeline__content">
        <div className="nm-timeline__panel" id="nmPanel">
          <div
            className={`nm-timeline__layout ${imageLeft ? "is-image-left" : "is-image-right"}`}
          >
            {imageLeft ? (
              <>
                {media}
                {body}
              </>
            ) : (
              <>
                {body}
                {media}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
