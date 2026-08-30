import { createClient } from "@/lib/supabase/server";
import { CTA_ICON_KEYS, DEFAULT_CTA_BUTTONS } from "@/lib/cta-defaults";

/*
 * The floating action stack (Call / WhatsApp / Reach us).
 *
 * These used to be a hardcoded const array inside components/FixedActions.jsx,
 * SVG paths and all. Now the row carries an `icon` KEY and the SVG lives in
 * components/CtaIcon.jsx — an admin picks an icon from a dropdown instead of
 * pasting markup, which keeps arbitrary SVG out of the database.
 *
 * The constants themselves live in lib/cta-defaults.js so that FixedActions
 * (a client component) can import them without dragging in next/headers.
 */

export { CTA_ICON_KEYS, DEFAULT_CTA_BUTTONS };

export async function getCtaButtons({ includeInactive = false } = {}) {
  const supabase = await createClient();
  if (!supabase) {
    return includeInactive ? DEFAULT_CTA_BUTTONS : DEFAULT_CTA_BUTTONS.filter((b) => b.is_active);
  }

  let query = supabase.from("cta_buttons").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return includeInactive ? DEFAULT_CTA_BUTTONS : DEFAULT_CTA_BUTTONS.filter((b) => b.is_active);
  }
  return data;
}
