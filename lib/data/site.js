import { createClient } from "@/lib/supabase/server";

// Cloudinary's public demo account hosts a few sample videos meant for
// exactly this kind of placeholder use - no account/setup needed to see a
// real playing video before an admin sets a real one.
export const DEFAULT_SITE_SETTINGS = {
  // Cloudinary's public demo sample, trimmed/compressed via URL transforms
  // (~70KB vs. the untransformed 8MB+ original) so the placeholder hero
  // doesn't tank load performance before an admin swaps in a real video.
  hero_video_url:
    "https://res.cloudinary.com/demo/video/upload/q_auto:low,w_1280,du_8,vc_auto/elephants.mp4",
  hero_poster_url:
    "/wp-content/themes/bti-new-properties-special/assets/img/demo/hero-video-fallback-image-1.webp",
  hero_headline: null,
  hero_subheadline: null,
  arrival_heading: "A Statement of Arrival",
  arrival_youtube_id: "uj2JknvDRY4",
  meta_pixel_id: null,
  ga_measurement_id: null,
};

export async function getSiteSettings() {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_SITE_SETTINGS;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULT_SITE_SETTINGS;

  return { ...DEFAULT_SITE_SETTINGS, ...data };
}
