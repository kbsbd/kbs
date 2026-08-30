"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CTA_ICON_KEYS } from "@/lib/cta-defaults";

/* Full CRUD for the floating Call / WhatsApp / Reach-us buttons. */

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function revalidateCta() {
  revalidatePath("/", "layout"); // the stack renders on every page
  revalidatePath("/admin/cta");
}

function fieldsFromForm(formData) {
  const href = String(formData.get("href") || "").trim();
  const icon = String(formData.get("icon") || "phone");
  const accent = String(formData.get("accent_color") || "").trim();

  return {
    label: String(formData.get("label") || "").trim(),
    href,
    icon: CTA_ICON_KEYS.includes(icon) ? icon : "phone",
    // tel: and mailto: hand off to the OS, so they are not "external" in the
    // target="_blank" sense — only real http(s) links are.
    external: formData.get("external") === "on" || /^https?:\/\//.test(href),
    // Guard the colour: it is interpolated into a CSS custom property, so only
    // a plain hex value is accepted.
    accent_color: /^#[0-9a-fA-F]{3,8}$/.test(accent) ? accent : null,
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function createCtaButton(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = fieldsFromForm(formData);
  if (!fields.label || !fields.href) {
    return { ok: false, message: "Label and link are both required." };
  }

  const { error: dbError } = await supabase.from("cta_buttons").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateCta();
  return { ok: true, message: "Added." };
}

export async function updateCtaButton(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = fieldsFromForm(formData);
  if (!fields.label || !fields.href) {
    return { ok: false, message: "Label and link are both required." };
  }

  const { error: dbError } = await supabase.from("cta_buttons").update(fields).eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateCta();
  return { ok: true, message: "Saved." };
}

export async function deleteCtaButton(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("cta_buttons").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateCta();
  return { ok: true, message: "Deleted." };
}
