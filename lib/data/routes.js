import { createClient } from "@/lib/supabase/server";

/*
 * Search-engine visibility for the pages that are BUILT IN to the code.
 *
 * /about, /nrb, /landowner and the rest are files in app/, so the dashboard
 * can't delete them. What it can do is take them out of Google — which is what
 * you want after unlinking one from the menu: still reachable by URL for
 * anyone who has it, no longer advertised.
 *
 * Defaults are permissive: a route with no row is indexed and in the sitemap,
 * so a missing table (pre-migration) changes nothing.
 */

export const BUILT_IN_ROUTES = [
  { path: "/", label: "Homepage" },
  { path: "/properties", label: "Properties" },
  { path: "/contact", label: "Contact" },
  { path: "/about", label: "About Us" },
  { path: "/nrb", label: "NRB" },
  { path: "/landowner", label: "Landowner" },
  { path: "/construction-status", label: "Construction Status" },
  { path: "/legal/privacy-policy", label: "Privacy Policy" },
];

const DEFAULT_SETTINGS = { noindex: false, in_sitemap: true, meta_title: null, meta_description: null };

export async function getRouteSettings() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase.from("route_settings").select("*").order("path");
  if (error || !data) return [];
  return data;
}

/** Settings for one path, falling back to "indexed and listed". */
export async function getRouteSetting(path) {
  const supabase = await createClient();
  if (!supabase) return { path, ...DEFAULT_SETTINGS };

  const { data, error } = await supabase
    .from("route_settings")
    .select("*")
    .eq("path", path)
    .maybeSingle();

  if (error || !data) return { path, ...DEFAULT_SETTINGS };
  return data;
}

/**
 * Merges a built-in page's own metadata with whatever the admin has set for
 * that route. Title and description are overridden only when filled in, so a
 * page keeps its hand-written copy unless someone deliberately replaces it.
 *
 * Usage in a page file:
 *   export async function generateMetadata() {
 *     return buildRouteMetadata("/about", { title: "About Us", description: "…" });
 *   }
 */
export async function buildRouteMetadata(path, base = {}) {
  const setting = await getRouteSetting(path);

  return {
    ...base,
    ...(setting.meta_title ? { title: setting.meta_title } : {}),
    ...(setting.meta_description ? { description: setting.meta_description } : {}),
    ...(setting.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
