import styles from "./PageBanner.module.css";

export default function PageBanner({ image, title, subtitle, dark = false }) {
  const banner = [styles.banner, dark && styles.dark].filter(Boolean).join(" ");
  return (
    <div className={banner} style={{ backgroundImage: `url('${image}')` }}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}
