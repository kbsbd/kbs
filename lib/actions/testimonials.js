"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Full CRUD for the homepage customer-review slider. */

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function revalidateTestimonials() {
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

function optionalInt(formData, key) {
  const raw = String(formData.get(key) || "").trim();
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}

function fieldsFromForm(formData) {
  return {
    image_url: String(formData.get("image_url") || "").trim(),
    alt_text: String(formData.get("alt_text") || "").trim() || "Customer review",
    caption: String(formData.get("caption") || "").trim() || "Customer review",
    // Declaring the intrinsic size is what stops the slider reflowing as each
    // image loads. Optional, because a pasted URL has no size information.
    width: optionalInt(formData, "width"),
    height: optionalInt(formData, "height"),
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function createTestimonial(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = fieldsFromForm(formData);
  if (!fields.image_url) return { ok: false, message: "An image is required." };

  const { error: dbError } = await supabase.from("testimonials").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateTestimonials();
  return { ok: true, message: "Added." };
}

export async function updateTestimonial(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = fieldsFromForm(formData);
  if (!fields.image_url) return { ok: false, message: "An image is required." };

  const { error: dbError } = await supabase.from("testimonials").update(fields).eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateTestimonials();
  return { ok: true, message: "Saved." };
}

export async function deleteTestimonial(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("testimonials").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateTestimonials();
  return { ok: true, message: "Deleted." };
}

/**
 * Reorder by swapping sort_order with the neighbour, rather than renumbering
 * the whole list — a click should never move rows the admin didn't touch.
 */
export async function moveTestimonial(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "up");

  const { data: rows, error: readError } = await supabase
    .from("testimonials")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (readError) return { ok: false, message: readError.message };

  const index = (rows || []).findIndex((r) => r.id === id);
  if (index === -1) return { ok: false, message: "That review no longer exists." };

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
    supabase.from("testimonials").update({ sort_order: neighbourOrder }).eq("id", current.id),
    supabase.from("testimonials").update({ sort_order: currentOrder }).eq("id", neighbour.id),
  ]);

  if (a.error || b.error) return { ok: false, message: (a.error || b.error).message };

  revalidateTestimonials();
  return { ok: true, message: "" };
}
