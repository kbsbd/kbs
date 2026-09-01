"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Full CRUD for the company timeline shown by any page's timeline section. */

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

/* The timeline can appear on more than one page, and there is no cheap way to
   know which — so the whole tree is revalidated rather than guessing. */
function revalidateTimeline() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/timeline");
}

function fieldsFromForm(formData) {
  const position = String(formData.get("image_position") || "left");

  return {
    date_label: String(formData.get("date_label") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    body: String(formData.get("body") || "").trim() || null,
    image_url: String(formData.get("image_url") || "").trim() || null,
    image_position: position === "right" ? "right" : "left",
    link_label: String(formData.get("link_label") || "").trim() || null,
    link_url: String(formData.get("link_url") || "").trim() || null,
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function createTimelineEntry(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = fieldsFromForm(formData);
  if (!fields.date_label || !fields.title) {
    return { ok: false, message: "A date and a heading are both required." };
  }

  const { error: dbError } = await supabase.from("timeline_entries").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateTimeline();
  return { ok: true, message: "Added." };
}

export async function updateTimelineEntry(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = fieldsFromForm(formData);
  if (!fields.date_label || !fields.title) {
    return { ok: false, message: "A date and a heading are both required." };
  }

  const { error: dbError } = await supabase
    .from("timeline_entries")
    .update(fields)
    .eq("id", id);

  if (dbError) return { ok: false, message: dbError.message };

  revalidateTimeline();
  return { ok: true, message: "Saved." };
}

export async function deleteTimelineEntry(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("timeline_entries").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateTimeline();
  return { ok: true, message: "Deleted." };
}

export async function moveTimelineEntry(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "up");

  const { data: rows, error: readError } = await supabase
    .from("timeline_entries")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (readError) return { ok: false, message: readError.message };

  const index = (rows || []).findIndex((r) => r.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= rows.length) {
    return { ok: true, message: "" };
  }

  const current = rows[index];
  const neighbour = rows[targetIndex];
  const currentOrder = current.sort_order;
  const neighbourOrder =
    neighbour.sort_order === currentOrder
      ? currentOrder + (direction === "up" ? -1 : 1)
      : neighbour.sort_order;

  const [a, b] = await Promise.all([
    supabase.from("timeline_entries").update({ sort_order: neighbourOrder }).eq("id", current.id),
    supabase.from("timeline_entries").update({ sort_order: currentOrder }).eq("id", neighbour.id),
  ]);

  if (a.error || b.error) return { ok: false, message: (a.error || b.error).message };

  revalidateTimeline();
  return { ok: true, message: "" };
}
