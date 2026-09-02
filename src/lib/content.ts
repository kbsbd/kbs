/**
 * Content resolution.
 *
 * The seed in src/content/seed.ts is what ships. The admin dashboard writes
 * overrides into the Supabase table `site_content` (one row per top-level key,
 * value stored as jsonb) and those win at render time.
 *
 * If Supabase is not configured yet, or the query fails, the seed is used and
 * the site renders perfectly. Content must never be able to take the page down.
 */

import { seed, type SiteContent } from "@/content/seed";
import { createServerClient } from "./supabase/server";

/** Deep merge where an override value replaces the seed value at that key. */
function merge<T>(base: T, patch: unknown): T {
  if (patch === null || patch === undefined) return base;
  if (Array.isArray(base) || Array.isArray(patch)) return patch as T;
  if (typeof base !== "object" || typeof patch !== "object") return patch as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    out[k] = k in out ? merge((base as Record<string, unknown>)[k], v) : v;
  }
  return out as T;
}

export async function getContent(): Promise<SiteContent> {
  const supabase = createServerClient();
  if (!supabase) return seed;

  try {
    const { data, error } = await supabase.from("site_content").select("key, value");
    if (error || !data) return seed;

    let out: SiteContent = seed;
    for (const row of data as Array<{ key: string; value: unknown }>) {
      if (!(row.key in (out as unknown as Record<string, unknown>))) continue;
      out = {
        ...out,
        [row.key]: merge(
          (out as unknown as Record<string, unknown>)[row.key],
          row.value
        ),
      };
    }
    return out;
  } catch {
    return seed;
  }
}

/** Projects live in their own table so the client can add rows, not edit JSON. */
export async function getProjects() {
  const supabase = createServerClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id, image, title_en, title_bn, location_en, location_bn, status_en, status_bn, sort")
      .eq("published", true)
      .order("sort", { ascending: true });
    if (error || !data) return [];
    return data.map((p) => ({
      id: String(p.id),
      image: p.image as string,
      title: { en: p.title_en as string, bn: p.title_bn as string },
      location: { en: p.location_en as string, bn: p.location_bn as string },
      status: { en: p.status_en as string, bn: p.status_bn as string },
    }));
  } catch {
    return [];
  }
}
