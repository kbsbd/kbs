import { createClient } from "@/lib/supabase/server";

// Cloudinary's public demo account hosts a few sample videos meant for
// exactly this kind of placeholder use - no account/setup needed to see a
// real playing video before an admin sets a real one.
export const DEFAULT_SITE_SETTINGS = {
  // --- hero -----------------------------------------------------------------
  // Cloudinary's public demo sample, trimmed/compressed via URL transforms
  // (~70KB vs. the untransformed 8MB+ original) so the placeholder hero
  // doesn't tank load performance before an admin swaps in a real video.
  hero_video_url:
    "https://res.cloudinary.com/demo/video/upload/q_auto:low,w_1280,du_8,vc_auto/elephants.mp4",
  hero_poster_url:
    "/wp-content/themes/bti-new-properties-special/assets/img/demo/hero-video-fallback-image-1.webp",
  hero_headline: null,
  hero_subheadline: null,

  // --- statement of arrival -------------------------------------------------
  arrival_heading: "A Statement of Arrival",
  arrival_youtube_id: "uj2JknvDRY4",

  // --- integrations ---------------------------------------------------------
  meta_pixel_id: null,
  ga_measurement_id: null,

  // --- brand / identity -----------------------------------------------------
  // These were hardcoded in app/layout.js and components/Header.jsx before
  // 0005; the values here reproduce exactly what those files shipped, so an
  // un-migrated database renders the same site it always did.
  site_name: "KBS",
  site_tagline: "A Leading Real Estate Developer in Bangladesh",
  logo_url: null, // null => the header falls back to the site_name wordmark
  logo_alt: null,
  favicon_url: "/wp-content/uploads/2021/05/cropped-site-icon-788309-102463-32x32.png",
  apple_icon_url: "/wp-content/uploads/2021/05/cropped-site-icon-788309-102463-180x180.png",
  og_image_url: null,

  // --- SEO ------------------------------------------------------------------
  meta_title: null, // null => `${site_name} – ${site_tagline}`
  meta_description:
    "KBS is a leading real estate developer building functional, design-forward homes in Dhaka and Chattogram.",

  // --- contact --------------------------------------------------------------
  contact_phone: "16604",
  contact_phone_alt: "+8809613191919",
  contact_whatsapp: "+8801313401405",
  contact_email: "info@kbs.com",
  contact_address:
    "KBS Celebration Point, Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212",
  map_query: "KBS Celebration Point, Gulshan-2, Dhaka-1212",

  // --- homepage sections ----------------------------------------------------
  // Added in migration 0006. Each of these was a literal inside its component
  // before; the values here are exactly what those components shipped, so an
  // un-migrated database renders the homepage unchanged.
  special_offer_heading: "Special offer",
  special_offer_text: "Explore our ongoing projects across Dhaka and Chattogram.",
  special_offer_cta_label: "View all properties",
  special_offer_cta_href: "/properties?category=special",

  featured_heading: "Featured properties",
  featured_text: null,
  featured_cta_label: "View all properties",
  featured_cta_href: "/properties?category=featured",

  testimonials_heading: "What do our customers say?",

  arrival_thumb_url:
    "/wp-content/themes/bti-new-properties-special/assets/img/demo/home-video-thumb.webp",

  sbu_heading: "SBU",
  sbu_subheading: "Other Initiatives",
  sbu_bg_url:
    "/wp-content/themes/bti-new-properties-special/assets/img/demo/business-logo-bg.webp",

  // --- contact page ----------------------------------------------------------
  contact_heading: "Get in touch",
  contact_form_bg_url:
    "/wp-content/themes/bti-new-properties-special/assets/img/demo/contact-us-form-bg.webp",
  contact_map_logo_url:
    "/wp-content/themes/bti-new-properties-special/assets/img/demo/bti-icon-logo-white.webp",

  // --- footer ---------------------------------------------------------------
  footer_address:
    "KBS Celebration Point, Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212",
  footer_copyright: null, // null => "Copyright © {year} {site_name}, all rights reserved."
  newsletter_heading: "Never miss an update",
};

/**
 * The singleton settings row, merged over the defaults above.
 *
 * The merge drops null/undefined columns so a column that exists in the table
 * but has never been filled in falls back to the bundled default instead of
 * blanking the site. (A deliberate empty string still wins — that's how an
 * admin clears a field.)
 */
export async function getSiteSettings() {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_SITE_SETTINGS;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULT_SITE_SETTINGS;

  const defined = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null && value !== undefined)
  );

  return { ...DEFAULT_SITE_SETTINGS, ...defined };
}

/** The full site title used for <title> and og:title. */
export function resolveMetaTitle(settings) {
  if (settings.meta_title) return settings.meta_title;
  const name = settings.site_name || "KBS";
  return settings.site_tagline ? `${name} – ${settings.site_tagline}` : name;
}

/** "Copyright © 2026 KBS, all rights reserved." unless the admin overrode it. */
export function resolveCopyright(settings, year = new Date().getFullYear()) {
  if (settings.footer_copyright) {
    return settings.footer_copyright.replace(/\{year\}/g, String(year));
  }
  return null; // Footer renders its structured default (with the © icon)
}
