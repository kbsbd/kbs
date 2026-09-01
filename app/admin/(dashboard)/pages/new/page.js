import Link from "next/link";
import PageSettingsForm from "../PageSettingsForm";
import { createPage } from "@/lib/actions/pages";
import { PAGE_TEMPLATES } from "@/lib/page-templates";
import styles from "../../../admin.module.css";

export const metadata = { title: "New page" };

export default function AdminNewPagePage() {
  return (
    <>
      <h1 className={styles.pageTitle}>New page</h1>
      <p className={styles.pageDescription}>
        Name it and pick a style. You&apos;ll add the content sections next.
      </p>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>The three styles</h2>
        <dl className={styles.defList}>
          {PAGE_TEMPLATES.map((template) => (
            <div key={template.value}>
              <dt>{template.label}</dt>
              <dd>{template.blurb}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.fieldHint}>
          The style sets the banner and overall look. Every style takes the same content sections,
          so you are not locked in — you can switch style later without losing anything.
        </p>
      </div>

      <div className={styles.card}>
        <PageSettingsForm action={createPage} mode="create" />
      </div>

      <p className={styles.pageDescription}>
        <Link href="/admin/pages">Back to all pages</Link>
      </p>
    </>
  );
}
