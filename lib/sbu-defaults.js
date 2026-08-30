/*
 * Client-safe fallback for the "Other Initiatives" (SBU) slider.
 *
 * Previously exported as SBU_UNITS from lib/data/sbu.js. That module now
 * fetches from the sbu_units table, so the plain constants moved here where a
 * "use client" component can import them without dragging in next/headers.
 */

const THEME = "/wp-content/themes/bti-new-properties-special/assets/img/demo";

export const DEFAULT_SBU_UNITS = [
  {
    id: null,
    name: "Square Feet Story",
    logo_url: `${THEME}/ss-logo-01.webp`,
    description:
      "With years of real estate expertise, Square Feet Story (SFS) delivers end-to-end design & construction solutions for residential and commercial spaces—covering architecture, interiors, landscaping, logistics, 3D imaging, and virtual tours.",
    url: "https://squarefeetstory.com/",
    is_active: true,
    sort_order: 10,
  },
  {
    id: null,
    name: "The Business Centre",
    logo_url: `${THEME}/tbc-logo-01.webp`,
    description:
      "The Business Centre (TBC) at bti Celebration Point, Gulshan, offers flexible serviced office spaces and hosts seminars, workshops, and events—online or in-person—with comfort and convenience in mind.",
    url: "https://thebusinesscenterbd.com/",
    is_active: true,
    sort_order: 20,
  },
  {
    id: null,
    name: "bti Building Products",
    logo_url: `${THEME}/bp-logo-01.webp`,
    description:
      "bti's construction excellence is strengthened by bti Building Products, offering innovative, eco-friendly materials like concrete hollow blocks that ensure quality while supporting the environment.",
    url: "https://btibuildingproducts.com/",
    is_active: true,
    sort_order: 30,
  },
  {
    id: null,
    name: "Property Security & Management",
    logo_url: `${THEME}/psm-logo-01.webp`,
    description:
      "At Property Security & Management, you can get the best service for securing, managing, and maintaining your property.",
    url: "https://psmbd.com/",
    is_active: true,
    sort_order: 40,
  },
  {
    id: null,
    name: "Landscapers",
    logo_url: `${THEME}/ls-logo-01.webp`,
    description:
      "Backed by expert landscapers and urban planners, Landscapers delivers high-quality landscaping solutions that effortlessly transform your space.",
    url: "https://www.facebook.com/landscapersbd/",
    is_active: true,
    sort_order: 50,
  },
  {
    id: null,
    name: "FSS",
    logo_url: `${THEME}/fss-logo.webp`,
    description:
      "FSS is an exclusive service by bti, dedicated to fire safety and awareness, ensuring a safer and more joyful homeownership experience.",
    url: "/fss",
    is_active: true,
    sort_order: 60,
  },
];
