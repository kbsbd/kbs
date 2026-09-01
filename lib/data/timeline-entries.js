import { createClient } from "@/lib/supabase/server";
import { TIMELINE } from "@/lib/data/timeline";

/*
 * The About page's company history.
 *
 * Separate from lib/data/timeline.js, which holds the original 16-entry
 * constant. That constant is now the fallback: if the table is missing
 * (pre-migration) or empty, the timeline renders exactly what it always did.
 *
 * Rows use the database's own column names; the section renderer maps them
 * back to the shape AboutTimeline expects.
 */

const FALLBACK = TIMELINE.map((entry, index) => ({
  id: null,
  date_label: entry.date,
  title: entry.title,
  body: entry.text,
  image_url: entry.image,
  image_position: entry.imagePosition,
  link_label: entry.linkLabel || null,
  link_url: entry.link || null,
  is_active: true,
  sort_order: (index + 1) * 10,
}));

export async function getTimelineEntries({ includeInactive = false } = {}) {
  const supabase = await createClient();
  if (!supabase) return FALLBACK;

  let query = supabase
    .from("timeline_entries")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error || !data || data.length === 0) return FALLBACK;
  return data;
}
