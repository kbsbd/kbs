import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "../admin.module.css";

export const metadata = { title: "Overview" };

async function getCounts() {
  const supabase = await createClient();
  if (!supabase) return { properties: 0, leads: 0, subscribers: 0 };

  const [{ count: properties }, { count: leads }, { count: subscribers }] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
  ]);

  return {
    properties: properties || 0,
    leads: leads || 0,
    subscribers: subscribers || 0,
  };
}

export default async function AdminOverviewPage() {
  const counts = await getCounts();

  return (
    <>
      <h1 className={styles.pageTitle}>Overview</h1>
      <p className={styles.pageDescription}>
        Everything here is live on the site immediately after saving.
      </p>

      <div className={styles.card}>
        <div className={styles.statGrid}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{counts.properties}</span>
            <span className={styles.statLabel}>Properties</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{counts.leads}</span>
            <span className={styles.statLabel}>Leads captured</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{counts.subscribers}</span>
            <span className={styles.statLabel}>Newsletter subscribers</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <p className={styles.pageDescription} style={{ marginBottom: "1rem" }}>
          Quick links
        </p>
        <div className={styles.rowActions} style={{ flexWrap: "wrap" }}>
          <Link href="/admin/hero" className={styles.secondaryButton}>
            Edit hero video
          </Link>
          <Link href="/admin/properties/new" className={styles.secondaryButton}>
            Add a property
          </Link>
          <Link href="/" className={styles.secondaryButton} target="_blank">
            View site
          </Link>
        </div>
      </div>
    </>
  );
}
