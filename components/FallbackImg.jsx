"use client";

/*
 * WordPress generates a -300x300 crop beside every upload, and the original
 * markup points the thumb strip and the address card at it. Properties added
 * through /admin may not have that crop, so this falls back to the full-size
 * image. When the crop exists nothing changes.
 */
export default function FallbackImg({ src, fallback, ...rest }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
      {...rest}
    />
  );
}
