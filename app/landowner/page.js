import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import Carousel from "@/components/Carousel";
import Accordion from "@/components/Accordion";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import Fancybox from "@/components/Fancybox";
import LandownerContactForm from "./LandownerContactForm";
import styles from "./landowner.module.css";

export const metadata = {
  title: "Landowner",
  description:
    "Develop your land with KBS, a trusted joint venture partner with over four decades of experience in Bangladesh real estate.",
};

const REVIEWS = [
  {
    name: "S M Zulkarnine",
    role: "Landowner of Casa Palmera",
    text: "After extensively consulting my peers, I found KBS's reputation for sound structures to be a solid reason to move forward.",
  },
  {
    name: "Air Vice Marshal A G Mahmud (Retd.)",
    role: "Landowner",
    text: "After consulting my peers, I found that KBS has a legacy of on-time handovers. That is what convinced me.",
  },
  {
    name: "Md. Shafiqul Anwar",
    role: "Landowner of Royal Oaks",
    text: "KBS stays true to its commitment, guaranteeing on-time or even ahead of schedule handover, a trait that is rare.",
  },
  {
    name: "Mr. Aminul Haq Jashim",
    role: "Landowner of Grand Nawab",
    text: "If you have land in Chattogram that you want to be developed with on-time handover and fantastic quality, KBS is the partner.",
  },
  {
    name: "Mr. Anwarul Islam Tarique",
    role: "Landowner of Palacio",
    text: "Thanks to KBS and their amazing team for giving us exactly what we were looking for — great quality of construction.",
  },
  {
    name: "Refat Rehan Mahmud",
    role: "Landowner of Domus, Bashundhara R/A",
    text: "I would like to extend my gratitude to you personally for your outstanding leadership throughout the project.",
  },
  {
    name: "Md. Abdul Hye",
    role: "Landowner of KBS Chorus and KBS Rosemary",
    text: "Mr. Joyram Sen and Mr. Iftikharul Anam are engaged to ensure our maintenance needs are always met promptly.",
  },
  {
    name: "Sultana Nazmun Nahar",
    role: "Landowner of Royale Gardenia, Banani",
    text: "I am the landowner of The Royal Gardenia Banani. I would like to thank KBS for their continued support.",
  },
];

const FAQS = [
  {
    question: "Q: What does DAP mean?",
    answer:
      "DAP means Detail Area Planning. The general objectives of DAP are to implement the provisions of the DMDP Structure Plan (SP) and Urban Area Plan (UAP) policies and recommendations.",
  },
  {
    question: "Q: What is FAR?",
    answer:
      "The floor area ratio (FAR) is the ratio of a building's total floor area to the size of the land. Written as a formula, FAR = gross floor building area ÷ area of the plot.",
  },
  {
    question: "Q: What affects FAR and the maximum construction area?",
    answer:
      "The maximum ground coverage depends on land size and the width of the entrance road. Front road width also affects FAR values. In short, land area multiplied by FAR value gives the maximum construction area of a building.",
  },
  {
    question: "Q: How many parking spaces will be available?",
    answer:
      "The number of parking spaces depends on land size, land shape, building height, basement provision, car lift, park lift and other factors. This is determined on a case-by-case basis.",
  },
  {
    question: "Q: What needs to be considered for basement construction?",
    answer:
      "Basement construction is generally expensive and requires careful execution to avoid water leakage and dampness. For smaller plots below 8 Katha, basements are generally not feasible. For larger plots, basements may be necessary for parking.",
  },
  {
    question: "Q: What is space sharing?",
    answer:
      "Space sharing refers to the use of space in a building by the landowner and the developer. It depends on mutual understanding, land value, selling price, apartment units and agreed signing money.",
  },
  {
    question: "Q: How is the distribution of floors done?",
    answer:
      "Floor distribution is done through mutual understanding between the landowner and the developer. Both parties choose floors as per the merit or value of the property.",
  },
  {
    question: "Q: How is apartment size measured?",
    answer:
      "The apartment size is the net floor area of the apartment plus the common areas as specified in the Real Estate Management Act 2010.",
  },
  {
    question: "Q: Which areas are considered common space?",
    answer:
      "Lift lobby, staircase room, lift machine room, generator room, sub-station room, caretaker's room, guard room and common facilities such as gym, prayer room, library room, guest waiting area and reception are considered common space.",
  },
  {
    question: "Q: What are the considerations for plan approval?",
    answer:
      "In Dhaka, RAJUK and Cantonment Board are the final authorities for plan approval, and in Chattogram, it is CDA. Approval depends on factors such as building height, road width, number of apartments, land status and permissions from concerned authorities.",
  },
  {
    question: "Q: How is fire protection ensured?",
    answer:
      "Fire protection is ensured through essential firefighting tools such as fire extinguishers, fire hydrants and sprinklers. A fire staircase is mandatory as per BNBC rules.",
  },
  {
    question: "Q: How does KBS make buildings earthquake-resistant?",
    answer:
      "KBS follows the BNBC code for earthquake protection. Beyond implementing BNBC code, KBS has introduced the jacketing system, a scientifically proven method for earthquake-resistant design.",
  },
  {
    question: "Q: Do you test materials or concrete strength?",
    answer:
      "KBS carries out appropriate testing to ensure materials are of high quality. Certain materials such as steel bars and concrete strength are tested through BUET.",
  },
  {
    question: "Q: When will possession or handover for construction happen?",
    answer:
      "Possession or handover is subject to mutual understanding between the developer and landowner. Generally, construction possession is required after the plan has been approved by the concerned authority.",
  },
  {
    question: "Q: What is the maintenance service policy?",
    answer:
      "KBS provides a 1-year free after-sales service to apartment owners for maintenance and upkeep of apartments.",
  },
];

export default async function LandownerPage() {
  const [footerLinks, socialLinks] = await Promise.all([getFooterLinks(), getSocialLinks()]);

  return (
    <>
      <Header />
      <main>
        <PageBanner
          image="/wp-content/uploads/2026/06/landowner-hero-765299.webp"
          title="Develop your land with confidence"
          subtitle="Dealing with real estate developers in Bangladesh is often complex and risky, but KBS has made the joint venture process easier, transparent, and hassle-free for landowners."
          dark
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.infoGrid}>
              <img
                className={styles.infoImage}
                src="/wp-content/uploads/2026/06/landowner-c-143812.webp"
                alt="KBS land development partnership"
              />
              <div>
                <h2 className={styles.heading}>Why choose KBS as a partner to develop your land?</h2>
                <p className={styles.text}>
                  Dealing with real estate developers in Bangladesh can be difficult to
                  navigate. Even though the joint venture process can be complicated &
                  bureaucratic, we have simplified it, making it hassle-free. We firmly believe
                  that no one else can offer our level of expertise, as do our partnered
                  landowners. Read about their experience with us & take a look through some of
                  our finished projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={`${styles.infoGrid} ${styles.reverse}`}>
              {/* The original's markup is
                   <a class="landowner-process-video popup-video"
                      href="https://www.youtube.com/watch?v=GtL1FD4DhOk"
                      aria-label="Watch bti landowner video">
                     <img src="https://img.youtube.com/vi/GtL1FD4DhOk/maxresdefault.jpg" ...>
                     <span class="landowner-video-play"><i class="fa-solid fa-play"></i></span>
                   </a>
                 `popup-video` is the same hook the homepage video uses, and
                 main.min.js binds BOTH through one call:
                   Fancybox.bind(".popup-video", {dragToClose:false})
                 so the click opens the YouTube lightbox in place. The clone
                 had this as a plain target="_blank" link, which navigated the
                 user off the site instead. */}
              <Fancybox selector=".popup-video" options={{ dragToClose: false }} />
              <a
                className={`${styles.videoThumb} popup-video`}
                href="https://www.youtube.com/watch?v=GtL1FD4DhOk"
                aria-label="Watch KBS landowner video"
              >
                <img
                  src="https://img.youtube.com/vi/GtL1FD4DhOk/maxresdefault.jpg"
                  alt="KBS landowner partnership video"
                />
                <span>
                  <i className="fa-solid fa-play" />
                </span>
              </a>
              <div>
                <h2 className={styles.heading}>How is KBS different?</h2>
                <p className={styles.text}>
                  KBS is one of the few companies known for being trustworthy as a joint
                  venture partner for developing your land. As one of the pioneers in the
                  sector, we have retained our position as a top real estate developer and have
                  built this reputation of reliability over the good part of half a century.
                </p>
                <p className={styles.text}>
                  We fully understand your dilemma and know how to tackle the complex systems
                  involved in developing your property. Our vast experience has left us in a
                  better position than most, to empathize and take care of all your concerns
                  regarding the big decision to develop your land.
                </p>
                <p className={styles.text}>
                  With a specialized customer service team along with architects, engineers,
                  and logistic support, we work to make the process stress-free for you and
                  continue to be at your service for years to come.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <h2 className={styles.headingCenter}>What landowners say about KBS</h2>
            <Carousel ariaLabel="Landowner reviews">
              {REVIEWS.map((review) => (
                <div key={review.name} className={styles.reviewCard}>
                  <div className={styles.stars}>★★★★★</div>
                  <p>&ldquo;{review.text}&rdquo;</p>
                  <div className={styles.reviewProfile}>
                    <div className={styles.avatar}>{review.name.charAt(0)}</div>
                    <div>
                      <strong>{review.name}</strong>
                      <span>{review.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.headingCenter}>Frequently asked questions</h2>
            <div className={styles.faqWrap}>
              <Accordion items={FAQS} />
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.contactGrid}>
              <div>
                <h2 className={styles.heading}>Get in touch</h2>
                <p className={styles.text}>
                  Entrust KBS as your joint venture partner. Be a part of KBS, the leading real
                  estate developer in Bangladesh.
                </p>
                <div className={styles.contactCards}>
                  <div className={styles.contactCard}>
                    <svg className={styles.contactIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
                    </svg>
                    <div>
                      <strong>16604</strong>
                      <span>+8809813191919</span>
                    </div>
                  </div>
                  <div className={styles.contactCard}>
                    <svg className={styles.contactIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 6.5-9 12-9 12s-9-5.5-9-12a9 9 0 0 1 18 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <strong>KBS Celebration Point</strong>
                      <span>Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212</span>
                    </div>
                  </div>
                </div>
              </div>
              <LandownerContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
