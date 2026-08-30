import { createClient } from "@/lib/supabase/server";

/**
 * The media library, newest first. Admin-only by RLS, so this returns an empty
 * list for anonymous callers rather than throwing.
 */
export async function getMediaAssets({ limit = 200, resourceType = null } = {}) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (resourceType) query = query.eq("resource_type", resourceType);

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}
