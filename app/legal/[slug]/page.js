import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";

const DEFAULT_PAGES = {
  "privacy-policy": { title: "Privacy Policy", content: "" },
};

async function getLegalPage(slug) {
  const supabase = await createClient();
  if (!supabase) return DEFAULT_PAGES[slug] || null;

  const { data, error } = await supabase
    .from("legal_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return DEFAULT_PAGES[slug] || null;
  return data;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return {};
  return { title: page.title };
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  const [page, footerLinks, socialLinks] = await Promise.all([
    getLegalPage(slug),
    getFooterLinks(),
    getSocialLinks(),
  ]);

  if (!page) notFound();

  return (
    <>
      <Header />
      <main style={{ paddingTop: "7rem", minHeight: "60vh", background: "#1c1c1c" }}>
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto",
            padding: "0 1.5rem 4rem",
            color: "#fff",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 500, marginBottom: "1.5rem" }}>
            {page.title}
          </h1>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "rgba(255,255,255,0.8)" }}>
            {page.content || "Content coming soon."}
          </div>
        </div>
      </main>
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
