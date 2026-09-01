import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import { getSiteSettings } from "@/lib/data/site";
import { buildRouteMetadata } from "@/lib/data/routes";
import ContactForm from "./ContactForm";
import styles from "./contact.module.css";

/*
 * /contact — every value on this page (address, the three phone numbers, the
 * email, the map search, the heading and both background images) used to be a
 * literal in this file. They now come from the site_settings row, so the admin
 * edits them under Site & Branding.
 *
 * The card *structure* stays in code: which cards exist, their icons, and the
 * order. That is layout, not content — an admin changing a phone number should
 * not be able to accidentally delete the phone card.
 */

const ICONS = {
  address:
    "M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
  phone:
    "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1H7.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1.1L6.6 10.8Z",
  email:
    "M2 4h20v16H2V4Zm2 2v.5l8 5.5 8-5.5V6H4Zm16 3.1-7.4 5.1a1 1 0 0 1-1.2 0L4 9.1V18h16V9.1Z",
};

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const name = settings.site_name || "KBS";

  /* Search visibility for this route is admin-controlled — see
     lib/data/routes.js and Admin → Search & visibility. */
  return buildRouteMetadata("/contact", {
    title: "Contact",
    description: `Get in touch with ${name} — address, phone, email, and a direct message form.`,
  });
}

/** Builds the info cards, skipping any whose fields the admin has cleared. */
function buildCards(settings) {
  const cards = [];

  if (settings.contact_address) {
    cards.push({
      icon: ICONS.address,
      title: "Our address",
      lines: [{ text: settings.contact_address }],
    });
  }

  const phoneLines = [
    settings.contact_phone && {
      text: settings.contact_phone,
      href: `tel:${settings.contact_phone}`,
    },
    settings.contact_phone_alt && {
      text: settings.contact_phone_alt,
      href: `tel:${settings.contact_phone_alt}`,
    },
    settings.contact_whatsapp && {
      text: `${settings.contact_whatsapp} (WhatsApp)`,
      href: `tel:${settings.contact_whatsapp}`,
    },
  ].filter(Boolean);

  if (phoneLines.length > 0) {
    cards.push({ icon: ICONS.phone, title: "Phone number", lines: phoneLines });
  }

  if (settings.contact_email) {
    cards.push({
      icon: ICONS.email,
      title: "Email address",
      lines: [{ text: settings.contact_email, href: `mailto:${settings.contact_email}` }],
    });
  }

  return cards;
}

export default async function ContactPage() {
  const [footerLinks, socialLinks, settings] = await Promise.all([
    getFooterLinks(),
    getSocialLinks(),
    getSiteSettings(),
  ]);

  const cards = buildCards(settings);
  const mapsQuery = encodeURIComponent(settings.map_query || settings.contact_address || "");

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.introSection}>
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>{settings.contact_heading || "Get in touch"}</h1>
            <div className={styles.infoGrid}>
              {cards.map((card) => (
                <div key={card.title} className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d={card.icon} />
                    </svg>
                  </span>
                  <div>
                    <h6>{card.title}</h6>
                    {card.lines.map((line) => (
                      <p key={line.text}>
                        {line.href ? <a href={line.href}>{line.text}</a> : line.text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.formSection}
          style={
            settings.contact_form_bg_url
              ? { backgroundImage: `url('${settings.contact_form_bg_url}')` }
              : undefined
          }
        >
          <div className={styles.formOverlay} />
          <div className={styles.container}>
            <ContactForm />
          </div>

          {settings.contact_address && (
            <div className={styles.mapCard}>
              {settings.contact_map_logo_url && (
                <div className={styles.mapThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.contact_map_logo_url} alt="" />
                </div>
              )}
              <div>
                <h4>Address:</h4>
                <p>{settings.contact_address}</p>
                {mapsQuery && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Maps
                  </a>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
