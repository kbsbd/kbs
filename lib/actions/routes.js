"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/*
 * Search-engine visibility for the built-in pages.
 *
 * These pages are files in app/, so there is nothing to create or delete here
 * — only a per-route decision about whether Google should index it and whether
 * it belongs in sitemap.xml.
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

export async function updateRouteSetting(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const path = String(formData.get("path") || "").trim();
  if (!path.startsWith("/")) return { ok: false, message: "Invalid path." };

  const fields = {
    path,
    label: String(formData.get("label") || path).trim(),
    noindex: formData.get("noindex") === "on",
    in_sitemap: formData.get("in_sitemap") === "on",
    meta_title: String(formData.get("meta_title") || "").trim() || null,
    meta_description: String(formData.get("meta_description") || "").trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { error: dbError } = await supabase
    .from("route_settings")
    .upsert(fields, { onConflict: "path" });

  if (dbError) return { ok: false, message: dbError.message };

  // The page's own metadata is generated per request from this row, and the
  // sitemap reads it too, so both need clearing.
  revalidatePath(path);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/built-in");

  return { ok: true, message: "Saved." };
}
