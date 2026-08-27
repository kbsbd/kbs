import Link from "next/link";
import styles from "./ThemeButton.module.css";

/* Exact path from the real theme's assets/img/icon/arrow-right.svg,
   used via .th-btn-icon:after on every real th-btn */
const ArrowIcon = ({ large }) => (
  <svg
    className={`${styles.icon} ${large ? styles.iconLarge : ""}`}
    viewBox="0 0 16 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M7.99997 0.414307C7.99997 1.11051 8.68991 2.15231 9.38737 3.02724C10.2855 4.15371 11.3574 5.13777 12.5873 5.88911C13.5087 6.45171 14.6276 6.99177 15.5264 6.99177M7.99997 13.5855C7.99997 12.8893 8.68991 11.8475 9.38737 10.9726C10.2855 9.84617 11.3574 8.86204 12.5873 8.11071C13.5087 7.54811 14.6276 7.00804 15.5264 7.00804M15.5264 6.99991H0.473572"
      stroke="currentColor"
    />
  </svg>
);

export default function ThemeButton({
  href,
  onClick,
  type = "button",
  variant,
  icon = false,
  iconLarge = false,
  small = false,
  full = false,
  external = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    styles.btn,
    variant === "white" && styles.white,
    variant === "light" && styles.light,
    variant === "outline" && styles.outline,
    small && styles.small,
    full && styles.full,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span>{children}</span>
      {icon && <ArrowIcon large={iconLarge} />}
    </>
  );

  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {content}
    </button>
  );
}
