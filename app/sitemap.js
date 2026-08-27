import { getProperties } from "@/lib/data/properties.server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const properties = await getProperties();

  const staticRoutes = [
    "",
    "/properties",
    "/about",
    "/contact",
    "/nrb",
    "/landowner",
    "/construction-status",
    "/legal/privacy-policy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const propertyRoutes = properties.map((p) => ({
    url: `${SITE_URL}/property/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));

  return [...staticRoutes, ...propertyRoutes];
}
