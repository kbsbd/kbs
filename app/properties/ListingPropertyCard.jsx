import Image from "next/image";
import ThemeButton from "@/components/ThemeButton";
import styles from "./properties.module.css";

export default function ListingPropertyCard({ property }) {
  return (
    <div className={styles.card}>
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
      </div>
      <div className={styles.body}>
        <div>
          <h3>{property.title}</h3>
          <p>{property.location}</p>
        </div>
        <ThemeButton href={`/property/${property.slug}`} variant="light" small icon>
          Details
        </ThemeButton>
      </div>
    </div>
  );
}
