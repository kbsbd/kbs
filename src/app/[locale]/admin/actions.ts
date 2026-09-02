"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient, getAdminSession } from "@/lib/supabase/auth";
import { setPath } from "@/lib/editable";

/**
 * Every write goes through here, and every one of them re-checks that the
 * caller is an admin. A server action is a public endpoint; trusting the page
 * that rendered the form would be the mistake.
 */

type Result = { ok: true } | { ok: false; error: string };

async function guard() {
  const session = await getAdminSession();
  if (!session) return null;
  const supabase = await createAuthClient();
  return supabase ? { session, supabase } : null;
}

function refresh() {
  /* site.logo / site.favicon / nav / socials live in the shared chrome, so
     revalidate the whole locale tree rather than a fixed page list. */
  for (const l of ["/en", "/bn"]) revalidatePath(l, "layout");
}

/**
 * Saves a batch of edits. Each entry is a dotted path under a top level key,
 * merged into that key's existing override row so two people editing different
 * sections never overwrite each other's work.
 */
export async function saveContent(
  edits: Array<{ root: string; path: string; value: unknown }>
): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  if (!edits.length) return { ok: true };

  const byRoot = new Map<string, Array<{ path: string; value: unknown }>>();
  for (const e of edits) {
    if (!byRoot.has(e.root)) byRoot.set(e.root, []);
    byRoot.get(e.root)!.push({ path: e.path, value: e.value });
  }

  for (const [root, list] of byRoot) {
    const { data: existing } = await ctx.supabase
      .from("site_content")
      .select("value")
      .eq("key", root)
      .maybeSingle();

    const merged = (existing?.value as Record<string, unknown>) ?? {};
    for (const { path, value } of list) setPath(merged, path, value);

    const { error } = await ctx.supabase
      .from("site_content")
      .upsert({ key: root, value: merged, updated_by: ctx.session.userId }, { onConflict: "key" });

    if (error) return { ok: false, error: error.message };
  }

  refresh();
  return { ok: true };
}

export async function setBookingStatus(id: string, status: string): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const allowed = ["new", "contacted", "visit booked", "visited", "closed"];
  if (!allowed.includes(status)) return { ok: false, error: "Unknown status." };

  const { error } = await ctx.supabase.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  revalidatePath("/bn/admin");
  return { ok: true };
}

export async function saveProject(project: {
  id?: string;
  image: string;
  title_en: string;
  title_bn: string;
  location_en: string;
  location_bn: string;
  status_en: string;
  status_bn: string;
  sort: number;
  published: boolean;
}): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };

  const row = { ...project };
  const { error } = project.id
    ? await ctx.supabase.from("projects").update(row).eq("id", project.id)
    : await ctx.supabase.from("projects").insert(row);

  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteProject(id: string): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const { error } = await ctx.supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

/** Internal notes. Stored apart from site_content so they cannot be rendered. */
export async function saveInternalNote(key: string, value: string): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const { error } = await ctx.supabase
    .from("internal_notes")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/en/admin");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createAuthClient();
  await supabase?.auth.signOut();
}
