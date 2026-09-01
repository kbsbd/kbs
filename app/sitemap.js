import { getProperties } from "@/lib/data/properties.server";
import { getPages } from "@/lib/data/pages";
import { getRouteSettings, BUILT_IN_ROUTES } from "@/lib/data/routes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/*
 * Three sources feed the sitemap:
 *
 *   1. the built-in routes (files in app/), filtered by route_settings so an
 *      admin can drop one without touching code;
 *   2. every published, indexable page built from the dashboard;
 *   3. every property detail page.
 *
 * A route with no row in route_settings is included — the permissive default
 * means an unmigrated database produces the sitemap this file always produced.
 */
export default async function sitemap() {
  const [properties, cmsPages, routeSettings] = await Promise.all([
    getProperties(),
    getPages(),
    getRouteSettings(),
  ]);

  const settingsByPath = new Map(routeSettings.map((row) => [row.path, row]));

  const staticRoutes = BUILT_IN_ROUTES.filter((route) => {
    const setting = settingsByPath.get(route.path);
    if (!setting) return true;
    return setting.in_sitemap && !setting.noindex;
  }).map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    lastModified: new Date(),
  }));

  const cmsRoutes = cmsPages
    .filter((page) => !page.noindex)
    .map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
    }));

  const propertyRoutes = properties.map((p) => ({
    url: `${SITE_URL}/property/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));

  return [...staticRoutes, ...cmsRoutes, ...propertyRoutes];
}
