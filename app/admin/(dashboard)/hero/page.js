import { getSiteSettings } from "@/lib/data/site";
import HeroForm from "./HeroForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Hero & Video" };

export default async function AdminHeroPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <h1 className={styles.pageTitle}>Hero & Video</h1>
      <p className={styles.pageDescription}>
        Paste a Cloudinary-hosted video URL to replace the homepage hero video. The poster
        image shows while the video loads and if playback fails. Keep the file under a few
        MB (Cloudinary can transform on the fly, e.g. add <code>q_auto,w_1920</code> to the
        URL) so the hero doesn&apos;t slow down the page.
      </p>

      <div className={styles.card}>
        <HeroForm settings={settings} />
      </div>
    </>
  );
}
