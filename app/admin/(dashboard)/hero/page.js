import { getSiteSettings } from "@/lib/data/site";
import HeroForm from "./HeroForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Hero video" };

export default async function AdminHeroPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <h1 className={styles.pageTitle}>Hero video</h1>
      <p className={styles.pageDescription}>
        The full-height video at the top of the homepage. Uploaded files are compressed and served
        from Cloudinary&apos;s CDN; you can also paste a URL from anywhere else.
      </p>

      <div className={styles.card}>
        <HeroForm settings={settings} />
      </div>
    </>
  );
}
