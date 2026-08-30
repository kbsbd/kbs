"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/*
 * Copy and artwork for the homepage bands, plus the contact page's artwork.
 *
 * All of it lives on the singleton site_settings row. Empty input stores NULL
 * so the bundled default in lib/data/site.js takes over again — clearing a
 * heading restores it rather than leaving a blank band.
 */

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function text(formData, key) {
  return String(formData.get(key) || "").trim() || null;
}

async function saveSettings(fields, extraPaths = []) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const { error: dbError } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...fields, updated_at: new Date().toISOString() });

  if (dbError) return { ok: false, message: dbError.message };

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  extraPaths.forEach((path) => revalidatePath(path));

  return { ok: true, message: "Saved." };
}

export async function updateSpecialOfferSection(_prevState, formData) {
  return saveSettings({
    special_offer_heading: text(formData, "special_offer_heading"),
    special_offer_text: text(formData, "special_offer_text"),
    special_offer_cta_label: text(formData, "special_offer_cta_label"),
    special_offer_cta_href: text(formData, "special_offer_cta_href"),
  });
}

export async function updateFeaturedSection(_prevState, formData) {
  return saveSettings({
    featured_heading: text(formData, "featured_heading"),
    featured_text: text(formData, "featured_text"),
    featured_cta_label: text(formData, "featured_cta_label"),
    featured_cta_href: text(formData, "featured_cta_href"),
  });
}

export async function updateTestimonialsSection(_prevState, formData) {
  return saveSettings(
    { testimonials_heading: text(formData, "testimonials_heading") },
    ["/admin/testimonials"]
  );
}

export async function updateSbuSection(_prevState, formData) {
  return saveSettings(
    {
      sbu_heading: text(formData, "sbu_heading"),
      sbu_subheading: text(formData, "sbu_subheading"),
      sbu_bg_url: text(formData, "sbu_bg_url"),
    },
    ["/admin/sbu"]
  );
}

export async function updateContactPageSection(_prevState, formData) {
  return saveSettings(
    {
      contact_heading: text(formData, "contact_heading"),
      contact_form_bg_url: text(formData, "contact_form_bg_url"),
      contact_map_logo_url: text(formData, "contact_map_logo_url"),
    },
    ["/contact", "/admin/site"]
  );
}
