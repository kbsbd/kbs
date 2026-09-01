import { notFound } from "next/navigation";
import CmsPageView, { cmsPageMetadata } from "@/components/pages/CmsPageView";
import { getPageBySlug, getPages } from "@/lib/data/pages";

/*
 * Serves every page built from the dashboard, at /<slug>.
 *
 * This is a catch-all at the root, which sounds alarming but is not: Next.js
 * always prefers a static segment over a dynamic one, so /about, /contact,
 * /properties and the rest keep resolving to their own files in app/. This
 * route only ever sees a path that nothing else claimed — and if there is no
 * matching row, it 404s exactly as an unknown URL should.
 *
 * Migration 0007 also blocks the built-in slugs at the database level, so a
 * page can't be created at a name that would be shadowed and silently
 * unreachable.
 */

export const dynamicParams = true;

/** Pre-renders the pages that exist at build time; new ones render on demand. */
export async function generateStaticParams() {
  const pages = await getPages();
  return pages
    // about/nrb/landowner have their own route files; listing them here too
    // would declare the same path twice.
    .filter((page) => !["about", "nrb", "landowner"].includes(page.slug))
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return cmsPageMetadata(await getPageBySlug(slug));
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) notFound();

  return <CmsPageView page={page} />;
}
