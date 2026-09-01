import { getSiteSettings } from "@/lib/data/site";
import IntegrationsForm from "./IntegrationsForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Analytics & tracking" };

export default async function AdminIntegrationsPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <h1 className={styles.pageTitle}>Analytics &amp; tracking</h1>
      <p className={styles.pageDescription}>
        Meta Pixel and Google Analytics load only when an ID is set here, after the page
        becomes interactive.
      </p>

      <div className={styles.card}>
        <IntegrationsForm settings={settings} />
      </div>
    </>
  );
}
