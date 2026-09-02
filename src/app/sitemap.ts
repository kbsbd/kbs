import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { LOCALES } from "@/content/seed";

/** "" is the locale home; the rest are the standalone pages. */
const PATHS = ["", "/services", "/kb-homes", "/clients", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return LOCALES.flatMap((l) =>
    PATHS.map((path) => ({
      url: `${base}/${l}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? (l === "bn" ? 1 : 0.9) : 0.6,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((x) => [x, `${base}/${x}${path}`])),
      },
    }))
  );
}
