import { getRouteSettings, BUILT_IN_ROUTES } from "@/lib/data/routes";
import RouteRow from "./RouteRow";
import styles from "../../admin.module.css";

export const metadata = { title: "Search & visibility" };

export default async function AdminBuiltInPagesPage() {
  const saved = await getRouteSettings();
  const byPath = new Map(saved.map((row) => [row.path, row]));

  /* Driven by the code's list, not the table's — a route that has no row yet
     still needs to appear, with the permissive defaults it currently behaves
     with. */
  const routes = BUILT_IN_ROUTES.map((route) => ({
    ...route,
    ...(byPath.get(route.path) || { noindex: false, in_sitemap: true }),
    label: byPath.get(route.path)?.label || route.label,
  }));

  return (
    <>
      <h1 className={styles.pageTitle}>Search &amp; visibility</h1>
      <p className={styles.pageDescription}>
        These pages are part of the site&apos;s code rather than something you created, so they
        can&apos;t be deleted from here. What you can control is whether search engines show them.
      </p>

      <div className={styles.notice}>
        <strong>Removing a page from the menu doesn&apos;t hide it</strong>
        <p>
          An unlinked page stays reachable by its address and keeps appearing in Google. Tick
          “Hide from search” to take it out of results and out of your sitemap. The page still
          works for anyone with the link — nothing is deleted, and it&apos;s reversible at any
          time.
        </p>
      </div>

      <div className={styles.notice} data-tone="warn">
        <strong>Already hidden</strong>
        <p>
          <code>/about</code>, <code>/nrb</code>, <code>/landowner</code> and{" "}
          <code>/construction-status</code> were set to hidden when the pages migration ran, on the
          basis that you were unlinking them. Untick the boxes below to put any of them back into
          search. Google usually takes a few days to catch up either way.
        </p>
      </div>

      {routes.map((route) => (
        <div key={route.path} className={styles.card}>
          <RouteRow route={route} />
        </div>
      ))}
    </>
  );
}
