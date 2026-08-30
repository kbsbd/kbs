import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SBU_UNITS } from "@/lib/sbu-defaults";

export { DEFAULT_SBU_UNITS };

/*
 * The "Other Initiatives" (SBU) slider.
 *
 * This module used to export a `SBU_UNITS` const that SbuSection imported
 * directly. It now reads the sbu_units table and SbuSection takes the list as
 * a prop, because a client component cannot import the Supabase server client.
 */
export async function getSbuUnits({ includeInactive = false } = {}) {
  const supabase = await createClient();
  if (!supabase) {
    return includeInactive ? DEFAULT_SBU_UNITS : DEFAULT_SBU_UNITS.filter((u) => u.is_active);
  }

  let query = supabase.from("sbu_units").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return includeInactive ? DEFAULT_SBU_UNITS : DEFAULT_SBU_UNITS.filter((u) => u.is_active);
  }
  return data;
}
