import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import Checklist from "@/components/Checklist";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import ServiceFinder from "./ServiceFinder";
import styles from "./nrb.module.css";

export const metadata = {
  title: "NRB",
  description:
    "Own, develop, or manage property in Dhaka and Chattogram with secure, transparent, and hassle-free real estate support from KBS.",
};

const SERVICES = [
  {
    title: "Choose a property",
    text: "Explore KBS homes in Dhaka and Chattogram with guidance for NRB buyers.",
    icon: "M4 21V9l8-5 8 5v12M4 21h16M9 21v-6h6v6",
  },
  {
    title: "Joint venture land development",
    text: "Develop suitable land through a trusted, structured, and experienced developer partnership.",
    icon: "M8 21h8M12 3v18M4 8l8-5 8 5M4 8v6a4 4 0 0 0 8 0M12 14a4 4 0 0 0 8 0V8",
  },
  {
    title: "Buy, Sell & Rent",
    text: "Get brokerage support for property buying, selling, and rental needs in Bangladesh.",
    icon: "M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4",
  },
  {
    title: "Security & Management",
    text: "Maintain and secure your property with reliable management support while you are abroad.",
    icon: "M12 2 4 5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10V5l-8-3Z",
  },
  {
    title: "Interior design & implementation",
    text: "Turn your apartment into a ready living space through design and implementation support.",
    icon: "M4 4h16v12H4V4Zm0 16h16M8 20v-4M16 20v-4",
  },
  {
    title: "Legal & documentation support",
    text: "Receive assistance with the procedures and documentation needed for a smoother property journey.",
    icon: "M6 2h9l5 5v15H6V2Zm9 0v5h5M9 12h6M9 16h6",
  },
];

const UNIQUE_LEFT = [
  "Ensuring the experience of joyful homeownership",
  "Secured and hassle-free investment opportunity",
  "Hassle-free maintenance of property",
  "Wide range of choices for homes",
  "Reliable developer with 43 years of experience",
];

const UNIQUE_RIGHT = [
  "Communication is just one click away!",
  "Simplifies life with seamless services",
  "Ensuring complete real estate solutions",
  "Transparency in payments",
];

export default async function NrbPage() {
  const [footerLinks, socialLinks] = await Promise.all([getFooterLinks(), getSocialLinks()]);

  return (
    <>
      <Header />
      <main>
        <PageBanner
          image="/wp-content/uploads/2026/06/nrb-hero-062232.webp"
          title="Making homeownership a joyful experience"
          subtitle="Own, develop, or manage property in Dhaka and Chattogram with secure, transparent, and hassle-free real estate support from KBS."
          dark
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.introGrid}>
              <div className={styles.introCard}>
                <p className={styles.quote}>
                  For each road will lead along—
                  <br />
                  Every wish made upon the land we belong.
                </p>
                <p>
                  Are you an NRB looking for an apartment in Dhaka or Chattogram? Do you have
                  more than 5 katha land that you want to develop? Do you want to maintain your
                  property? Do you want to keep it secure?
                </p>
                <p>
                  To ensure a joyful experience in property investment and management, KBS has
                  come up with solutions handpicked for you. From assisting with legal
                  procedures to providing end-to-end real estate solutions, KBS helps you own,
                  make, and maintain properties in Bangladesh with ease and confidence.
                </p>
              </div>
              <img
                className={styles.introImage}
                src="/wp-content/uploads/2026/06/nrb-content-2-045186.webp"
                alt="KBS home ownership experience"
              />
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <span className={styles.subTitle}>We offer</span>
            <h2 className={styles.heading}>Complete real estate solutions for NRBs</h2>
            <p className={styles.note}>
              Choose the support you need, from finding a home to developing land, managing
              property, or designing interiors.
            </p>

            <div className={styles.serviceGrid}>
              {SERVICES.map((service) => (
                <div key={service.title} className={styles.serviceCard}>
                  <span className={styles.serviceIcon}>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={service.icon} />
                    </svg>
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.uniqueGrid}>
              <div>
                <span className={styles.subTitle}>What makes us unique?</span>
                <h2 className={styles.heading}>
                  High Quality of Construction. Design Excellence. Reliability.
                  Customer-centricity.
                </h2>
                <p>
                  NRBs need clarity, trust, and easy communication. KBS brings multiple real
                  estate services under one reliable platform so your property decision feels
                  secure and manageable.
                </p>
              </div>
              <div className={styles.uniqueLists}>
                <Checklist items={UNIQUE_LEFT} />
                <Checklist items={UNIQUE_RIGHT} />
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.contactGrid}>
              <div>
                <span className={styles.subTitle}>Call for details</span>
                <h2 className={styles.heading}>Find the right NRB service</h2>
                <p>
                  Talk to KBS for support with buying, developing, maintaining, securing, or
                  designing your property in Bangladesh.
                </p>
                <div className={styles.contactCards}>
                  <a className={styles.contactCard} href="tel:16604">
                    <span className={styles.contactIcon} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
                      </svg>
                    </span>
                    <div>
                      <strong>16604</strong>
                      <span>Call KBS for details</span>
                    </div>
                  </a>
                  <a
                    className={styles.contactCard}
                    href="https://wa.me/+8801313401405"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={styles.contactIcon} aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
                      </svg>
                    </span>
                    <div>
                      <strong>+8801313401405</strong>
                      <span>WhatsApp support</span>
                    </div>
                  </a>
                </div>
              </div>
              <ServiceFinder />
            </div>
          </div>
        </section>
      </main>
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
