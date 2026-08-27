import { NextResponse } from "next/server";
import { getProperties } from "@/lib/data/properties.server";
import { filterProperties } from "@/lib/data/property-filters";

/*
 * Stands in for the original's WordPress REST route:
 *   data-suggestions-endpoint="/wp-json/bti/v1/property-suggestions"
 *
 * main.min.js calls it with property_keyword plus whichever of
 * property_size / property_bedrooms / property_block are set, and expects
 *   { results: [ { title, location, url } ] }
 * rendering "No matching ongoing projects" for an empty array. Fewer than two
 * characters never reaches the network — the client bails first.
 */

const LIMIT = 8;

export async function GET(request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const keyword = String(params.property_keyword || "").trim();

  if (keyword.length < 2) return NextResponse.json({ results: [] });

  const properties = await getProperties();
  const results = filterProperties(properties, params)
    .slice(0, LIMIT)
    .map((p) => ({
      title: p.title,
      location: p.location || "",
      url: `/property/${p.slug}`,
    }));

  return NextResponse.json({ results });
}
