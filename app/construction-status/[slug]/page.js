import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPropertyBySlug } from "@/lib/data/properties.server";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import styles from "./construction-status.module.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};
  return { title: `Construction Status — ${property.title}` };
}

export default async function ConstructionStatusPage({ params }) {
  const { slug } = await params;
  const [property, footerLinks, socialLinks] = await Promise.all([
    getPropertyBySlug(slug),
    getFooterLinks(),
    getSocialLinks(),
  ]);

  if (!property) notFound();

  const progressRows = (property.construction_progress || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split("|").map((cell) => cell.trim()));

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.grid}>
              <div>
                <h1>{property.title}</h1>
                {(property.construction_location || property.location) && (
                  <p className={styles.location}>
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
                      />
                    </svg>
                    {property.construction_location || property.location}
                  </p>
                )}

                <div className={styles.metaRow}>
                  {property.construction_completion_date && (
                    <div className={styles.metaCard}>
                      <span>Expected Completion Date</span>
                      <strong>{property.construction_completion_date}</strong>
                    </div>
                  )}
                  {property.construction_status_updated && (
                    <div className={styles.metaCard}>
                      <span>Status Updated</span>
                      <strong>{property.construction_status_updated}</strong>
                    </div>
                  )}
                </div>

                <Link href="/construction-status" className={styles.backLink}>
                  ← Back to all projects
                </Link>
              </div>

              {property.cover_image_url && (
                <div className={styles.visual}>
                  <img src={property.cover_image_url} alt={property.title} />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.container}>
            <div className={styles.contentShell}>
              <div className={styles.contentHead}>
                <div>
                  <h2>Construction progress details</h2>
                  <p>The progress table comes directly from the latest site update.</p>
                </div>
              </div>

              {progressRows.length > 0 ? (
                <div className={styles.progress}>
                  <table>
                    <tbody>
                      <tr>
                        {progressRows[0].map((cell, i) => (
                          <th key={i}>{cell}</th>
                        ))}
                      </tr>
                      {progressRows.slice(1).map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.empty}>
                  Progress updates for this project haven&apos;t been published yet. Check back
                  soon, or contact us for the latest status.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
