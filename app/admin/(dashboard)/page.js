import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import styles from "../admin.module.css";

export const metadata = { title: "Overview" };

async function getCounts() {
  const supabase = await createClient();
  if (!supabase) return { properties: 0, leads: 0, subscribers: 0, media: 0 };

  const [{ count: properties }, { count: leads }, { count: subscribers }, { count: media }] =
    await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
      // media_assets only exists after migration 0005; a missing table comes
      // back as an error, not a throw, so count is simply null.
      supabase.from("media_assets").select("*", { count: "exact", head: true }),
    ]);

  return {
    properties: properties || 0,
    leads: leads || 0,
    subscribers: subscribers || 0,
    media: media || 0,
  };
}

const QUICK_LINKS = [
  { href: "/admin/properties/new", label: "Add a property" },
  { href: "/admin/pages", label: "Edit a page" },
  { href: "/admin/homepage", label: "Home page sections" },
  { href: "/admin/site", label: "Branding & contact" },
  { href: "/admin/navigation", label: "Menu links" },
  { href: "/admin/media", label: "Media library" },
];

export default async function AdminOverviewPage() {
  const counts = await getCounts();

  return (
    <>
      <h1 className={styles.pageTitle}>Overview</h1>
      <p className={styles.pageDescription}>
        Everything here is live on the site immediately after saving.
      </p>

      {!isCloudinaryConfigured && (
        <div className={styles.notice} data-tone="warn">
          <strong>Uploads are off</strong>
          <p>
            Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>, <code>CLOUDINARY_API_KEY</code> and{" "}
            <code>CLOUDINARY_API_SECRET</code> to turn on image and video uploading. Until then,
            every media field still accepts a pasted URL.
          </p>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.statGrid}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{counts.properties}</span>
            <span className={styles.statLabel}>Properties</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{counts.leads}</span>
            <span className={styles.statLabel}>Contact form enquiries</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{counts.subscribers}</span>
            <span className={styles.statLabel}>Newsletter subscribers</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{counts.media}</span>
            <span className={styles.statLabel}>Media files</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Quick links</h2>
        <div className={styles.rowActions} style={{ flexWrap: "wrap" }}>
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.secondaryButton}>
              {link.label}
            </Link>
          ))}
          <Link href="/" className={styles.secondaryButton} target="_blank">
            View site
          </Link>
        </div>
      </div>
    </>
  );
}
