import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { LOCALES } from "@/content/seed";
import { getContent } from "@/lib/content";
import { getProducts } from "@/lib/shop";
import { getPublishedSlugs } from "@/lib/cms";

export const revalidate = 3600;

/** "" is the locale home; the rest are the standalone pages. */
const PATHS = ["", "/building", "/services", "/shop", "/kb-homes", "/clients", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const content = await getContent();
  const [products, cmsSlugs] = await Promise.all([
    content.shop.enabled ? getProducts() : Promise.resolve([]),
    getPublishedSlugs(),
  ]);

  const staticEntries = LOCALES.flatMap((l) =>
    PATHS.filter((p) => p !== "/shop" || content.shop.enabled).map((path) => ({
      url: `${base}/${l}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? (l === "bn" ? 1 : 0.9) : 0.6,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((x) => [x, `${base}/${x}${path}`])),
      },
    }))
  );

  const productEntries = LOCALES.flatMap((l) =>
    products.map((p) => ({
      url: `${base}/${l}/shop/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  );

  const pageEntries = LOCALES.flatMap((l) =>
    cmsSlugs.map((slug) => ({
      url: `${base}/${l}/p/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }))
  );

  /* one detail view per amenity card, generated from the same content the
     landing page renders, so adding a card in the admin puts it in the sitemap
     without anyone remembering to. */
  const amenityEntries = LOCALES.flatMap((l) =>
    content.amenities.items.map((a) => ({
      url: `${base}/${l}/amenities/${a.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((x) => [x, `${base}/${x}/amenities/${a.id}`])
        ),
      },
    }))
  );

  return [...staticEntries, ...amenityEntries, ...productEntries, ...pageEntries];
}
