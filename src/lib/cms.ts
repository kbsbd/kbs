/**
 * The small page / menu CMS.
 *
 * `cms_pages` holds admin-authored pages served at /{locale}/p/{slug}, built
 * from a list of typed blocks. `cms_menu_items` are extra header / footer
 * links the admin adds from published pages.
 *
 * Both reads are wrapped in `unstable_cache` with a tag, so a menu or page
 * change invalidates every route that shows them — statically-generated ones
 * included — via `revalidateTag` in the CMS server actions. Without the tag a
 * fully static page (the landing page) would never pick a menu change up.
 */

import { unstable_cache } from "next/cache";
import { createServerClient } from "./supabase/server";
import type { Locale } from "@/content/seed";

export const CMS_MENU_TAG = "cms-menu";
export const CMS_PAGES_TAG = "cms-pages";

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
  placement: "header" | "footer";
  footerGroup: string;
};

type Row = Record<string, unknown>;

export const getPage = unstable_cache(
  async (slug: string): Promise<CmsPage | null> => {
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
  },
  ["cms-page"],
  { tags: [CMS_PAGES_TAG], revalidate: 3600 }
);

export const getPublishedSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createServerClient();
    if (!supabase) return [];
    try {
      const { data } = await supabase.from("cms_pages").select("slug").eq("status", "published");
      return (data ?? []).map((r) => String(r.slug));
    } catch {
      return [];
    }
  },
  ["cms-published-slugs"],
  { tags: [CMS_PAGES_TAG], revalidate: 3600 }
);

/** Admin-built header / footer links. `revalidateTag(CMS_MENU_TAG)` in the CMS
 *  actions refreshes this everywhere after a change. */
export const getMenu = unstable_cache(
  async (): Promise<MenuItem[]> => {
    const supabase = createServerClient();
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from("cms_menu_items")
        .select("id, label, label_bn, href, parent_id, sort, placement, footer_group")
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
        placement: m.placement === "footer" ? "footer" : "header",
        footerGroup: String(m.footer_group ?? ""),
      }));
    } catch {
      return [];
    }
  },
  ["cms-menu"],
  { tags: [CMS_MENU_TAG], revalidate: 3600 }
);

export const cmsPick = (b: Block, l: Locale, key: "text" | "label" | "caption"): string => {
  const rec = b as Record<string, string | undefined>;
  return (l === "bn" && rec[`${key}_bn`]) || rec[key] || "";
};
