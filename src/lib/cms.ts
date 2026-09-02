/**
 * The small page / menu CMS.
 *
 * `cms_pages` holds admin-authored pages served at /{locale}/p/{slug}, built
 * from a list of typed blocks. `cms_menu_items` is the editable nav — when it
 * has rows they replace the seed nav, otherwise the seed nav stands.
 *
 * The bespoke routes (services, kb-homes, clients, contact, shop) are NOT in
 * here — they have hand-built layouts. This is for the extra pages a client
 * adds later: delivery info, warranty, terms, and the like.
 */

import { createServerClient } from "./supabase/server";
import type { Locale } from "@/content/seed";

export type Block =
  | { type: "heading"; text: string; text_bn?: string }
  | { type: "richtext"; text: string; text_bn?: string }
  | { type: "image"; url: string; alt?: string; caption?: string; caption_bn?: string }
  | { type: "button"; label: string; label_bn?: string; href: string };

export type CmsPage = {
  slug: string;
  title: string;
  title_bn: string;
  seoDescription: string;
  blocks: Block[];
};

export type MenuItem = {
  id: string;
  label: string;
  label_bn: string;
  href: string;
  parentId: string | null;
  sort: number;
};

type Row = Record<string, unknown>;

export async function getPage(slug: string): Promise<CmsPage | null> {
  const supabase = createServerClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("cms_pages")
      .select("slug, title, title_bn, seo_description, blocks")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    const p = data as Row;
    return {
      slug: String(p.slug),
      title: String(p.title ?? ""),
      title_bn: String(p.title_bn ?? ""),
      seoDescription: String(p.seo_description ?? ""),
      blocks: (Array.isArray(p.blocks) ? p.blocks : []) as Block[],
    };
  } catch {
    return null;
  }
}

export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("cms_pages").select("slug").eq("status", "published");
    return (data ?? []).map((r) => String(r.slug));
  } catch {
    return [];
  }
}

/** The effective nav. Returns [] when the admin has not built one — the caller
 *  then falls back to the seed nav. */
export async function getMenu(): Promise<MenuItem[]> {
  const supabase = createServerClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("cms_menu_items")
      .select("id, label, label_bn, href, parent_id, sort")
      .eq("visible", true)
      .order("sort", { ascending: true });
    if (error || !data) return [];
    return (data as Row[]).map((m) => ({
      id: String(m.id),
      label: String(m.label ?? ""),
      label_bn: String(m.label_bn ?? ""),
      href: String(m.href ?? ""),
      parentId: m.parent_id ? String(m.parent_id) : null,
      sort: Number(m.sort ?? 0),
    }));
  } catch {
    return [];
  }
}

export const cmsPick = (b: Block, l: Locale, key: "text" | "label" | "caption"): string => {
  const rec = b as Record<string, string | undefined>;
  return (l === "bn" && rec[`${key}_bn`]) || rec[key] || "";
};
