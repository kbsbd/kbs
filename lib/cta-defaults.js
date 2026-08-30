/*
 * Client-safe CTA constants.
 *
 * These live apart from lib/data/cta.js because that module imports the
 * Supabase *server* client (and through it next/headers), which cannot be
 * pulled into a "use client" component. FixedActions is a client component and
 * needs the fallback list, so the plain data lives here and lib/data/cta.js
 * re-exports it for server callers.
 */

export const CTA_ICON_KEYS = ["phone", "whatsapp", "chat", "mail", "map", "calendar"];

export const DEFAULT_CTA_BUTTONS = [
  {
    id: null,
    label: "Call",
    href: "tel:16604",
    icon: "phone",
    external: false,
    accent_color: null,
    is_active: true,
    sort_order: 10,
  },
  {
    id: null,
    label: "WhatsApp",
    href: "https://wa.me/+8801313401405",
    icon: "whatsapp",
    external: true,
    accent_color: "#25D366",
    is_active: true,
    sort_order: 20,
  },
  {
    id: null,
    label: "Reach Us",
    href: "/contact",
    icon: "chat",
    external: false,
    accent_color: null,
    is_active: true,
    sort_order: 30,
  },
];
