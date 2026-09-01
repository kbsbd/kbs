import Link from "next/link";
import { getPages } from "@/lib/data/pages";
import { templateLabel } from "@/lib/page-templates";
import styles from "../../admin.module.css";

export const metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const pages = await getPages({ includeUnpublished: true });

  return (
    <>
      <h1 className={styles.pageTitle}>Pages</h1>
      <p className={styles.pageDescription}>
        Pages you build here appear at their own web address and can be added to the menu.
      </p>

      <div className={styles.notice}>
        <strong>How a page is put together</strong>
        <p>
          Give it a name, pick a style, and you get a working page. Then add sections to it — text,
          text with a picture, a ticked list, questions and answers, a card grid, or a call to
          action. The style controls the banner and overall look; the sections are the content.
        </p>
      </div>

      <div className={styles.card}>
        <div style={{ marginBottom: "1.25rem" }}>
          <Link href="/admin/pages/new" className={styles.primaryButton}>
            New page
          </Link>
        </div>

        {pages.length === 0 ? (
          <p className={styles.pageDescription} style={{ margin: 0 }}>
            No pages yet. Create one to get started.
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Style</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>{page.title}</td>
                  <td style={{ wordBreak: "break-all" }}>/{page.slug}</td>
                  <td>{templateLabel(page.template)}</td>
                  <td>
                    {!page.is_published
                      ? "Draft"
                      : page.noindex
                        ? "Live · hidden from search"
                        : "Live"}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link href={`/admin/pages/${page.id}`} className={styles.secondaryButton}>
                        Edit
                      </Link>
                      {page.is_published && (
                        <Link
                          href={`/${page.slug}`}
                          className={styles.secondaryButton}
                          target="_blank"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
