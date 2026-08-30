import { createClient } from "@/lib/supabase/server";
import { NAV_LINKS } from "@/lib/nav";

/*
 * Header / drawer navigation.
 *
 * `placement` decides where a link shows up:
 *   primary — the always-visible desktop strip beside the logo
 *   drawer  — the slide-out side menu and the mobile menu
 *   both    — everywhere
 *
 * The code-only NAV_LINKS list is still the fallback, so the menu renders
 * correctly before the table is seeded (or if Supabase is unreachable).
 */

const FALLBACK = NAV_LINKS.map((link, index) => ({
  id: null,
  label: link.label,
  href: link.href,
  external: Boolean(link.external),
  // The old header only ever showed "Properties" outside the drawer.
  placement: link.href === "/properties" ? "both" : "drawer",
  is_active: true,
  sort_order: (index + 1) * 10,
}));

export async function getNavLinks() {
  const supabase = await createClient();
  if (!supabase) return FALLBACK;

  const { data, error } = await supabase
    .from("nav_links")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return FALLBACK;
  return data;
}

/** Links for the always-visible desktop strip. */
export function primaryNavLinks(links) {
  return links.filter((l) => l.is_active !== false && ["primary", "both"].includes(l.placement));
}

/** Links for the slide-out and mobile drawers. */
export function drawerNavLinks(links) {
  return links.filter((l) => l.is_active !== false && ["drawer", "both"].includes(l.placement));
}
