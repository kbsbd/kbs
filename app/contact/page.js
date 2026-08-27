import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import ContactForm from "./ContactForm";
import styles from "./contact.module.css";

export const metadata = {
  title: "Contact",
  description: "Get in touch with KBS — address, phone, email, and a direct message form.",
};

const INFO_CARDS = [
  {
    icon: "M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
    title: "Our address",
    lines: ["KBS Celebration Point, Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212"],
  },
  {
    icon: "M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1H7.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1.1L6.6 10.8Z",
    title: "Phone number",
    lines: [
      { text: "16604", href: "tel:16604" },
      { text: "+8809613191919", href: "tel:+8809613191919" },
      { text: "+8801313401405 (WhatsApp)", href: "tel:+8801313401405" },
    ],
  },
  {
    icon: "M2 4h20v16H2V4Zm2 2v.5l8 5.5 8-5.5V6H4Zm16 3.1-7.4 5.1a1 1 0 0 1-1.2 0L4 9.1V18h16V9.1Z",
    title: "Email address",
    lines: [{ text: "info@kbs.com", href: "mailto:info@kbs.com" }],
  },
];

export default async function ContactPage() {
  const [footerLinks, socialLinks] = await Promise.all([getFooterLinks(), getSocialLinks()]);
  const mapsQuery = encodeURIComponent("KBS Celebration Point, Gulshan-2, Dhaka-1212");

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.introSection}>
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>Get in touch</h1>
            <div className={styles.infoGrid}>
              {INFO_CARDS.map((card) => (
                <div key={card.title} className={styles.infoCard}>
                  <span className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d={card.icon} />
                    </svg>
                  </span>
                  <div>
                    <h6>{card.title}</h6>
                    {card.lines.map((line) =>
                      typeof line === "string" ? (
                        <p key={line}>{line}</p>
                      ) : (
                        <p key={line.text}>
                          <a href={line.href}>{line.text}</a>
                        </p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className={styles.formSection}
          style={{
            backgroundImage:
              "url('/wp-content/themes/bti-new-properties-special/assets/img/demo/contact-us-form-bg.webp')",
          }}
        >
          <div className={styles.formOverlay} />
          <div className={styles.container}>
            <ContactForm />
          </div>

          <div className={styles.mapCard}>
            <div className={styles.mapThumb}>
              <img
                src="/wp-content/themes/bti-new-properties-special/assets/img/demo/bti-icon-logo-white.webp"
                alt=""
              />
            </div>
            <div>
              <h4>Address:</h4>
              <p>KBS Celebration Point, Plot – 3 & 5, Road – 113/A, Gulshan-2, Dhaka-1212.</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Maps
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
