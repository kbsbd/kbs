import { createClient } from "@/lib/supabase/server";
import LegalPageForm from "./LegalPageForm";
import styles from "../../admin.module.css";

export const metadata = { title: "Legal Pages" };

const DEFAULT_PAGE = { slug: "privacy-policy", title: "Privacy Policy", content: "" };

async function getLegalPages() {
  const supabase = await createClient();
  if (!supabase) return [DEFAULT_PAGE];

  const { data, error } = await supabase.from("legal_pages").select("*").order("slug");
  if (error || !data || data.length === 0) return [DEFAULT_PAGE];
  return data;
}

export default async function AdminLegalPage() {
  const pages = await getLegalPages();

  return (
    <>
      <h1 className={styles.pageTitle}>Legal Pages</h1>
      <p className={styles.pageDescription}>
        Plain markdown/text content, rendered at <code>/legal/[slug]</code>.
      </p>

      {pages.map((page) => (
        <div className={styles.card} key={page.slug}>
          <LegalPageForm page={page} />
        </div>
      ))}
    </>
  );
}
