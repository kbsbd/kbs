/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/*
 * .property-card4.nm-clickable-property-card — the card used by the
 * "Special offer" slider. Markup mirrors the WordPress output exactly:
 * a full-card overlay link, a corner arrow button that slides away on
 * hover, and a hover panel (logo + Size/Bed/Bath/Land) that glides up.
 * All styling lives in app/theme.css under the original class names.
 */
export default function PropertyCard4({ property }) {
  const href = `/property/${property.slug}`;

  const meta = [
    ["Size", property.apartment_size, true],
    ["Bed", property.bedrooms, false],
    ["Bath", property.bathrooms, false],
    ["Land", property.land_area, false],
  ].filter(([, value]) => value);

  return (
    <div className="property-card4 nm-clickable-property-card">
      <Link
        className="nm-property-card-overlay-link"
        href={href}
        aria-label={property.title}
      />

      <div className="property-card-thumb">
        <img
          width="500"
          height="550"
          src={property.cover_image_url}
          alt={property.title}
        />

        <Link href={href} className="th-btn style-white2 th-btn-icon" aria-label={property.title} />

        <div className="property-card-hover-wrap">
          <Link href={href} className="th-btn style4 th-btn-icon" aria-label={property.title} />

          {property.logo_image_url && (
            <div className="property-card-price">
              <img
                width="150"
                height="150"
                src={property.logo_image_url}
                alt={`${property.title} logo`}
              />
            </div>
          )}

          <div className="property-card-meta">
            {meta.map(([label, value, isSize]) => (
              <span
                key={label}
                className={isSize ? "meta-wrap meta-wrap-size" : "meta-wrap"}
              >
                <p className="meta-title">{label}</p>
                <h6 className="meta-content">{value}</h6>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="property-card-details">
        <p className="property-card-location">{property.location}</p>
        <h4 className="box-title">
          <Link href={href}>{property.title}</Link>
        </h4>
      </div>
    </div>
  );
}
