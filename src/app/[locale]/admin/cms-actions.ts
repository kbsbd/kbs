"use server";

import { revalidatePath } from "next/cache";
import { createAuthClient, getAdminSession } from "@/lib/supabase/auth";
import type { Block } from "@/lib/cms";

type Result = { ok: true } | { ok: false; error: string };

async function guard() {
  const session = await getAdminSession();
  if (!session) return null;
  const supabase = await createAuthClient();
  return supabase ? { session, supabase } : null;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function refresh(slug?: string) {
  for (const l of ["/en", "/bn"]) {
    if (slug) revalidatePath(`${l}/p/${slug}`);
    revalidatePath(`${l}`, "layout");
    revalidatePath(`${l}/admin`);
  }
}

/* ---------------- pages ---------------- */

export async function savePage(input: {
  id?: string;
  slug: string;
  title: string;
  title_bn: string;
  seo_description: string;
  status: "draft" | "published";
  blocks: Block[];
}): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required." };
  const slug = slugify(input.slug || input.title);
  if (!slug) return { ok: false, error: "Could not build a slug." };

  const row = {
    slug,
    title,
    title_bn: input.title_bn.trim(),
    seo_description: input.seo_description.trim(),
    status: input.status,
    blocks: input.blocks,
  };
  const { error } = input.id
    ? await ctx.supabase.from("cms_pages").update(row).eq("id", input.id)
    : await ctx.supabase.from("cms_pages").insert(row);
  if (error) return { ok: false, error: error.message };
  refresh(slug);
  return { ok: true };
}

export async function deletePage(id: string): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const { error } = await ctx.supabase.from("cms_pages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

/* ---------------- menu ---------------- */

export async function saveMenuItem(input: {
  id?: string;
  label: string;
  label_bn: string;
  href: string;
  sort: number;
  visible: boolean;
}): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const row = {
    label: input.label.trim(),
    label_bn: input.label_bn.trim(),
    href: input.href.trim(),
    sort: input.sort | 0,
    visible: input.visible,
  };
  if (!row.label || !row.href) return { ok: false, error: "Label and link are required." };
  const { error } = input.id
    ? await ctx.supabase.from("cms_menu_items").update(row).eq("id", input.id)
    : await ctx.supabase.from("cms_menu_items").insert(row);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function deleteMenuItem(id: string): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  const { error } = await ctx.supabase.from("cms_menu_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  refresh();
  return { ok: true };
}

export async function reorderMenu(ids: string[]): Promise<Result> {
  const ctx = await guard();
  if (!ctx) return { ok: false, error: "Not signed in as an admin." };
  for (let i = 0; i < ids.length; i++) {
    const { error } = await ctx.supabase.from("cms_menu_items").update({ sort: i }).eq("id", ids[i]);
    if (error) return { ok: false, error: error.message };
  }
  refresh();
  return { ok: true };
}
