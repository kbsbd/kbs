import { createClient } from "@/lib/supabase/server";
import { PAGE_PRESETS } from "@/lib/page-presets";

/*
 * Admin-built pages, served by app/[slug]/page.js — and, for the three that
 * used to be hand-written React, by their own routes in app/about, app/nrb and
 * app/landowner.
 *
 * Two fallbacks matter here:
 *
 *   - a missing table (pre-migration) or an unreachable Supabase returns an
 *     empty list, so the dynamic route 404s, which is correct for a page that
 *     does not exist yet;
 *   - a missing ROW for about/nrb/landowner falls back to the bundled preset
 *     in lib/page-presets.js. That is what stops those three pages going dark
 *     if the code is deployed before migration 0008 is applied.
 */

/** Turns a bundled preset into the shape a page row + sections would have. */
function presetAsPage(slug) {
  const preset = PAGE_PRESETS[slug];
  if (!preset) return null;

  return {
    id: null,
    ...preset,
    is_published: true,
    noindex: false,
    og_image_url: null,
    intro_heading: null,
    intro_body: null,
    sections: preset.sections.map((section, index) => ({
      id: `preset-${slug}-${index}`,
      ...section,
      is_active: true,
    })),
  };
}

export async function getPages({ includeUnpublished = false } = {}) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("pages")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (!includeUnpublished) query = query.eq("is_published", true);

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

export async function getPageById(id) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}

/**
 * A page plus its active sections, in order.
 *
 * Unpublished pages come back null so the route can 404 — except that a
 * preset-backed slug never disappears, because those three URLs were live long
 * before the dashboard existed and must not start 404ing.
 */
export async function getPageBySlug(slug, { includeUnpublished = false } = {}) {
  const supabase = await createClient();
  if (!supabase) return presetAsPage(slug);

  let query = supabase.from("pages").select("*").eq("slug", slug);
  if (!includeUnpublished) query = query.eq("is_published", true);

  const { data: page, error } = await query.maybeSingle();
  if (error || !page) return presetAsPage(slug);

  const { data: sections } = await supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", page.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return { ...page, sections: sections || [] };
}

/** Every section of one page, including hidden ones — for the editor. */
export async function getPageSections(pageId, { includeInactive = false } = {}) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("page_sections")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });

  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}
