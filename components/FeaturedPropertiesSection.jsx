/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const VIEW_ALL_HREF = "/properties?category=featured";

/*
 * section#featured-property-sec — .nm-featured-property-grid-section plus
 * .nm-featured-no-badge. Markup mirrors the WordPress output: the heading row
 * is REVERSED (button column first, heading column second) and right-aligned,
 * the cards are whole <a> elements with span children, and below 768px the
 * grid collapses to one column behind a fade with a "Show all / Show fewer"
 * toggle.
 *
 * The fold logic is a port of the inline script on the original page:
 *   not mobile        -> drop is-open/is-foldable, hide the toggle
 *   fewer than 4 cards-> drop is-open/is-foldable, hide the toggle
 *   otherwise         -> fold height = (3rd card top - wrap top) + half its
 *                        height, written to --nm-featured-mobile-fold-height
 * recomputed on load, on resize and when the (max-width:767px) query changes.
 */
export default function FeaturedPropertiesSection({ properties }) {
  const wrapRef = useRef(null);
  const toggleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [foldable, setFoldable] = useState(false);

  const setMobileFoldHeight = useCallback(() => {
    const foldWrap = wrapRef.current;
    const toggle = toggleRef.current;
    if (!foldWrap || !toggle) return;

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const cards = foldWrap.querySelectorAll(".nm-featured-property-card");

    if (!mobile) {
      setOpen(false);
      setFoldable(false);
      return;
    }
    if (cards.length < 4) {
      setOpen(false);
      setFoldable(false);
      return;
    }

    const wrapTop = foldWrap.getBoundingClientRect().top;
    const thirdRect = cards[2].getBoundingClientRect();
    const foldHeight = thirdRect.top - wrapTop + thirdRect.height * 0.5;

    foldWrap.style.setProperty(
      "--nm-featured-mobile-fold-height",
      `${Math.ceil(foldHeight)}px`
    );
    setFoldable(true);
  }, []);

  useEffect(() => {
    setMobileFoldHeight();
    window.addEventListener("load", setMobileFoldHeight);
    window.addEventListener("resize", setMobileFoldHeight);
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.addEventListener) mq.addEventListener("change", setMobileFoldHeight);
    else if (mq.addListener) mq.addListener(setMobileFoldHeight);
    return () => {
      window.removeEventListener("load", setMobileFoldHeight);
      window.removeEventListener("resize", setMobileFoldHeight);
      if (mq.removeEventListener) mq.removeEventListener("change", setMobileFoldHeight);
      else if (mq.removeListener) mq.removeListener(setMobileFoldHeight);
    };
  }, [setMobileFoldHeight]);

  return (
    <section
      className="space overflow-hidden property-area-5 nm-featured-property-grid-section nm-featured-no-badge"
      id="featured-property-sec"
    >
      <div className="container">
        <div className="row align-items-center justify-content-between nm-featured-property-heading-row nm-featured-property-heading-row--right">
          <div className="col-auto nm-featured-property-desktop-btn">
            <div className="sec-btn">
              <Link href={VIEW_ALL_HREF} className="th-btn style4 th-btn-icon">
                View all properties
              </Link>
            </div>
          </div>
          <div className="col-lg-8 nm-featured-property-heading-copy">
            <div className="title-area">
              <h2 className="sec-title">Featured properties</h2>
            </div>
          </div>
        </div>

        <div className="nm-featured-property-card-area">
          {properties.length === 0 ? (
            <div className="nm-featured-property-empty">
              <p>No properties to show right now.</p>
            </div>
          ) : (
            <>
              <div
                ref={wrapRef}
                className={`nm-featured-property-card-grid-wrap${
                  foldable ? " is-foldable" : ""
                }${open ? " is-open" : ""}`}
                data-featured-mobile-fold=""
              >
                <div className="nm-featured-property-card-grid">
                  {properties.map((property) => (
                    <Link
                      key={property.slug}
                      className="nm-featured-property-card"
                      href={`/property/${property.slug}`}
                      aria-label={property.title}
                    >
                      <span className="nm-featured-property-card__thumb">
                        <img
                          width="500"
                          height="550"
                          src={property.cover_image_url}
                          alt={property.title}
                        />
                      </span>
                      <span className="nm-featured-property-card__body">
                        <span className="nm-featured-property-card__title">
                          {property.title}
                        </span>
                        {property.location && (
                          <span className="nm-featured-property-card__location">
                            <i className="fa-solid fa-location-dot" />
                            {property.location}
                          </span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <button
                ref={toggleRef}
                className={`nm-featured-property-fold-toggle${
                  foldable ? "" : " is-hidden"
                }${open ? " is-open" : ""}`}
                type="button"
                aria-expanded={open}
                aria-controls="featured-property-sec"
                onClick={() => setOpen((v) => !v)}
              >
                <span className="nm-featured-property-fold-toggle__text">
                  {open ? "Show fewer featured properties" : "Show all featured properties"}
                </span>
                <i className="fa-solid fa-angle-down" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        <div className="nm-featured-property-mobile-btn">
          <Link href={VIEW_ALL_HREF} className="th-btn style4 th-btn-icon">
            View all properties
          </Link>
        </div>
      </div>
    </section>
  );
}
