"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateLegalPage(_prevState, formData) {
  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "");

  if (!slug || !title) return { ok: false, message: "Title is required." };

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Supabase isn't configured yet." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "You must be signed in." };

  const { error } = await supabase
    .from("legal_pages")
    .upsert({ slug, title, content, updated_at: new Date().toISOString() });

  if (error) return { ok: false, message: error.message };

  revalidatePath(`/legal/${slug}`);
  revalidatePath("/admin/legal");
  return { ok: true, message: "Saved." };
}
