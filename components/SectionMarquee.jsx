import styles from "./SectionMarquee.module.css";

export default function SectionMarquee({ text }) {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.marquee}>
        <div className={styles.track}>
          <span className={styles.item}>{text}</span>
          <span className={styles.item}>{text}</span>
          <span className={styles.item}>{text}</span>
          <span className={styles.item}>{text}</span>
        </div>
      </div>
    </div>
  );
}
