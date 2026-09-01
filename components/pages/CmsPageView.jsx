import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import PageSections from "./PageSections";
import IntegrationScripts from "@/components/IntegrationScripts";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import { getSiteSettings } from "@/lib/data/site";
import { getTimelineEntries } from "@/lib/data/timeline-entries";
import styles from "./CmsPageView.module.css";

/*
 * One renderer for every page built from the dashboard.
 *
 * Shared by the catch-all /[slug] route and by the three fixed routes that
 * kept their own file — /about, /nrb and /landowner. Those three still exist
 * as files so their URLs stay explicit and can never be shadowed, but they
 * render from the same rows and the same components as any other page.
 *
 * The timeline is fetched once here rather than inside the section, because a
 * Server Component section can't fetch on its own without becoming async in a
 * place React would rather it weren't.
 */
export default async function CmsPageView({ page }) {
  const needsTimeline = page.sections?.some((section) => section.kind === "timeline");

  const [footerLinks, socialLinks, settings, timeline] = await Promise.all([
    getFooterLinks(),
    getSocialLinks(),
    getSiteSettings(),
    needsTimeline ? getTimelineEntries() : Promise.resolve([]),
  ]);

  const isText = page.template === "text";

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Header />

      <main id="main-content">
        <PageBanner
          image={page.banner_image_url || ""}
          /* banner_title is the headline; page.title is the short name used in
             menus, the admin list and search results. Falls back when unset. */
          title={page.banner_title || page.title}
          subtitle={page.banner_subtitle}
          dark={page.template === "feature"}
        />

        {(page.intro_heading || page.intro_body) && (
          <section className={styles.intro}>
            <div className={isText ? styles.containerNarrow : styles.container}>
              {page.intro_heading && <h2 className={styles.introTitle}>{page.intro_heading}</h2>}
              {page.intro_body && (
                <div className={styles.introBody}>
                  {page.intro_body
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                </div>
              )}
            </div>
          </section>
        )}

        <PageSections sections={page.sections} narrow={isText} timeline={timeline} />
      </main>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />

      <IntegrationScripts
        metaPixelId={settings.meta_pixel_id}
        gaMeasurementId={settings.ga_measurement_id}
      />
    </>
  );
}

/** Shared metadata builder, so all four routes describe a page the same way. */
export function cmsPageMetadata(page) {
  if (!page) return { title: "Page not found" };

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.banner_subtitle || undefined,
    ...(page.og_image_url ? { openGraph: { images: [{ url: page.og_image_url }] } } : {}),
    ...(page.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
