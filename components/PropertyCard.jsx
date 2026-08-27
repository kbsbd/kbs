import Image from "next/image";
import Link from "next/link";
import styles from "./PropertyCard.module.css";

/* Exact path from the real theme's assets/img/icon/arrow-right.svg —
   real corner/hover-wrap card buttons use a 22-23px icon */
const ArrowIcon = () => (
  <svg width="22" height="19" viewBox="0 0 16 14" fill="none" aria-hidden="true">
    <path
      d="M7.99997 0.414307C7.99997 1.11051 8.68991 2.15231 9.38737 3.02724C10.2855 4.15371 11.3574 5.13777 12.5873 5.88911C13.5087 6.45171 14.6276 6.99177 15.5264 6.99177M7.99997 13.5855C7.99997 12.8893 8.68991 11.8475 9.38737 10.9726C10.2855 9.84617 11.3574 8.86204 12.5873 8.11071C13.5087 7.54811 14.6276 7.00804 15.5264 7.00804M15.5264 6.99991H0.473572"
      stroke="currentColor"
    />
  </svg>
);

export default function PropertyCard({ property, dark = false }) {
  const href = `/property/${property.slug}`;

  return (
    <div className={`${styles.card} ${dark ? styles.dark : ""}`}>
      <Link href={href} className={styles.overlayLink} aria-label={property.title} />

      <div className={styles.thumb}>
        <Image
          src={property.cover_image_url}
          alt={property.title}
          width={500}
          height={550}
          className={styles.image}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
        />

        {property.badge && <span className={styles.badge}>{property.badge}</span>}

        <span className={styles.cornerBtn} aria-hidden="true">
          <ArrowIcon />
        </span>

        <div className={styles.hoverWrap}>
          <span className={styles.hoverBtn} aria-hidden="true">
            <ArrowIcon />
          </span>

          {property.logo_image_url && (
            <div className={styles.logo}>
              <Image
                src={property.logo_image_url}
                alt={`${property.title} logo`}
                width={60}
                height={60}
              />
            </div>
          )}

          <div className={styles.meta}>
            {property.apartment_size && (
              <span>
                <p>Size</p>
                <strong>{property.apartment_size}</strong>
              </span>
            )}
            {property.bedrooms && (
              <span>
                <p>Bed</p>
                <strong>{property.bedrooms}</strong>
              </span>
            )}
            {property.bathrooms && (
              <span>
                <p>Bath</p>
                <strong>{property.bathrooms}</strong>
              </span>
            )}
            {property.land_area && (
              <span>
                <p>Land</p>
                <strong>{property.land_area}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.details}>
        <p className={styles.location}>{property.location}</p>
        <h3 className={styles.title}>
          <Link href={href}>{property.title}</Link>
        </h3>
      </div>
    </div>
  );
}
