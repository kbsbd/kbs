/**
 * The icon set.
 *
 * Drawn by hand on a single 24 unit grid rather than pulled from a library, so
 * there is no extra dependency and no stray weights: every icon is stroke only,
 * 1.6 wide, round caps and joins, optically balanced at 22 to 24px. They inherit
 * `currentColor`, so colour and hover states come from the button around them.
 *
 * Keep new icons on the same grid and the same stroke, or the row stops looking
 * like one set.
 */

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

function Svg({
  children,
  className = "",
  strokeWidth = 1.6,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Shopping bag rather than a trolley: a trolley reads as a supermarket. */
export const CartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.2 8h13.6l-1.1 11.2a1.8 1.8 0 0 1-1.8 1.6H8.1a1.8 1.8 0 0 1-1.8-1.6z" />
    <path d="M8.8 10.5V6.6a3.2 3.2 0 0 1 6.4 0v3.9" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20.2s-7.4-4.6-7.4-9.6A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.4 2.6c0 5-7.4 9.6-7.4 9.6z" />
  </Svg>
);

export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.4" r="3.6" />
    <path d="M4.8 20.4a7.2 7.2 0 0 1 14.4 0" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7.5h16" />
    <path d="M4 12h16" />
    <path d="M4 16.5h10" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.4 6.4l11.2 11.2" />
    <path d="M17.6 6.4L6.4 17.6" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.1 4.5h-.9A2.7 2.7 0 0 0 4.5 7.4c0 6.7 5.4 12.1 12.1 12.1a2.7 2.7 0 0 0 2.9-2.7v-.9a1.2 1.2 0 0 0-.9-1.2l-3-.8a1.2 1.2 0 0 0-1.3.5l-.7 1.1a9.6 9.6 0 0 1-4.6-4.6l1.1-.7a1.2 1.2 0 0 0 .5-1.3l-.8-3a1.2 1.2 0 0 0-1.2-.9z" />
  </Svg>
);

export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M4.3 9.6h15.4M4.3 14.4h15.4" />
    <path d="M12 4a13 13 0 0 1 0 16a13 13 0 0 1 0-16z" />
  </Svg>
);

export const ArrowIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h13" />
    <path d="M12.6 6.2L18.4 12l-5.8 5.8" />
  </Svg>
);
