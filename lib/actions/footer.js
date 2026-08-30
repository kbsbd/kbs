"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/*
 * Footer + social links.
 *
 * Previously this file only supported add and delete, so fixing a typo in a
 * label meant removing the row and retyping it (which also lost its position).
 * Update, reorder and an active toggle are now here too.
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

function revalidateFooter() {
  revalidatePath("/", "layout"); // the footer renders on every page
  revalidatePath("/admin/footer");
}

/** Swap sort_order with the neighbour above/below. Shared by both tables. */
async function move(supabase, table, id, direction) {
  const { data: rows, error } = await supabase
    .from(table)
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (error) return { ok: false, message: error.message };

  const index = (rows || []).findIndex((r) => r.id === id);
  if (index === -1) return { ok: false, message: "That row no longer exists." };

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) return { ok: true, message: "" };

  const current = rows[index];
  const neighbour = rows[targetIndex];
  const currentOrder = current.sort_order;
  const neighbourOrder =
    neighbour.sort_order === currentOrder
      ? currentOrder + (direction === "up" ? -1 : 1)
      : neighbour.sort_order;

  const [a, b] = await Promise.all([
    supabase.from(table).update({ sort_order: neighbourOrder }).eq("id", current.id),
    supabase.from(table).update({ sort_order: currentOrder }).eq("id", neighbour.id),
  ]);

  if (a.error || b.error) return { ok: false, message: (a.error || b.error).message };
  return { ok: true, message: "" };
}

/* ------------------------------------------------------------------ footer */

function footerFieldsFromForm(formData) {
  const href = String(formData.get("href") || "").trim();
  return {
    label: String(formData.get("label") || "").trim(),
    href,
    open_new_tab: formData.get("open_new_tab") === "on",
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function addFooterLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = footerFieldsFromForm(formData);
  if (!fields.label || !fields.href) return { ok: false, message: "Label and link are required." };

  // Preserve the old convenience: a pasted external URL defaults to new-tab
  // unless the admin explicitly ticked the box themselves.
  if (!formData.has("open_new_tab")) {
    fields.open_new_tab = fields.href.startsWith("http");
  }
  if (!formData.get("sort_order")) fields.sort_order = 999;

  const { error: dbError } = await supabase.from("footer_links").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateFooter();
  return { ok: true, message: "Added." };
}

export async function updateFooterLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = footerFieldsFromForm(formData);
  if (!fields.label || !fields.href) return { ok: false, message: "Label and link are required." };

  const { error: dbError } = await supabase.from("footer_links").update(fields).eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateFooter();
  return { ok: true, message: "Saved." };
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

export async function moveFooterLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const result = await move(
    supabase,
    "footer_links",
    String(formData.get("id") || ""),
    String(formData.get("direction") || "up")
  );

  if (result.ok) revalidateFooter();
  return result;
}

/* ------------------------------------------------------------------ social */

function socialFieldsFromForm(formData) {
  return {
    platform: String(formData.get("platform") || "").trim().toLowerCase(),
    url: String(formData.get("url") || "").trim(),
    label: String(formData.get("label") || "").trim() || null,
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function addSocialLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = socialFieldsFromForm(formData);
  if (!fields.platform || !fields.url) {
    return { ok: false, message: "Platform and URL are required." };
  }
  if (!formData.get("sort_order")) fields.sort_order = 999;

  const { error: dbError } = await supabase.from("social_links").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateFooter();
  return { ok: true, message: "Added." };
}

export async function updateSocialLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = socialFieldsFromForm(formData);
  if (!fields.platform || !fields.url) {
    return { ok: false, message: "Platform and URL are required." };
  }

  const { error: dbError } = await supabase.from("social_links").update(fields).eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateFooter();
  return { ok: true, message: "Saved." };
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

export async function moveSocialLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const result = await move(
    supabase,
    "social_links",
    String(formData.get("id") || ""),
    String(formData.get("direction") || "up")
  );

  if (result.ok) revalidateFooter();
  return result;
}
