"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";

async function updateSiteSettings(fields) {
  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...fields, updated_at: new Date().toISOString() });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Saved." };
}

export async function updateHeroSettings(_prevState, formData) {
  return updateSiteSettings({
    hero_video_url: String(formData.get("hero_video_url") || "").trim() || null,
    hero_poster_url: String(formData.get("hero_poster_url") || "").trim() || null,
    hero_headline: String(formData.get("hero_headline") || "").trim() || null,
    hero_subheadline: String(formData.get("hero_subheadline") || "").trim() || null,
  });
}

export async function updateArrivalSettings(_prevState, formData) {
  const rawId = String(formData.get("arrival_youtube_id") || "").trim();
  const youtubeId = extractYouTubeId(rawId);

  return updateSiteSettings({
    arrival_heading: String(formData.get("arrival_heading") || "").trim() || null,
    arrival_youtube_id: youtubeId || null,
  });
}

export async function updateIntegrationSettings(_prevState, formData) {
  return updateSiteSettings({
    meta_pixel_id: String(formData.get("meta_pixel_id") || "").trim() || null,
    ga_measurement_id: String(formData.get("ga_measurement_id") || "").trim() || null,
  });
}
