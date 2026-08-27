import { getSiteSettings } from "@/lib/data/site";
import ArrivalForm from "./ArrivalForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Statement of Arrival" };

export default async function AdminArrivalPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <h1 className={styles.pageTitle}>Statement of Arrival</h1>
      <p className={styles.pageDescription}>
        This section streams directly from YouTube. Paste a full YouTube URL or just the
        video ID.
      </p>

      <div className={styles.card}>
        <ArrivalForm settings={settings} />
      </div>
    </>
  );
}
