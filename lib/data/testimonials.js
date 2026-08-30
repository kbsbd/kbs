import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TESTIMONIALS } from "@/lib/testimonials-defaults";

export { DEFAULT_TESTIMONIALS };

/**
 * The homepage customer-review slider.
 *
 * `includeInactive` is for the dashboard, which needs to show hidden rows so
 * they can be un-hidden; the public site never passes it.
 */
export async function getTestimonials({ includeInactive = false } = {}) {
  const supabase = await createClient();
  if (!supabase) {
    return includeInactive ? DEFAULT_TESTIMONIALS : DEFAULT_TESTIMONIALS.filter((t) => t.is_active);
  }

  let query = supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return includeInactive ? DEFAULT_TESTIMONIALS : DEFAULT_TESTIMONIALS.filter((t) => t.is_active);
  }
  return data;
}
