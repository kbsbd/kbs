"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/* Full CRUD for the "Other Initiatives" (SBU) slider on the homepage. */

async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, error: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "You must be signed in." };

  return { supabase, error: null };
}

function revalidateSbu() {
  revalidatePath("/");
  revalidatePath("/admin/sbu");
}

function fieldsFromForm(formData) {
  return {
    name: String(formData.get("name") || "").trim(),
    logo_url: String(formData.get("logo_url") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    url: String(formData.get("url") || "").trim() || null,
    is_active: formData.get("is_active") !== "off",
    sort_order: Number(formData.get("sort_order")) || 0,
  };
}

export async function createSbuUnit(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const fields = fieldsFromForm(formData);
  if (!fields.name) return { ok: false, message: "A name is required." };

  const { error: dbError } = await supabase.from("sbu_units").insert(fields);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateSbu();
  return { ok: true, message: "Added." };
}

export async function updateSbuUnit(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const fields = fieldsFromForm(formData);
  if (!fields.name) return { ok: false, message: "A name is required." };

  const { error: dbError } = await supabase.from("sbu_units").update(fields).eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateSbu();
  return { ok: true, message: "Saved." };
}

export async function deleteSbuUnit(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const { error: dbError } = await supabase.from("sbu_units").delete().eq("id", id);
  if (dbError) return { ok: false, message: dbError.message };

  revalidateSbu();
  return { ok: true, message: "Deleted." };
}

export async function moveSbuUnit(_prevState, formData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const id = String(formData.get("id") || "");
  const direction = String(formData.get("direction") || "up");

  const { data: rows, error: readError } = await supabase
    .from("sbu_units")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (readError) return { ok: false, message: readError.message };

  const index = (rows || []).findIndex((r) => r.id === id);
  if (index === -1) return { ok: false, message: "That unit no longer exists." };

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
    supabase.from("sbu_units").update({ sort_order: neighbourOrder }).eq("id", current.id),
    supabase.from("sbu_units").update({ sort_order: currentOrder }).eq("id", neighbour.id),
  ]);

  if (a.error || b.error) return { ok: false, message: (a.error || b.error).message };

  revalidateSbu();
  return { ok: true, message: "" };
}
