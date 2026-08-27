/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/*
 * .property-card2 — the archive card.
 *
 * THE SOURCE MARKUP IS NOT THE DOM. WordPress emits an outer <a> wrapping the
 * whole card, and that outer <a> also contains three more <a>s (the title link
 * and the Details button). Nested anchors are invalid, so the browser's HTML
 * parser runs the adoption-agency algorithm, which closes the outer anchor at
 * every block boundary and RE-OPENS an empty copy of it inside each new block.
 * What the original page actually renders is:
 *
 *   div.col-md-6.col-xl-4
 *     a                                   <- outer anchor, emptied
 *     div.property-card2
 *       a                                 <- re-opened around the thumb
 *         div.property-card-thumb.img-shine
 *           div.property-card-tag         (only when the property is tagged)
 *           img
 *       div.property-card-details
 *         a                               <- re-opened, empty
 *         div.media-left
 *           a                             <- re-opened, empty
 *           h4.property-card-title
 *             a                           <- re-opened, empty
 *             a  "Amabilia"               <- the real title link
 *           p.property-card-location
 *         div.btn-wrap
 *           a.th-btn.style5.nm-property-btn.th-btn-icon  "Details"
 *
 * React builds the DOM programmatically, so it does NOT un-nest anything —
 * transcribing the source markup literally would leave `.property-card2`
 * inside an anchor and make the whole card inherit the link colour (#1C1C1C)
 * instead of the body colour (#6E7070), and would shift `.media-left` by 71px.
 * This component reproduces the PARSED tree, verified against the original's
 * live DOM.
 *
 * The empty anchors carry no content and no box, but they are real elements
 * the CSS can match and the first-child selectors can count, so they stay.
 */
export default function PropertyCard2({ property }) {
  const href = `/property/${property.slug}`;
  return (
    <div className="col-md-6 col-xl-4">
      <Link href={href}> </Link>
      <div className="property-card2">
        <Link href={href}>
          <div className="property-card-thumb img-shine">
            {property.badge ? (
              <div className="property-card-tag">{property.badge}</div>
            ) : null}
            <img
              width="500"
              height="550"
              src={property.cover_image_url}
              alt={property.title}
            />
          </div>
        </Link>
        <div className="property-card-details">
          <Link href={href}> </Link>
          <div className="media-left">
            <Link href={href}> </Link>
            <h4 className="property-card-title">
              <Link href={href} />
              <Link href={href}>{property.title}</Link>
            </h4>
            <p className="property-card-location">{property.location}</p>
          </div>
          <div className="btn-wrap">
            <Link href={href} className="th-btn style5 nm-property-btn th-btn-icon">
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
