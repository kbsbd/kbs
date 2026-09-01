import { notFound } from "next/navigation";
import CmsPageView, { cmsPageMetadata } from "@/components/pages/CmsPageView";
import { getPageBySlug } from "@/lib/data/pages";

/*
 * Serves every page built from the dashboard, at /<slug>.
 *
 * This is a catch-all at the root, which sounds alarming but is not: Next.js
 * always prefers a static segment over a dynamic one, so /about, /contact,
 * /properties and the rest keep resolving to their own files in app/. This
 * route only ever sees a path that nothing else claimed — and if there is no
 * matching row, it 404s exactly as an unknown URL should.
 *
 * Rendered per-request (not statically): getPageBySlug reads the request
 * cookies through the Supabase server client, so this route can't be
 * prerendered. A `generateStaticParams` here would make Next try to statically
 * generate unknown slugs and then crash with "static to dynamic at runtime".
 *
 * Migration 0007 also blocks the built-in slugs at the database level, so a
 * page can't be created at a name that would be shadowed and silently
 * unreachable.
 */

export const dynamic = "force-dynamic";

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
