"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/*
 * Global site identity: branding, SEO defaults and contact details.
 *
 * Every field here writes to the singleton site_settings row (id = 1). An
 * empty input stores NULL rather than "", which is what makes the bundled
 * fallback in lib/data/site.js kick back in — clearing a field restores the
 * default instead of blanking the site.
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

async function saveSettings(fields, paths = ["/"]) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const { error: dbError } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...fields, updated_at: new Date().toISOString() });

  if (dbError) return { ok: false, message: dbError.message };

  // The favicon, title and JSON-LD live in the root layout, so every route's
  // cached HTML is stale after a branding change. layout: true does the whole
  // tree in one call rather than listing every page.
  revalidatePath("/", "layout");
  paths.forEach((path) => revalidatePath(path));

  return { ok: true, message: "Saved." };
}

export async function updateBrandingSettings(_prevState, formData) {
  return saveSettings({
    site_name: text(formData, "site_name"),
    site_tagline: text(formData, "site_tagline"),
    logo_url: text(formData, "logo_url"),
    logo_alt: text(formData, "logo_alt"),
    favicon_url: text(formData, "favicon_url"),
    apple_icon_url: text(formData, "apple_icon_url"),
  });
}

export async function updateSeoSettings(_prevState, formData) {
  return saveSettings({
    meta_title: text(formData, "meta_title"),
    meta_description: text(formData, "meta_description"),
    og_image_url: text(formData, "og_image_url"),
  });
}

export async function updateContactSettings(_prevState, formData) {
  return saveSettings(
    {
      contact_phone: text(formData, "contact_phone"),
      contact_phone_alt: text(formData, "contact_phone_alt"),
      contact_whatsapp: text(formData, "contact_whatsapp"),
      contact_email: text(formData, "contact_email"),
      contact_address: text(formData, "contact_address"),
      map_query: text(formData, "map_query"),
    },
    ["/contact"]
  );
}

export async function updateFooterSettings(_prevState, formData) {
  return saveSettings({
    footer_address: text(formData, "footer_address"),
    footer_copyright: text(formData, "footer_copyright"),
    newsletter_heading: text(formData, "newsletter_heading"),
  });
}
