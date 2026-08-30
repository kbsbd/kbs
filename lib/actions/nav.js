"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Full CRUD for the header / drawer navigation. */

const PLACEMENTS = ["primary", "drawer", "both"];

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function revalidateNav() {
  // The header renders on every route, so invalidate the whole tree.
  revalidatePath("/", "layout");
  revalidatePath("/admin/navigation");
}

function fieldsFromForm(formData) {
  const label = String(formData.get("label") || "").trim();
  const href = String(formData.get("href") || "").trim();
  const placement = String(formData.get("placement") || "both");

  return {
    label,
    href,
    // Anything pointing at another origin opens in a new tab and gets the
    // external-link affordance; the checkbox lets an admin force it.
    external: formData.get("external") === "on" || /^https?:\/\//.test(href),
    placement: PLACEMENTS.includes(placement) ? placement : "both",
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function createNavLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = fieldsFromForm(formData);
  if (!fields.label || !fields.href) {
    return { ok: false, message: "Label and link are both required." };
  }

  const { error: dbError } = await supabase.from("nav_links").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateNav();
  return { ok: true, message: "Added." };
}

export async function updateNavLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = fieldsFromForm(formData);
  if (!fields.label || !fields.href) {
    return { ok: false, message: "Label and link are both required." };
  }

  const { error: dbError } = await supabase.from("nav_links").update(fields).eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateNav();
  return { ok: true, message: "Saved." };
}

export async function deleteNavLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("nav_links").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateNav();
  return { ok: true, message: "Deleted." };
}

/**
 * Moves one link up or down by swapping sort_order with its neighbour.
 *
 * Done as a swap rather than a re-number so that a click can't reshuffle rows
 * an admin didn't touch. Two rows sharing a sort_order (possible after manual
 * edits) are handled by falling back to a nudge.
 */
export async function moveNavLink(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "up");

  const { data: rows, error: readError } = await supabase
    .from("nav_links")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (readError) return { ok: false, message: readError.message };

  const index = (rows || []).findIndex((r) => r.id === id);
  if (index === -1) return { ok: false, message: "That link no longer exists." };

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    return { ok: true, message: "" }; // already at the end — nothing to do
  }

  const current = rows[index];
  const neighbour = rows[targetIndex];

  const currentOrder = current.sort_order;
  const neighbourOrder =
    neighbour.sort_order === currentOrder
      ? currentOrder + (direction === "up" ? -1 : 1)
      : neighbour.sort_order;

  const [a, b] = await Promise.all([
    supabase.from("nav_links").update({ sort_order: neighbourOrder }).eq("id", current.id),
    supabase.from("nav_links").update({ sort_order: currentOrder }).eq("id", neighbour.id),
  ]);

  if (a.error || b.error) {
    return { ok: false, message: (a.error || b.error).message };
  }

  revalidateNav();
  return { ok: true, message: "" };
}
