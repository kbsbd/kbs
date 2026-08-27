import styles from "./Checklist.module.css";

export default function Checklist({ items, light = false }) {
  return (
    <ul className={`${styles.list} ${light ? styles.light : ""}`}>
      {items.map((item) => (
        <li key={item}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M13.7 3.3a1 1 0 0 1 0 1.4l-6.5 6.5a1 1 0 0 1-1.4 0L2.3 7.7a1 1 0 1 1 1.4-1.4L6.5 9.1l5.8-5.8a1 1 0 0 1 1.4 0Z"
            />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
