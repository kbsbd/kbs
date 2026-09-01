import { getSiteSettings } from "@/lib/data/site";
import ArrivalForm from "./ArrivalForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Homepage video band" };

export default async function AdminArrivalPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <h1 className={styles.pageTitle}>Homepage video band</h1>
      <p className={styles.pageDescription}>
        The full-width video band between Featured properties and the customer reviews. The video
        itself stays on YouTube — only a poster image loads with the page, and the player is
        fetched when someone presses play.
      </p>

      <div className={styles.card}>
        <ArrivalForm settings={settings} />
      </div>
    </>
  );
}
