import { getMediaAssets } from "@/lib/data/media";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import MediaLibrary from "./MediaLibrary";
import styles from "../../admin.module.css";

export const metadata = { title: "Media" };

export default async function AdminMediaPage() {
  const assets = await getMediaAssets({ limit: 300 });

  const totalBytes = assets.reduce((sum, asset) => sum + (asset.bytes || 0), 0);

  return (
    <>
      <h1 className={styles.pageTitle}>Media</h1>
      <p className={styles.pageDescription}>
        Every image and video uploaded through the dashboard. Files are compressed in your browser,
        stored on Cloudinary, and served from its CDN.
      </p>

      {!isCloudinaryConfigured && (
        <div className={styles.notice} data-tone="warn">
          <strong>Cloudinary isn’t configured</strong>
          <p>
            Uploading is disabled until <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>,{" "}
            <code>CLOUDINARY_API_KEY</code> and <code>CLOUDINARY_API_SECRET</code> are set as
            environment variables. Pasting URLs by hand still works everywhere in the meantime.
          </p>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.statGrid}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{assets.length}</span>
            <span className={styles.statLabel}>Files</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>
              {totalBytes ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB` : "—"}
            </span>
            <span className={styles.statLabel}>Total size</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <MediaLibrary assets={assets} />
      </div>
    </>
  );
}
