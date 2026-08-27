/*
 * Archive filtering + facet derivation for /properties/.
 *
 * WordPress builds the three hero selects from the bti_type / bti_status /
 * bti_location taxonomies, and the advanced panel's three selects from the
 * apartment-size, bedroom and block values across the catalogue. The clone has
 * no taxonomy tables, so the facets are derived from the property records the
 * same way — nothing is hardcoded, so the lists stay correct as the catalogue
 * changes.
 *
 * The type facet reads the existing `category` field (the clone's name for the
 * bti_type taxonomy) plus the is_featured / is_special_offer flags; status
 * reads `property_status`. Neither is guessed where the data is silent — an
 * unset value simply does not appear in the facet list.
 */

/* the seven labels the original's Type select shows, keyed by category slug */
const TYPE_LABELS = {
  classic: "Classic",
  critical: "Critical",
  featured: "Featured",
  luxury: "Luxury",
  "offer-interior": "Offer Interior",
  special: "Special",
  "wellness-communities": "Wellness Communities",
};

export const PER_PAGE = 12;

const slug = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* "Block D, Bashundhara R/A, Dhaka" -> "Bashundhara R/A"
   "Gulshan, Dhaka"                  -> "Gulshan"
   The area is the segment before the city, which is always last. */
export function areaOf(location) {
  if (!location) return "";
  const parts = String(location).split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return parts[0] || "";
  return parts[parts.length - 2];
}

/* "Block D, Bashundhara R/A, Dhaka" -> "Block D"; otherwise none */
export function blockOf(location) {
  if (!location) return "";
  const first = String(location).split(",")[0].trim();
  return /^Block\s+\S+/i.test(first) ? first : "";
}

/* the bedroom field is free text ("3", "3 - 4", "3-4"); take the distinct
   integers it mentions so "3 - 4" appears under both 3 and 4 */
export function bedroomsOf(value) {
  if (!value) return [];
  return [...new Set(String(value).match(/\d+/g) || [])];
}

/* the smallest square-footage figure mentioned, used for the size bands */
function minSqft(value) {
  const nums = (String(value || "").match(/\d[\d,]*/g) || []).map((n) =>
    Number(n.replace(/,/g, ""))
  );
  const real = nums.filter((n) => n >= 100);
  return real.length ? Math.min(...real) : null;
}

export const SIZE_BANDS = [
  { value: "1700-2000", label: "1700 to 2000 sft", min: 1700, max: 2000 },
  { value: "2100-2400", label: "2100 to 2400 sft", min: 2100, max: 2400 },
  { value: "2500-plus", label: "2500+ sft", min: 2500, max: Infinity },
  { value: "3000-duplex", label: "3000+ sft (Duplex)", min: 3000, max: Infinity, duplex: true },
];

function inBand(property, bandValue) {
  const band = SIZE_BANDS.find((b) => b.value === bandValue);
  if (!band) return true;
  const sqft = minSqft(property.apartment_size);
  if (sqft === null) return false;
  if (band.duplex) {
    const text = `${property.apartment_size || ""} ${property.description || ""}`;
    if (!/duplex/i.test(text)) return false;
  }
  return sqft >= band.min && sqft <= band.max;
}

export function archiveFacets(properties) {
  const uniq = (pairs) => {
    const seen = new Map();
    for (const [value, label] of pairs) if (value && !seen.has(value)) seen.set(value, label);
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const types = uniq(
    properties.flatMap((p) => {
      const out = [];
      if (p.category) out.push([slug(p.category), TYPE_LABELS[p.category] || p.category]);
      if (p.is_special_offer) out.push(["special", "Special"]);
      if (p.is_featured) out.push(["featured", "Featured"]);
      return out;
    })
  );

  const statuses = uniq(
    properties.filter((p) => p.property_status).map((p) => [slug(p.property_status), p.property_status])
  );

  const locations = uniq(properties.map((p) => [slug(areaOf(p.location)), areaOf(p.location)]));

  const blocks = uniq(properties.map((p) => [blockOf(p.location), blockOf(p.location)]));

  const bedroomValues = [
    ...new Set(properties.flatMap((p) => bedroomsOf(p.bedrooms))),
  ].sort((a, b) => Number(a) - Number(b));
  const bedrooms = bedroomValues.map((v) => ({
    value: v,
    label: `${v} ${Number(v) === 1 ? "Bedroom" : "Bedrooms"}`,
  }));

  const sizes = SIZE_BANDS.filter((band) =>
    properties.some((p) => inBand(p, band.value))
  ).map(({ value, label }) => ({ value, label }));

  return { types, statuses, locations, blocks, bedrooms, sizes };
}

export function filterProperties(properties, params = {}) {
  const get = (k) => {
    const v = params?.[k];
    return (Array.isArray(v) ? v[0] : v) || "";
  };

  const type = get("bti_type");
  const status = get("bti_status");
  const location = get("bti_location");
  const size = get("property_size");
  const bedrooms = get("property_bedrooms");
  const block = get("property_block");
  const keyword = get("property_keyword").trim().toLowerCase();

  return properties.filter((p) => {
    if (type) {
      const own = [
        p.category ? slug(p.category) : null,
        p.is_special_offer ? "special" : null,
        p.is_featured ? "featured" : null,
      ].filter(Boolean);
      if (!own.includes(type)) return false;
    }
    if (status && slug(p.property_status || "") !== status) return false;
    if (location && slug(areaOf(p.location)) !== location) return false;
    if (size && !inBand(p, size)) return false;
    if (bedrooms && !bedroomsOf(p.bedrooms).includes(bedrooms)) return false;
    if (block && blockOf(p.location) !== block) return false;
    if (keyword) {
      const hay = `${p.title || ""} ${p.location || ""}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });
}
