"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function linesToArray(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function fieldsFromForm(formData) {
  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();

  return {
    title,
    slug: slugify(slugInput || title),
    category: String(formData.get("category") || "").trim() || null,
    badge: String(formData.get("badge") || "").trim() || null,
    location: String(formData.get("location") || "").trim() || null,
    address: String(formData.get("address") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    cover_image_url: String(formData.get("cover_image_url") || "").trim() || null,
    gallery_urls: linesToArray(formData.get("gallery_urls")),
    floor_plan_urls: linesToArray(formData.get("floor_plan_urls")),
    land_area: String(formData.get("land_area") || "").trim() || null,
    num_floors: String(formData.get("num_floors") || "").trim() || null,
    apartments_per_floor: String(formData.get("apartments_per_floor") || "").trim() || null,
    apartment_size: String(formData.get("apartment_size") || "").trim() || null,
    bedrooms: String(formData.get("bedrooms") || "").trim() || null,
    bathrooms: String(formData.get("bathrooms") || "").trim() || null,
    launch_date: String(formData.get("launch_date") || "").trim() || null,
    completion_date: String(formData.get("completion_date") || "").trim() || null,
    construction_status_url: String(formData.get("construction_status_url") || "").trim() || null,
    brochure_url: String(formData.get("brochure_url") || "").trim() || null,
    youtube_video_id: extractYouTubeId(String(formData.get("youtube_video_id") || "").trim()) || null,
    construction_location: String(formData.get("construction_location") || "").trim() || null,
    construction_completion_date:
      String(formData.get("construction_completion_date") || "").trim() || null,
    construction_status_updated:
      String(formData.get("construction_status_updated") || "").trim() || null,
    construction_progress: String(formData.get("construction_progress") || "").trim() || null,
    property_status: String(formData.get("property_status") || "").trim() || null,
    is_featured: formData.get("is_featured") === "on",
    is_special_offer: formData.get("is_special_offer") === "on",
    sort_order: Number(formData.get("sort_order") || 0) || 0,
  };
}

export async function createProperty(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = fieldsFromForm(formData);
  if (!fields.title || !fields.slug) {
    return { ok: false, message: "Title is required." };
  }

  const { error: dbError } = await supabase.from("properties").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/");
  revalidatePath("/admin/properties");
  redirect("/admin/properties");
}

export async function updateProperty(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = fieldsFromForm(formData);
  if (!fields.title || !fields.slug) {
    return { ok: false, message: "Title is required." };
  }

  const { error: dbError } = await supabase
    .from("properties")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/");
  revalidatePath("/admin/properties");
  revalidatePath(`/property/${fields.slug}`);
  return { ok: true, message: "Saved." };
}

export async function deleteProperty(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("properties").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/");
  revalidatePath("/admin/properties");
  return { ok: true, message: "Deleted." };
}
