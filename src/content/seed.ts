/**
 * Seed content for the KBS site.
 *
 * Every string here is the default that ships before anyone touches the admin
 * dashboard. The dashboard writes overrides into Supabase (table `site_content`,
 * one row per key) and those win at render time. Nothing here is hardcoded into
 * a component, so the client can change any of it without a deploy.
 *
 * Copy is verbatim from design/design-package.md and must not be paraphrased.
 */

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** A string that exists in both languages. */
export type L = Record<Locale, string>;

/** English now, Bengali later: used by pages whose copy is not translated yet. */
export const soon = (en: string): L => ({ en, bn: en });

export type HeroBand = {
  id: string;
  /** scroll progress through the pinned hero, 0..1 */
  from: number;
  to: number;
  /** which entrance personality this beat uses */
  entrance:
    | "drift-down"
    | "halves-parting"
    | "grid-snap"
    | "word-punch"
    | "approach-depth"
    | "staged-settle";
  /** optional overrides, tuned from markup without touching the band math */
  ramp?: number;
  spread?: number;
  /** peak alpha of this band's scrim, tuned against its own worst frame */
  scrim: number;
  /** which side of frame the text sits on, so the action lane stays clear */
  lane: "left" | "right" | "center";
  kicker?: L;
  head: L;
  sub?: L;
  cta?: L;
};

export const heroBands: HeroBand[] = [
  {
    id: "look-up",
    from: 0.0,
    to: 0.12,
    entrance: "drift-down",
    scrim: 0.68,
    lane: "left",
    kicker: { en: "KB HOUSE · DHAKA", bn: "কেবি হাউস · ঢাকা" },
    head: { en: "Look up.", bn: "উপরে তাকান।" },
    sub: {
      en: "Every floor of this one has a garden on it.",
      bn: "এই ভবনের প্রতিটি তলাতেই একটি বাগান আছে।",
    },
  },
  {
    id: "air-first",
    from: 0.15,
    to: 0.28,
    entrance: "halves-parting",
    scrim: 0.68,
    lane: "left",
    head: { en: "Air first.", bn: "আগে বাতাস।" },
    sub: {
      en: "The block is set back and opened up, so light and breeze reach the lower floors, not just the top ones.",
      bn: "ভবনটি পিছিয়ে বসানো ও খোলা রাখা, যাতে আলো-বাতাস কেবল উপরের তলায় নয়, নিচের তলাগুলোতেও পৌঁছায়।",
    },
  },
  {
    id: "cut-open",
    from: 0.3,
    to: 0.43,
    entrance: "grid-snap",
    spread: 0.55,
    scrim: 0.64,
    lane: "left",
    head: { en: "Cut it open.", bn: "ভেতরটা দেখুন।" },
    sub: {
      en: "Nine floors. Every single one has its own planted terrace.",
      bn: "নয় তলা। প্রতিটিতেই নিজস্ব সবুজ বারান্দা।",
    },
  },
  {
    id: "balcony",
    from: 0.45,
    to: 0.55,
    entrance: "word-punch",
    scrim: 0.76,
    lane: "left",
    head: {
      en: "A balcony you actually use.",
      bn: "বারান্দা, যেটা সত্যিই ব্যবহার হয়।",
    },
    sub: {
      en: "Deep enough for a table, two chairs, and something growing.",
      bn: "একটা টেবিল, দুটো চেয়ার আর কিছু গাছ রাখার মতো যথেষ্ট গভীর।",
    },
  },
  {
    id: "roof",
    from: 0.57,
    to: 0.7,
    entrance: "approach-depth",
    scrim: 0.66,
    lane: "left",
    head: { en: "The roof is yours too.", bn: "ছাদটাও আপনার।" },
    sub: {
      en: "Pool, open deck, and evening air nine floors up.",
      bn: "সুইমিং পুল, খোলা ডেক, আর নয় তলা উপরের সন্ধ্যার বাতাস।",
    },
  },
  {
    id: "settle",
    from: 0.79,
    to: 1.0,
    entrance: "staged-settle",
    ramp: 0.1,
    scrim: 0.84,
    lane: "left",
    head: { en: "KB HOUSE", bn: "কেবি হাউস" },
    sub: {
      en: "Under construction now. Come and walk it before it is finished.",
      bn: "এখন নির্মাণাধীন। শেষ হওয়ার আগেই এসে ঘুরে দেখুন।",
    },
    cta: { en: "Book a site visit", bn: "সাইট ভিজিট বুক করুন" },
  },
];

export const staticHero = {
  image: "tower-portrait",
  kicker: { en: "KB HOUSE · DHAKA", bn: "কেবি হাউস · ঢাকা" },
  head: { en: "Every floor gets a garden.", bn: "প্রতিটি তলায় একটি বাগান।" },
  sub: {
    en: "Nine floors, each with its own planted terrace. Under construction in Dhaka now.",
    bn: "নয় তলা, প্রতিটিতেই নিজস্ব সবুজ বারান্দা। ঢাকায় এখন নির্মাণাধীন।",
  },
  cta: { en: "Book a site visit", bn: "সাইট ভিজিট বুক করুন" },
};

export const nav = {
  /* An href starting with "/" is a page, "#" is a section on the home page;
     SiteChrome prefixes both with the active locale. This ordered list is what
     the DB-backed menu editor will take over once Supabase is connected. */
  links: [
    { href: "/services", label: soon("Services") },
    { href: "/shop", label: soon("Shop") },
    { href: "/kb-homes", label: soon("KB Homes") },
    { href: "/clients", label: soon("Clients") },
    { href: "/contact", label: soon("Contact") },
  ],
  cta: { en: "Book a visit", bn: "ভিজিট বুক করুন" },
  langLabel: { en: "বাংলা", bn: "English" },
};

export const premise = {
  image: "balconies-lowangle",
  kicker: { en: "THE IDEA", bn: "মূল ভাবনা" },
  head: {
    en: "A garden you do not have to go downstairs for.",
    bn: "এমন একটি বাগান, যার জন্য নিচে নামতে হয় না।",
  },
  body: {
    en: "Most towers put the green on the roof, where almost nobody goes. This one runs it up the face of the building, so it is outside your own door on every floor.",
    bn: "বেশিরভাগ ভবনে সবুজ থাকে ছাদে, যেখানে প্রায় কেউই যায় না। এখানে সবুজ উঠে গেছে ভবনের গায়ে, তাই প্রতিটি তলায় সেটা আপনার দরজার ঠিক বাইরেই।",
  },
};

/** Every spec is admin-editable. Values here are the starting point, not a claim. */
export const building = {
  image: "aerial-context",
  kicker: { en: "THE BUILDING", bn: "ভবনটি" },
  head: { en: "KB HOUSE, in numbers.", bn: "কেবি হাউস, সংখ্যায়।" },
  specs: [
    {
      id: "floors",
      label: { en: "Floors", bn: "তলা" },
      value: { en: "9", bn: "৯" },
    },
    {
      id: "units",
      label: { en: "Apartments", bn: "অ্যাপার্টমেন্ট" },
      value: { en: "To be confirmed", bn: "নিশ্চিত করা হবে" },
    },
    {
      id: "size",
      label: { en: "Apartment size", bn: "ফ্ল্যাটের আয়তন" },
      value: { en: "To be confirmed", bn: "নিশ্চিত করা হবে" },
    },
    {
      id: "status",
      label: { en: "Status", bn: "অবস্থা" },
      value: { en: "Under construction", bn: "নির্মাণাধীন" },
    },
    {
      id: "location",
      label: { en: "Location", bn: "অবস্থান" },
      value: { en: "Dhaka", bn: "ঢাকা" },
    },
    {
      id: "terraces",
      label: { en: "Planted terraces", bn: "সবুজ বারান্দা" },
      value: { en: "One per floor", bn: "প্রতি তলায় একটি" },
    },
  ],
};

export const balcony = {
  kicker: { en: "PRESS AND HOLD", bn: "চেপে ধরে রাখুন" },
  head: { en: "Let it grow.", bn: "বেড়ে উঠতে দিন।" },
  body: {
    en: "Hold the button. This is what a planted terrace does to a balcony you would otherwise use for drying clothes.",
    bn: "বোতামটি চেপে ধরুন। একটি সাধারণ বারান্দা, যেটা হয়তো কাপড় শুকাতেই ব্যবহার হতো, সবুজ হলে কেমন দাঁড়ায় দেখুন।",
  },
  hold: { en: "Hold to grow", bn: "চেপে ধরুন" },
  done: { en: "That is every floor.", bn: "প্রতিটি তলাতেই এমন।" },
};

export const amenities = {
  kicker: { en: "WHAT IS IN IT", bn: "যা যা আছে" },
  head: { en: "Shared space that gets used.", bn: "যে সাধারণ জায়গাগুলো সত্যিই কাজে লাগে।" },
  items: [
    {
      id: "pool",
      image: "pool-deck",
      title: { en: "Rooftop pool and deck", bn: "ছাদের সুইমিং পুল ও ডেক" },
      body: {
        en: "Open water and a shaded deck, nine floors above the traffic.",
        bn: "খোলা জল আর ছায়াঢাকা ডেক, রাস্তার শব্দ থেকে নয় তলা উপরে।",
      },
    },
    {
      id: "gym",
      image: "gym",
      title: { en: "Gym", bn: "জিম" },
      body: {
        en: "Full height glass on the long wall, so it is a room you will actually walk into.",
        bn: "লম্বা দেয়াল জুড়ে কাচ, তাই ঘরটায় ঢুকতে ইচ্ছে করবে।",
      },
    },
    {
      id: "water-garden",
      image: "water-garden",
      title: { en: "Water garden", bn: "জলবাগান" },
      body: {
        en: "Moving water at the entrance, which cools the air and covers the road noise.",
        bn: "প্রবেশপথে বয়ে চলা জল, যা বাতাস ঠান্ডা রাখে আর রাস্তার শব্দ ঢেকে দেয়।",
      },
    },
    {
      id: "terrace",
      image: "pool-terrace",
      title: { en: "Covered terrace", bn: "ছাউনি দেওয়া বারান্দা" },
      body: {
        en: "Shade over the pool edge for the months when open sky is too much.",
        bn: "পুলের ধারে ছায়া, যে মাসগুলোয় খোলা রোদ সহ্য হয় না।",
      },
    },
    {
      id: "balconies",
      image: "facade-balconies",
      title: { en: "Planted balconies", bn: "সবুজ বারান্দা" },
      body: {
        en: "One on every floor, deep enough to sit in rather than look at.",
        bn: "প্রতি তলায় একটি, দেখার জন্য নয়, বসার মতো গভীর।",
      },
    },
  ],
  /** Text-only entries until real renders exist. Admin can attach an image later. */
  listed: [
    { id: "parking", label: { en: "Parking", bn: "পার্কিং" } },
    { id: "generator", label: { en: "Standby generator", bn: "স্ট্যান্ডবাই জেনারেটর" } },
    { id: "lift", label: { en: "Lift", bn: "লিফট" } },
    { id: "security", label: { en: "24 hour security", bn: "২৪ ঘণ্টা নিরাপত্তা" } },
  ],
};

export const trust = {
  kicker: { en: "BEFORE YOU BUY", bn: "কেনার আগে" },
  head: {
    en: "Ask any builder for these. Including us.",
    bn: "যেকোনো ডেভেলপারের কাছে এগুলো চান। আমাদের কাছেও।",
  },
  items: [
    { en: "Title deed", bn: "দলিল" },
    { en: "Khatiyan", bn: "খতিয়ান" },
    { en: "Mutation certificate", bn: "নামজারি" },
    { en: "The approved building plan", bn: "অনুমোদিত নকশা" },
    { en: "Utility NOCs", bn: "ইউটিলিটি ছাড়পত্র" },
    { en: "The name of the structural engineer", bn: "স্ট্রাকচারাল ইঞ্জিনিয়ারের নাম" },
    { en: "The soil test report", bn: "মাটি পরীক্ষার রিপোর্ট" },
    {
      en: "And the clause that says what happens if we hand over late",
      bn: "আর হস্তান্তরে দেরি হলে কী হবে, সেই শর্তটি",
    },
  ],
  body: {
    en: "Ask for all of it, from us and from everyone else you are talking to. A builder who hesitates has told you something.",
    bn: "আমাদের কাছে এবং আপনি যাদের সঙ্গে কথা বলছেন তাদের সবার কাছেই এগুলো চান। যে ডেভেলপার ইতস্তত করে, সে আপনাকে অনেক কিছু বলে দিল।",
  },
  since: {
    en: "KBS has been building in this country since 1995.",
    bn: "কেবিএস ১৯৯৫ সাল থেকে এই দেশে নির্মাণ করছে।",
  },
};

export const faq = {
  kicker: { en: "QUESTIONS", bn: "প্রশ্ন" },
  head: { en: "The things people actually ask.", bn: "মানুষ আসলে যা জিজ্ঞেস করে।" },
  items: [
    {
      id: "handover",
      q: { en: "When is handover?", bn: "হস্তান্তর কবে?" },
      a: {
        en: "The building is under construction now. Ask us for the current target date in writing, and ask for it in the agreement rather than in conversation.",
        bn: "ভবনটি এখন নির্মাণাধীন। বর্তমান সম্ভাব্য তারিখ লিখিতভাবে চেয়ে নিন, এবং সেটি কথায় নয়, চুক্তিতে রাখুন।",
      },
    },
    {
      id: "late",
      q: { en: "What happens if you are late?", bn: "দেরি হলে কী হবে?" },
      a: {
        en: "That belongs in the agreement, not on a website. Ask to read the delay clause before you pay anything, and ask what it pays you if the date slips.",
        bn: "এটি ওয়েবসাইটে নয়, চুক্তিতে থাকা উচিত। টাকা দেওয়ার আগে দেরির শর্তটি পড়ে নিন, আর তারিখ পিছিয়ে গেলে আপনি কী পাবেন তা জেনে নিন।",
      },
    },
    {
      id: "price",
      q: { en: "What does the price include?", bn: "দামের মধ্যে কী কী আছে?" },
      a: {
        en: "Ask for the split between carpet area and built up area, and for a written list of everything outside the quoted price: parking, utility connections, registration and any transfer costs.",
        bn: "কার্পেট এরিয়া ও বিল্ট-আপ এরিয়ার হিসাব আলাদা করে চান, আর উল্লিখিত দামের বাইরে যা যা আছে তার লিখিত তালিকা নিন: পার্কিং, ইউটিলিটি সংযোগ, রেজিস্ট্রেশন ও হস্তান্তর খরচ।",
      },
    },
    {
      id: "service",
      q: { en: "What is the monthly service charge?", bn: "মাসিক সার্ভিস চার্জ কত?" },
      a: {
        en: "Ask for the figure and for what it covers, including generator fuel, lift maintenance, security and cleaning of the shared areas.",
        bn: "পরিমাণ এবং তাতে কী কী অন্তর্ভুক্ত তা জেনে নিন: জেনারেটরের জ্বালানি, লিফট রক্ষণাবেক্ষণ, নিরাপত্তা ও সাধারণ জায়গার পরিচ্ছন্নতা।",
      },
    },
    {
      id: "structure",
      q: { en: "Is it earthquake resistant?", bn: "ভূমিকম্প সহনীয় কি?" },
      a: {
        en: "Ask for the name of the structural engineer, the soil test report, and confirmation that the design follows the Bangladesh National Building Code. Ask every developer this, not only us.",
        bn: "স্ট্রাকচারাল ইঞ্জিনিয়ারের নাম, মাটি পরীক্ষার রিপোর্ট এবং নকশাটি বাংলাদেশ ন্যাশনাল বিল্ডিং কোড মেনে করা হয়েছে কিনা তা জেনে নিন। শুধু আমাদের নয়, প্রত্যেক ডেভেলপারকেই জিজ্ঞেস করুন।",
      },
    },
    {
      id: "visit",
      q: {
        en: "Can I see the site while it is being built?",
        bn: "নির্মাণ চলাকালীন সাইট দেখা যাবে?",
      },
      a: {
        en: "Yes. That is what the booking form on this page is for. Seeing a site mid construction tells you more than any render can.",
        bn: "হ্যাঁ। এই পাতার বুকিং ফর্মটি সেজন্যই। নির্মাণ চলাকালীন সাইট দেখলে যা বোঝা যায়, কোনো থ্রিডি ছবিতে তা বোঝা যায় না।",
      },
    },
    {
      id: "loan",
      q: { en: "Can I get bank financing?", bn: "ব্যাংক ঋণ পাওয়া যাবে?" },
      a: {
        en: "Home loans are available in Bangladesh for apartments with clean documentation. Bring the document list above to your bank and they will tell you quickly.",
        bn: "কাগজপত্র ঠিক থাকলে বাংলাদেশে ফ্ল্যাটের জন্য গৃহঋণ পাওয়া যায়। উপরের কাগজের তালিকাটি নিয়ে আপনার ব্যাংকে যান, তারা দ্রুত জানিয়ে দেবে।",
      },
    },
  ],
};

export const projects = {
  kicker: { en: "MORE FROM KBS", bn: "কেবিএস-এর আরও কাজ" },
  head: { en: "Other projects.", bn: "অন্যান্য প্রকল্প।" },
  empty: {
    en: "More KBS projects are being added here.",
    bn: "কেবিএস-এর আরও প্রকল্প এখানে যুক্ত হচ্ছে।",
  },
  /** Admin adds rows to the `projects` table. Ships empty and the section hides itself. */
  items: [] as Array<{
    id: string;
    image: string;
    title: L;
    location: L;
    status: L;
  }>,
};

export const book = {
  kicker: { en: "COME AND SEE IT", bn: "এসে দেখে যান" },
  head: { en: "Book a site visit.", bn: "সাইট ভিজিট বুক করুন।" },
  body: {
    en: "Pick a day. We will meet you at the site and walk you through what is built so far.",
    bn: "একটি দিন বেছে নিন। আমরা সাইটে আপনার সঙ্গে দেখা করব এবং এখন পর্যন্ত যা তৈরি হয়েছে ঘুরে দেখাব।",
  },
  fields: {
    name: { en: "Your name", bn: "আপনার নাম" },
    phone: { en: "Phone number", bn: "ফোন নম্বর" },
    date: { en: "Preferred day", bn: "পছন্দের দিন" },
    lang: { en: "Talk to me in", bn: "যে ভাষায় কথা বলবেন" },
    message: { en: "Anything you want to ask (optional)", bn: "কিছু জিজ্ঞেস করার থাকলে (ঐচ্ছিক)" },
  },
  submit: { en: "Book the visit", bn: "ভিজিট বুক করুন" },
  sending: { en: "Sending", bn: "পাঠানো হচ্ছে" },
  successHead: { en: "Got it. We will call you.", bn: "পেয়েছি। আমরা ফোন করব।" },
  successBody: {
    en: "Someone from the KBS office will ring you on the number you gave, usually the same working day.",
    bn: "কেবিএস অফিস থেকে আপনার দেওয়া নম্বরে ফোন করা হবে, সাধারণত একই কর্মদিবসেই।",
  },
  errorBody: {
    en: "That did not send. Please try again, or call the office number in the footer.",
    bn: "পাঠানো যায়নি। আবার চেষ্টা করুন, অথবা নিচে দেওয়া অফিসের নম্বরে ফোন করুন।",
  },
};

/** All admin-editable. Blank values simply do not render. */
export const site = {
  name: "KBS",
  founded: "1995",
  tagline: {
    en: "Building in Bangladesh since 1995.",
    bn: "১৯৯৫ সাল থেকে বাংলাদেশে নির্মাণ।",
  },
  phone: "+880 19 5402 2530",
  whatsapp: "+880 17 1073 7157",
  email: "Info@kbsbd.com",
  address: {
    en: "KB Homes, Faidabad, Dokhinkhan, Dhaka - 1230",
    bn: "KB Homes, Faidabad, Dokhinkhan, Dhaka - 1230",
  },
  mapEmbed: "",
  /** Footer social links. `platform` picks the icon; `label` is an optional
   *  override for the accessible name. Ships empty and the row hides itself. */
  socials: [] as Array<{ id: string; platform: string; label: string; href: string }>,
};

/**
 * Third-party integrations. All admin-editable, all blank by default — a blank
 * value loads no script and adds no tag, so a fresh install ships with zero
 * third parties. Verification fields accept either the bare code or the whole
 * <meta> tag pasted from the provider; the site pulls the code out either way.
 */
export const integrations = {
  /** GTM-XXXXXXX — the container. Once set, add any other tag through GTM. */
  gtmId: "",
  /** G-XXXXXXXXXX — GA4, for when GTM is not in use. */
  ga4Id: "",
  /** Numeric Meta (Facebook) Pixel id. Booking + contact submits fire Lead. */
  metaPixelId: "",
  /** Google Search Console, HTML-tag method. */
  googleSiteVerification: "",
  /** Bing Webmaster Tools, meta-tag method. */
  bingSiteVerification: "",
};

export const footer = {
  rights: { en: "All rights reserved.", bn: "সর্বস্বত্ব সংরক্ষিত।" },
  contactHead: { en: "Talk to us", bn: "যোগাযোগ" },
  visitHead: { en: "Come to the office", bn: "অফিসে আসুন" },
  addressMissing: {
    en: "Office address is being added.",
    bn: "অফিসের ঠিকানা যুক্ত করা হচ্ছে।",
  },
};

/* ============================================================
   Standalone pages (Kanchan Builders / KBS).
   English-only for now; the Bengali fields carry the same text
   and are filled in from the dashboard later. Every `image` is a
   bare Cloudinary/public stem and ships blank — the page renders
   a labelled placeholder until the admin attaches one.
   ============================================================ */

export const servicesPage = {
  kicker: soon("WHAT WE DO"),
  head: soon("Our services"),
  intro: [
    soon(
      "Welcome to Kanchan Builders. We are one of the leading Sanitary & Plumbing systems solution providing companies in the Bangladeshi market. For the last 36 years we have worked in this field, for a green world and to every international standard."
    ),
    soon(
      "We are an export-oriented, integrated Environmental Engineering and Trading company, specialising mainly in the water purifier and water treatment sector of Bangladesh. Since our foundation we have held to steady, deliberate growth as our guiding idea, and in a fiercely competitive market we have moved forward without pause to become one of the top-ranked water companies in the country."
    ),
    soon(
      "Our divisional structure lets us focus on the specific needs of each market. We bring quality products to our customers and build international brand awareness across our core sectors, and we have strengthened our place in the domestic distribution market by launching a series of strong foreign brands across the group's well-developed distribution network. Abiding by the principle of “Quality First, Service Perfect, Prestige Supreme”, we have built a capable young team, an advanced marketing system and global sourcing."
    ),
    soon(
      "The company has earned trust for its practical spirit and sound credit, and holds good relationships with financial institutions. It was awarded “Best Service Provider” by Vistara Architect. In a business environment that only grows more competitive and complex, we stay committed to the skills needed to evaluate, select and implement water treatment technologies — combining broad hands-on experience with the discipline of an engineering and contracting company."
    ),
  ] as L[],
  sisterHead: soon("Our sister concerns"),
  /** Admin lists the sister concerns here; ships empty and the block hides. */
  sisterConcerns: [] as Array<{ id: string; name: string; note: L }>,
  items: [
    {
      id: "plumbing-consultant",
      image: "",
      title: soon("Sanitary & Plumbing consultancy"),
      body: soon(
        "Plumbing consultancy for residential, commercial, industrial, hospital and every other sector. We deliver within an agreed timeframe, using up-to-date equipment and methods."
      ),
    },
    {
      id: "plumbing-works",
      image: "",
      title: soon("Sanitary & Plumbing works"),
      body: soon(
        "All types of sanitary and plumbing work, done with care for detail. Remodelling or new construction, we give you expert advice and professional help to change how a bathroom looks and works."
      ),
    },
    {
      id: "import-distribution",
      image: "",
      title: soon("Import & distribution"),
      body: soon(
        "Over the years we have built a reputation as a trustworthy dealer in sanitary ware and allied building materials. We import and distribute all kinds of sanitary and plumbing products, and our strength is the quality of the goods, fair pricing and the service we give our clients."
      ),
    },
    {
      id: "booster-pump",
      image: "",
      title: soon("Auto-pressurised booster pump"),
      body: soon(
        "A constant-pressure booster pump supplied as a complete package — drive, pump, motor and pressure switch. The domestic system is designed for small spaces, built in stainless steel, and runs smoothly and quietly."
      ),
    },
    {
      id: "core-hole-cutting",
      image: "",
      title: soon("Core hole cutting"),
      body: soon(
        "Our range of modern equipment lets us cut walls, floors and roadways — from thin material through to heavily reinforced concrete at any depth. Core drilling runs from ½″ up to 60″ for plumbing, duct work, structural and electrical installations, in concrete, block, asphalt, brick and steel."
      ),
    },
    {
      id: "deep-tubewell",
      image: "",
      title: soon("Deep tube well"),
      body: soon(
        "We have grown into one of the country's leading deep-tube-well contractors. Bangladesh soil is largely alluvial, so we use both direct water-jet and reverse-circulation boring, with casing pipes and chemicals to handle the cave-ins common in local ground conditions."
      ),
    },
    {
      id: "soft-water-plant",
      image: "",
      title: soon("Soft water treatment plant"),
      body: soon(
        "Removes hardness by ion exchange, recharging the resin with salt. Built from 1 m³/hr to 100 m³/hr and above, in a choice of materials of construction. Simple to operate and maintain, designed to the client's requirement, and easy to install."
      ),
    },
    {
      id: "recycle-water-plant",
      image: "",
      title: soon("Recycle water treatment plant"),
      body: soon(
        "Capable of recycling 100% of waste water. Whether the source is sewage or industrial effluent, the recycled water can be made fit for irrigation on the campus, or for washing, flushing, gardening and horticulture."
      ),
    },
    {
      id: "sewage-water-plant",
      image: "",
      title: soon("Sewage water treatment plant"),
      body: soon(
        "Built with proven technology for the effective removal of contaminants from sewage water. Our clients have approved these plants for high, fault-free performance."
      ),
    },
    {
      id: "cpvc-products",
      image: "",
      title: soon("CPVC products — import & distribution"),
      body: soon(
        "We import, distribute, wholesale and retail a broad range of CPVC pipe and fittings at economical prices, in a wide choice of specifications, and are a well-regarded supplier of CPVC pipe to our customers."
      ),
    },
  ] as Array<{ id: string; image: string; title: L; body: L }>,
};

export const clientsPage = {
  kicker: soon("SELECTED WORK"),
  head: soon("Clients we have worked with"),
  body: soon(
    "A selection of the developers, institutions and industrial clients we have delivered sanitary, plumbing and water-treatment work for over the last 36 years."
  ),
  empty: soon("Client logos are being added here."),
  /** Admin adds rows; ships empty and the grid shows the note above. */
  logos: [] as Array<{ id: string; name: string; image: string; href: string }>,
};

export const kbHomes = {
  kicker: soon("KB HOMES"),
  head: soon("A refined urban living experience"),
  intro: [
    soon(
      "KB Homes, in Faidabad, Dokhinkhan, Dhaka - 1230, offers a sophisticated blend of contemporary architecture and natural living, positioned conveniently close to Hazrat Shahjalal International Airport. The building carries a striking modern façade of clean geometric lines, open balconies and carefully integrated greenery."
    ),
    soon(
      "Designed to bring nature into everyday life, KB Homes works in abundant landscaping, lush green surroundings and thoughtfully placed plants throughout the building. The rooftop swimming pool is a refreshing retreat, and a dedicated community space encourages social interaction and a vibrant neighbourhood atmosphere."
    ),
    soon(
      "For comfort and uninterrupted living the building is equipped with a high-end lift, a generator facility and adequate car parking. Generous green areas add to the sense of openness and calm, giving residents a pleasant escape from the busy city around them."
    ),
    soon(
      "With its contemporary design, natural features, premium facilities and strategic location, KB Homes is envisioned as a modern residential destination that balances comfort, connectivity, elegance and greenery in one thoughtfully designed community."
    ),
  ] as L[],
  highlights: [
    soon("Rooftop swimming pool"),
    soon("Dedicated community space"),
    soon("High-end lift"),
    soon("Generator facility"),
    soon("Adequate car parking"),
    soon("Landscaped green areas"),
  ] as L[],
  address: soon("Faidabad, Dokhinkhan, Dhaka - 1230"),
  addressNote: soon("A short drive from Hazrat Shahjalal International Airport"),
  mapEmbed: "",
  cta: soon("Book a site visit"),
  /** Admin attaches renders and photos; ships empty. */
  gallery: [] as Array<{ id: string; image: string; caption: L }>,
};

export const contact = {
  kicker: soon("REACH US"),
  head: soon("Talk to us"),
  body: soon(
    "Send a message about a project, a product or a general enquiry and we will get back to you, usually the same working day."
  ),
  addressHead: soon("Address"),
  address: soon("KB Homes, Faidabad, Dokhinkhan, Dhaka - 1230"),
  emailHead: soon("Email"),
  phoneHead: soon("Call"),
  whatsappHead: soon("WhatsApp"),
  talkNow: soon("Prefer to talk now?"),
  fields: {
    name: soon("Your name"),
    email: soon("Email address"),
    phone: soon("Phone number"),
    topicLabel: soon("What is this about?"),
    topicGeneral: soon("General enquiry"),
    topicProject: soon("Project / full works inquiry"),
    topicProduct: soon("Product quote"),
    message: soon("How can we help?"),
    submit: soon("Send message"),
    sending: soon("Sending…"),
  },
  successHead: soon("Message sent."),
  successBody: soon(
    "Thank you. We will reply to the email address or phone number you gave, usually the same working day."
  ),
  errorBody: soon(
    "That did not send. Please try again, or email Info@kbsbd.com directly."
  ),
};

export const shop = {
  /** Master switch. Off = the Shop nav link and every /shop route 404. */
  enabled: true,
  kicker: soon("SHOP"),
  head: soon("Products"),
  body: soon(
    "Sanitary ware, plumbing fittings, pumps, CPVC pipe and water-treatment equipment — the same lines we install and distribute."
  ),
  emptyNote: soon("Products are being added here."),
  /** BDT throughout. Symbol is what shows next to a price. */
  currencySymbol: "৳",
  /** Flat delivery charge added at checkout; 0 hides the line. */
  flatShipping: 0,
  /** Order subtotal at or above this ships free; 0 disables the rule. */
  freeShippingOver: 0,
  /** "cod" collects an address, "quote" turns the cart into a quote request. */
  checkoutModes: ["quote", "cod"] as Array<"quote" | "cod" | "bkash" | "nagad" | "sslcommerz">,
  labels: {
    addToCart: soon("Add to cart"),
    buyNow: soon("Buy now"),
    outOfStock: soon("Out of stock"),
    inStock: soon("In stock"),
    lowStock: soon("Only a few left"),
    wishlist: soon("Save"),
    cart: soon("Cart"),
    checkout: soon("Checkout"),
    quoteCta: soon("Request a quote"),
    reviews: soon("Reviews"),
    writeReview: soon("Write a review"),
    relatedHead: soon("You might also need"),
  },
};

export const seed = {
  site,
  integrations,
  shop,
  nav,
  heroBands,
  staticHero,
  premise,
  building,
  balcony,
  amenities,
  trust,
  faq,
  projects,
  book,
  footer,
  servicesPage,
  clientsPage,
  kbHomes,
  contact,
};

export type SiteContent = typeof seed;
