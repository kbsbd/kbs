/*
 * Client-safe fallback for the homepage review slider.
 *
 * These are the eight theme images the slider used to hardcode, with the
 * intrinsic width/height the original markup declared. The sizes matter: the
 * card does not constrain the image, so the ratios legitimately differ, and
 * declaring them is what stops the slider reflowing as each one loads.
 *
 * Lives outside lib/data/ because lib/data/testimonials.js imports the
 * Supabase server client, which cannot be pulled into a "use client" module.
 */

const BASE =
  "/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20";

export const DEFAULT_TESTIMONIALS = [
  { n: 1, w: 1386, h: 1080 },
  { n: 4, w: 800, h: 624 },
  { n: 6, w: 1386, h: 1080 },
  { n: 7, w: 800, h: 623 },
  { n: 8, w: 800, h: 623 },
  { n: 9, w: 1000, h: 1000 },
  { n: 10, w: 1000, h: 1000 },
  { n: 11, w: 1000, h: 1000 },
].map(({ n, w, h }, index) => ({
  id: null,
  image_url: `${BASE}(${n}).webp`,
  alt_text: "Customer review",
  caption: "Customer review",
  width: w,
  height: h,
  is_active: true,
  sort_order: (index + 1) * 10,
}));
