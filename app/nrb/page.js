import { notFound } from "next/navigation";
import CmsPageView, { cmsPageMetadata } from "@/components/pages/CmsPageView";
import { getPageBySlug } from "@/lib/data/pages";
import { buildRouteMetadata } from "@/lib/data/routes";

/*
 * /nrb — content now lives in the `pages` table (migration 0008).
 *
 * This file used to hold the whole page as JSX with its copy, images and service list as
 * constants. All of that moved into the database so it can be edited from the
 * dashboard; what renders it is the same set of components as before, so the
 * service finder and the rest of the page behave exactly as they did.
 *
 * The route file is kept rather than folded into /[slug] for two reasons: the
 * URL stays explicit and can never be shadowed by a page an admin creates, and
 * search-visibility for it stays under Admin → Search & visibility alongside the
 * other fixed routes.
 *
 * If the row is missing — the code deployed before the migration ran —
 * getPageBySlug falls back to the bundled preset, which is a verbatim copy of
 * what this file used to render. The page never goes dark.
 */

const SLUG = "nrb";

export async function generateMetadata() {
  const page = await getPageBySlug(SLUG);
  return buildRouteMetadata("/nrb", cmsPageMetadata(page));
}

export default async function NrbPage() {
  const page = await getPageBySlug(SLUG);
  if (!page) notFound();

  return <CmsPageView page={page} />;
}
