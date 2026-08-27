import { createClient } from "@/lib/supabase/server";
import { DEMO_PROPERTIES, getDemoProperty } from "@/lib/data/properties";

function withDefaults(property) {
  return {
    ...property,
    status: property.status || "Ongoing",
    construction_status_url:
      property.construction_status_url || `/construction-status/${property.slug}`,
  };
}

function withDefaultsList(list) {
  return list.map(withDefaults);
}

export async function getProperties() {
  const supabase = await createClient();
  if (!supabase) return withDefaultsList(DEMO_PROPERTIES);

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return withDefaultsList(DEMO_PROPERTIES);
  return withDefaultsList(data);
}

export async function getFeaturedProperties() {
  const all = await getProperties();
  /* The original orders the Featured grid independently of the global
     sort_order (dew-drops is 1st in Special offer but 5th here), so a
     property can carry its own featured_order; anything without one falls
     back to sort_order. */
  return all
    .filter((p) => p.is_featured)
    .sort((a, b) => {
      const av = a.featured_order ?? a.sort_order ?? 0;
      const bv = b.featured_order ?? b.sort_order ?? 0;
      return av - bv;
    });
}

export async function getSpecialOfferProperties() {
  const all = await getProperties();
  return all.filter((p) => p.is_special_offer);
}

export async function getPropertyById(id) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return withDefaults(data);
}

export async function getPropertyBySlug(slug) {
  const supabase = await createClient();
  if (!supabase) {
    const demo = getDemoProperty(slug);
    return demo ? withDefaults(demo) : null;
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    const demo = getDemoProperty(slug);
    return demo ? withDefaults(demo) : null;
  }
  return withDefaults(data);
}
