/*
 * The three pages that shipped as hand-written React — About, NRB and
 * Landowner — expressed as data.
 *
 * GENERATED from the original page sources, not retyped: every paragraph,
 * list item, review and FAQ here is a verbatim copy of what those files
 * rendered before they moved into the page system.
 *
 * This one file serves three jobs, which is why it is worth its size:
 *   1. the fallback when the database has no row for that slug, so the pages
 *      keep rendering before migration 0008 is applied;
 *   2. the seed content in migration 0008 itself;
 *   3. the starting sections when an admin creates a new page and picks
 *      "About Us", "NRB" or "Landowner" as the style.
 *
 * Client-safe — no Supabase import — because the page-creation form reads the
 * preset list to build its dropdown.
 */

export const PAGE_PRESETS = {
  "about": {
    "slug": "about",
    "title": "About Us",
    "banner_title": "We don’t just make buildings. We’re in the business of customer satisfaction",
    "banner_subtitle": null,
    "banner_image_url": "/wp-content/themes/bti-new-properties-special/assets/img/demo/banner-about.webp",
    "template": "standard",
    "meta_title": "About Us",
    "meta_description": "KBS stands as one of the pioneers of Bangladesh's real estate sector, with a legacy of on-time handovers, high quality of construction, and excellent designs.",
    "sections": [
      {
        "kind": "legacy_split",
        "heading": "A Legacy of Excellence",
        "subheading": null,
        "body": "KBS stands as one of the pioneers of Bangladesh's real estate sector, raising standards of professionalism and integrity across the industry. With a legacy of on-time handovers, high quality of construction, and excellent designs, we have helped shape skylines and communities for over four decades.\n\nOur continuous dedication, depth of experience, and relentless pursuit of excellence have together earned us a position of strength and distinction in the market. Above all, we remain deeply humbled by the enduring trust and loyalty of our customers — a bond that has only grown stronger with time.",
        "items": [],
        "blocks": [],
        "image_url": "/wp-content/themes/bti-new-properties-special/assets/img/demo/Our-Legacy-1.webp",
        "image_url_2": "/wp-content/themes/bti-new-properties-special/assets/img/demo/Our-Legacy-2.webp",
        "image_side": "right",
        "badge_text": "43 years of excellence",
        "video_url": "https://www.youtube.com/watch?v=zGP2vkMNUeI",
        "variant": null,
        "embed": null,
        "background": "dark",
        "sort_order": 10
      },
      {
        "kind": "marquee",
        "heading": null,
        "subheading": null,
        "body": "High Quality of Construction. Design Excellence. Reliability. Customer-centricity.",
        "items": [],
        "blocks": [],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": null,
        "background": "light",
        "sort_order": 20
      },
      {
        "kind": "timeline",
        "heading": "Check out how we started shaping the future 4 decades ago",
        "subheading": null,
        "body": null,
        "items": [],
        "blocks": [],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": null,
        "background": "dark",
        "sort_order": 30
      },
      {
        "kind": "feature_split",
        "heading": null,
        "subheading": "Core Values",
        "body": null,
        "items": [
          "Win The Customer's Heart.",
          "Work Harder than Everyone Else & Strive to be the Best.",
          "Maintain an Entrepreneurial Spirit.",
          "Respect, Develop & Empower our People.",
          "High Morals, Honesty & Integrity.",
          "Speed of Work, Fight Bureaucracy, Sycophancy and Remove Superfluous Work.",
          "Practice Meritocracy & Constantly Enhance Talent Density."
        ],
        "blocks": [
          {
            "title": "Mission",
            "body": "To make homeownership a joyful experience."
          },
          {
            "title": "Vision",
            "body": "To provide viable housing solutions to every segment of our society."
          }
        ],
        "image_url": "/wp-content/themes/bti-new-properties-special/assets/img/demo/mision-vision.webp",
        "image_url_2": null,
        "image_side": "right",
        "badge_text": "Pioneers of Bangladeshi Real Estate",
        "video_url": "https://www.youtube.com/watch?v=394OaJS3AKc",
        "variant": null,
        "embed": null,
        "background": "light",
        "sort_order": 40
      },
      {
        "kind": "feature_split",
        "heading": null,
        "subheading": null,
        "body": null,
        "items": [
          "On-time delivery, guaranteed",
          "Amazing credit ratings = timely payments",
          "A heartfelt relationship with patrons",
          "A one-stop solution to all real-estate issues"
        ],
        "blocks": [
          {
            "title": "Why should you choose KBS?",
            "body": "There are certain advantages to choosing KBS as your real estate partner, such as:"
          }
        ],
        "image_url": "/wp-content/themes/bti-new-properties-special/assets/img/demo/mision-vision-2.webp",
        "image_url_2": null,
        "image_side": "left",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": null,
        "background": "light",
        "sort_order": 50
      },
      {
        "kind": "review_slider",
        "heading": "What our customers say",
        "subheading": null,
        "body": null,
        "items": [],
        "blocks": [
          {
            "name": "Sumon Kumar Das & Rasmone Das",
            "role": "Shopnoneer",
            "text": "“It was a privilege to perform our ritual prayer in our apartment, and we are truly grateful to KBS f...”",
            "stars": 5
          },
          {
            "name": "Md. Kamrul Hasan Sarkar",
            "role": "Ikebana",
            "text": "“I sincerely appreciate the excellent service I received from KBS. Their professionalism, prompt resp...”",
            "stars": 5
          },
          {
            "name": "Md. Hossain Ripone",
            "role": "Glenwood",
            "text": "“I recently worked with KBS and was truly impressed by their professionalism, patience, and dedicatio...”",
            "stars": 5
          },
          {
            "name": "Md. Milon Mahbub",
            "role": "Glenwood",
            "text": "“Big thanks to KBS for their collaboration and for respecting my preferences. Hope this feedback supp...”",
            "stars": 5
          },
          {
            "name": "Aktaruzzaman Razib",
            "role": "Celestial Heights & West Gate",
            "text": "“We loved KBS’s dedication in completing our Celestial Heights home, which inspired us to buy another...”",
            "stars": 5
          },
          {
            "name": "Dr. Nuruzzaman",
            "role": "Liberty",
            "text": "“I deeply appreciate KBS's customer service, professionalism, dedication, and unwavering support thro...”",
            "stars": 5
          },
          {
            "name": "Mainuddin Chowdhury & Ferdousi Sultana",
            "role": "KBS Sorrento",
            "text": "“We truly appreciate KBS's dedication in resolving the damp in our apartment. Their commitment &...”",
            "stars": 5
          },
          {
            "name": "Dr. Rezina Yasmin",
            "role": "Park Panorama",
            "text": "“I truly appreciate KBS's prompt support in resolving any issues with my project and enhancing my apa...”",
            "stars": 5
          },
          {
            "name": "Shanuara Begum",
            "role": "West End",
            "text": "“A heartfelt thanks to KBS for their complete support on our journey! I'm very grateful for all the h...”",
            "stars": 5
          },
          {
            "name": "Ariful Arafath",
            "role": "Homeowner, Shopnobilash",
            "text": "“I am thrilled with the entire experience with KBS from start to finish. Thank you for making my drea...”",
            "stars": 5
          },
          {
            "name": "Dr Sayedun Nahar",
            "role": "KBS Oakland",
            "text": "“First of all, I would like to thank almighty Allah for giving me the opportunity to sign a contract...”",
            "stars": 5
          },
          {
            "name": "Iqbal Anwar",
            "role": "Camelia, C-6",
            "text": "“Yesterday I received the keys of the apartment, Camelia C-6, with a festive mood and full satisfacti...”",
            "stars": 5
          }
        ],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": "slider",
        "embed": null,
        "background": "light",
        "sort_order": 60
      }
    ]
  },
  "nrb": {
    "slug": "nrb",
    "title": "NRB",
    "banner_title": "Making homeownership a joyful experience",
    "banner_subtitle": "Own, develop, or manage property in Dhaka and Chattogram with secure, transparent, and hassle-free real estate support from KBS.",
    "banner_image_url": "/wp-content/uploads/2026/06/nrb-hero-062232.webp",
    "template": "feature",
    "meta_title": "NRB",
    "meta_description": "Own, develop, or manage property in Dhaka and Chattogram with secure, transparent, and hassle-free real estate support from KBS.",
    "sections": [
      {
        "kind": "feature_split",
        "heading": null,
        "subheading": "For each road will lead along—\nEvery wish made upon the land we belong.",
        "body": "Are you an NRB looking for an apartment in Dhaka or Chattogram? Do you have more than 5 katha land that you want to develop? Do you want to maintain your property? Do you want to keep it secure?\n\nTo ensure a joyful experience in property investment and management, KBS has come up with solutions handpicked for you. From assisting with legal procedures to providing end-to-end real estate solutions, KBS helps you own, make, and maintain properties in Bangladesh with ease and confidence.",
        "items": [],
        "blocks": [],
        "image_url": "/wp-content/uploads/2026/06/nrb-content-2-045186.webp",
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": "quote",
        "embed": null,
        "background": "light",
        "sort_order": 10
      },
      {
        "kind": "services",
        "heading": "Complete real estate solutions for NRBs",
        "subheading": "We offer",
        "body": "Choose the support you need, from finding a home to developing land, managing property, or designing interiors.",
        "items": [],
        "blocks": [
          {
            "title": "Choose a property",
            "body": "Explore KBS homes in Dhaka and Chattogram with guidance for NRB buyers.",
            "icon": "M4 21V9l8-5 8 5v12M4 21h16M9 21v-6h6v6"
          },
          {
            "title": "Joint venture land development",
            "body": "Develop suitable land through a trusted, structured, and experienced developer partnership.",
            "icon": "M8 21h8M12 3v18M4 8l8-5 8 5M4 8v6a4 4 0 0 0 8 0M12 14a4 4 0 0 0 8 0V8"
          },
          {
            "title": "Buy, Sell & Rent",
            "body": "Get brokerage support for property buying, selling, and rental needs in Bangladesh.",
            "icon": "M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4"
          },
          {
            "title": "Security & Management",
            "body": "Maintain and secure your property with reliable management support while you are abroad.",
            "icon": "M12 2 4 5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10V5l-8-3Z"
          },
          {
            "title": "Interior design & implementation",
            "body": "Turn your apartment into a ready living space through design and implementation support.",
            "icon": "M4 4h16v12H4V4Zm0 16h16M8 20v-4M16 20v-4"
          },
          {
            "title": "Legal & documentation support",
            "body": "Receive assistance with the procedures and documentation needed for a smoother property journey.",
            "icon": "M6 2h9l5 5v15H6V2Zm9 0v5h5M9 12h6M9 16h6"
          }
        ],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": null,
        "background": "dark",
        "sort_order": 20
      },
      {
        "kind": "checklist",
        "heading": "High Quality of Construction. Design Excellence. Reliability. Customer-centricity.",
        "subheading": "What makes us unique?",
        "body": "NRBs need clarity, trust, and easy communication. KBS brings multiple real estate services under one reliable platform so your property decision feels secure and manageable.",
        "items": [
          "Ensuring the experience of joyful homeownership",
          "Secured and hassle-free investment opportunity",
          "Hassle-free maintenance of property",
          "Wide range of choices for homes",
          "Reliable developer with 43 years of experience",
          "Communication is just one click away!",
          "Simplifies life with seamless services",
          "Ensuring complete real estate solutions",
          "Transparency in payments"
        ],
        "blocks": [],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": "two-column",
        "embed": null,
        "background": "light",
        "sort_order": 30
      },
      {
        "kind": "contact_block",
        "heading": "Find the right NRB service",
        "subheading": "Call for details",
        "body": "Talk to KBS for support with buying, developing, maintaining, securing, or designing your property in Bangladesh.",
        "items": [],
        "blocks": [
          {
            "icon": "phone",
            "title": "16604",
            "body": "Call KBS for details",
            "href": "tel:16604"
          },
          {
            "icon": "chat",
            "title": "+8801313401405",
            "body": "WhatsApp support",
            "href": "https://wa.me/+8801313401405"
          }
        ],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": "service_finder",
        "background": "dark",
        "sort_order": 40
      }
    ]
  },
  "landowner": {
    "slug": "landowner",
    "title": "Landowner",
    "banner_title": "Develop your land with confidence",
    "banner_subtitle": "Dealing with real estate developers in Bangladesh is often complex and risky, but KBS has made the joint venture process easier, transparent, and hassle-free for landowners.",
    "banner_image_url": "/wp-content/uploads/2026/06/landowner-hero-765299.webp",
    "template": "feature",
    "meta_title": "Landowner",
    "meta_description": "Develop your land with KBS, a trusted joint venture partner with over four decades of experience in Bangladesh real estate.",
    "sections": [
      {
        "kind": "feature_split",
        "heading": "Why choose KBS as a partner to develop your land?",
        "subheading": null,
        "body": "Dealing with real estate developers in Bangladesh can be difficult to navigate. Even though the joint venture process can be complicated & bureaucratic, we have simplified it, making it hassle-free. We firmly believe that no one else can offer our level of expertise, as do our partnered landowners. Read about their experience with us & take a look through some of our finished projects.",
        "items": [],
        "blocks": [],
        "image_url": "/wp-content/uploads/2026/06/landowner-c-143812.webp",
        "image_url_2": null,
        "image_side": "left",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": null,
        "background": "light",
        "sort_order": 10
      },
      {
        "kind": "video_split",
        "heading": "How is KBS different?",
        "subheading": null,
        "body": "KBS is one of the few companies known for being trustworthy as a joint venture partner for developing your land. As one of the pioneers in the sector, we have retained our position as a top real estate developer and have built this reputation of reliability over the good part of half a century.\n\nWe fully understand your dilemma and know how to tackle the complex systems involved in developing your property. Our vast experience has left us in a better position than most, to empathize and take care of all your concerns regarding the big decision to develop your land.\n\nWith a specialized customer service team along with architects, engineers, and logistic support, we work to make the process stress-free for you and continue to be at your service for years to come.",
        "items": [],
        "blocks": [],
        "image_url": null,
        "image_url_2": null,
        "image_side": "left",
        "badge_text": null,
        "video_url": "https://www.youtube.com/watch?v=GtL1FD4DhOk",
        "variant": null,
        "embed": null,
        "background": "dark",
        "sort_order": 20
      },
      {
        "kind": "review_slider",
        "heading": "What landowners say about KBS",
        "subheading": null,
        "body": null,
        "items": [],
        "blocks": [
          {
            "name": "S M Zulkarnine",
            "role": "Landowner of Casa Palmera",
            "text": "After extensively consulting my peers, I found KBS's reputation for sound structures to be a solid reason to move forward.",
            "stars": 5
          },
          {
            "name": "Air Vice Marshal A G Mahmud (Retd.)",
            "role": "Landowner",
            "text": "After consulting my peers, I found that KBS has a legacy of on-time handovers. That is what convinced me.",
            "stars": 5
          },
          {
            "name": "Md. Shafiqul Anwar",
            "role": "Landowner of Royal Oaks",
            "text": "KBS stays true to its commitment, guaranteeing on-time or even ahead of schedule handover, a trait that is rare.",
            "stars": 5
          },
          {
            "name": "Mr. Aminul Haq Jashim",
            "role": "Landowner of Grand Nawab",
            "text": "If you have land in Chattogram that you want to be developed with on-time handover and fantastic quality, KBS is the partner.",
            "stars": 5
          },
          {
            "name": "Mr. Anwarul Islam Tarique",
            "role": "Landowner of Palacio",
            "text": "Thanks to KBS and their amazing team for giving us exactly what we were looking for — great quality of construction.",
            "stars": 5
          },
          {
            "name": "Refat Rehan Mahmud",
            "role": "Landowner of Domus, Bashundhara R/A",
            "text": "I would like to extend my gratitude to you personally for your outstanding leadership throughout the project.",
            "stars": 5
          },
          {
            "name": "Md. Abdul Hye",
            "role": "Landowner of KBS Chorus and KBS Rosemary",
            "text": "Mr. Joyram Sen and Mr. Iftikharul Anam are engaged to ensure our maintenance needs are always met promptly.",
            "stars": 5
          },
          {
            "name": "Sultana Nazmun Nahar",
            "role": "Landowner of Royale Gardenia, Banani",
            "text": "I am the landowner of The Royal Gardenia Banani. I would like to thank KBS for their continued support.",
            "stars": 5
          }
        ],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": "carousel",
        "embed": null,
        "background": "dark",
        "sort_order": 30
      },
      {
        "kind": "faq",
        "heading": "Frequently asked questions",
        "subheading": null,
        "body": null,
        "items": [
          {
            "question": "Q: What does DAP mean?",
            "answer": "DAP means Detail Area Planning. The general objectives of DAP are to implement the provisions of the DMDP Structure Plan (SP) and Urban Area Plan (UAP) policies and recommendations."
          },
          {
            "question": "Q: What is FAR?",
            "answer": "The floor area ratio (FAR) is the ratio of a building's total floor area to the size of the land. Written as a formula, FAR = gross floor building area ÷ area of the plot."
          },
          {
            "question": "Q: What affects FAR and the maximum construction area?",
            "answer": "The maximum ground coverage depends on land size and the width of the entrance road. Front road width also affects FAR values. In short, land area multiplied by FAR value gives the maximum construction area of a building."
          },
          {
            "question": "Q: How many parking spaces will be available?",
            "answer": "The number of parking spaces depends on land size, land shape, building height, basement provision, car lift, park lift and other factors. This is determined on a case-by-case basis."
          },
          {
            "question": "Q: What needs to be considered for basement construction?",
            "answer": "Basement construction is generally expensive and requires careful execution to avoid water leakage and dampness. For smaller plots below 8 Katha, basements are generally not feasible. For larger plots, basements may be necessary for parking."
          },
          {
            "question": "Q: What is space sharing?",
            "answer": "Space sharing refers to the use of space in a building by the landowner and the developer. It depends on mutual understanding, land value, selling price, apartment units and agreed signing money."
          },
          {
            "question": "Q: How is the distribution of floors done?",
            "answer": "Floor distribution is done through mutual understanding between the landowner and the developer. Both parties choose floors as per the merit or value of the property."
          },
          {
            "question": "Q: How is apartment size measured?",
            "answer": "The apartment size is the net floor area of the apartment plus the common areas as specified in the Real Estate Management Act 2010."
          },
          {
            "question": "Q: Which areas are considered common space?",
            "answer": "Lift lobby, staircase room, lift machine room, generator room, sub-station room, caretaker's room, guard room and common facilities such as gym, prayer room, library room, guest waiting area and reception are considered common space."
          },
          {
            "question": "Q: What are the considerations for plan approval?",
            "answer": "In Dhaka, RAJUK and Cantonment Board are the final authorities for plan approval, and in Chattogram, it is CDA. Approval depends on factors such as building height, road width, number of apartments, land status and permissions from concerned authorities."
          },
          {
            "question": "Q: How is fire protection ensured?",
            "answer": "Fire protection is ensured through essential firefighting tools such as fire extinguishers, fire hydrants and sprinklers. A fire staircase is mandatory as per BNBC rules."
          },
          {
            "question": "Q: How does KBS make buildings earthquake-resistant?",
            "answer": "KBS follows the BNBC code for earthquake protection. Beyond implementing BNBC code, KBS has introduced the jacketing system, a scientifically proven method for earthquake-resistant design."
          },
          {
            "question": "Q: Do you test materials or concrete strength?",
            "answer": "KBS carries out appropriate testing to ensure materials are of high quality. Certain materials such as steel bars and concrete strength are tested through BUET."
          },
          {
            "question": "Q: When will possession or handover for construction happen?",
            "answer": "Possession or handover is subject to mutual understanding between the developer and landowner. Generally, construction possession is required after the plan has been approved by the concerned authority."
          },
          {
            "question": "Q: What is the maintenance service policy?",
            "answer": "KBS provides a 1-year free after-sales service to apartment owners for maintenance and upkeep of apartments."
          }
        ],
        "blocks": [],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": null,
        "background": "light",
        "sort_order": 40
      },
      {
        "kind": "contact_block",
        "heading": "Get in touch",
        "subheading": null,
        "body": "Entrust KBS as your joint venture partner. Be a part of KBS, the leading real estate developer in Bangladesh.",
        "items": [],
        "blocks": [
          {
            "icon": "phone",
            "title": "16604",
            "body": "+8809813191919",
            "href": null
          },
          {
            "icon": "map",
            "title": "KBS Celebration Point",
            "body": "Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212",
            "href": null
          }
        ],
        "image_url": null,
        "image_url_2": null,
        "image_side": "right",
        "badge_text": null,
        "video_url": null,
        "variant": null,
        "embed": "landowner_contact",
        "background": "dark",
        "sort_order": 50
      }
    ]
  }
};

/** Preset choices offered when creating a page, in dropdown order. */
export const PAGE_PRESET_CHOICES = [
  {
    value: "blank",
    label: "Blank",
    blurb: "A banner and nothing else. Add your own sections afterwards.",
    template: "standard",
  },
  {
    value: "about",
    label: "About Us style",
    blurb:
      "Light centred banner, then the About page's layout: the two-image legacy block with its rotating badge, a scrolling marquee, the interactive timeline, mission/vision splits and the review slider.",
    template: "standard",
  },
  {
    value: "nrb",
    label: "NRB style",
    blurb:
      "Tall dark banner, then a pull-quote intro beside an image, an icon service grid, a two-column ticked list and a contact block with the service finder.",
    template: "feature",
  },
  {
    value: "landowner",
    label: "Landowner style",
    blurb:
      "Tall dark banner, then image-and-text splits, a video block, a review carousel, an FAQ accordion and a contact block with an enquiry form.",
    template: "feature",
  },
];

/** The sections a preset starts a new page with (deep-copied by the caller). */
export function presetSections(preset) {
  return PAGE_PRESETS[preset]?.sections || [];
}
