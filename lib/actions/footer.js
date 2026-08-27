"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function revalidateFooter() {
  revalidatePath("/");
  revalidatePath("/admin/footer");
}

export async function addFooterLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const label = String(formData.get("label") || "").trim();
  const href = String(formData.get("href") || "").trim();
  if (!label || !href) return { ok: false, message: "Label and link are required." };

  const { error: dbError } = await supabase
    .from("footer_links")
    .insert({ label, href, open_new_tab: href.startsWith("http"), sort_order: 999 });

  if (dbError) return { ok: false, message: dbError.message };
  revalidateFooter();
  return { ok: true, message: "Added." };
}

export async function deleteFooterLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("footer_links").delete().eq("id", id);

  if (dbError) return { ok: false, message: dbError.message };
  revalidateFooter();
  return { ok: true, message: "Removed." };
}

export async function addSocialLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const platform = String(formData.get("platform") || "").trim().toLowerCase();
  const url = String(formData.get("url") || "").trim();
  if (!platform || !url) return { ok: false, message: "Platform and URL are required." };

  const { error: dbError } = await supabase
    .from("social_links")
    .insert({ platform, url, sort_order: 999 });

  if (dbError) return { ok: false, message: dbError.message };
  revalidateFooter();
  return { ok: true, message: "Added." };
}

export async function deleteSocialLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("social_links").delete().eq("id", id);

  if (dbError) return { ok: false, message: dbError.message };
  revalidateFooter();
  return { ok: true, message: "Removed." };
}
