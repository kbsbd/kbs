/*
 * Icon set for the floating CTA buttons.
 *
 * An admin picks one of these keys from a dropdown; the SVG stays in code.
 * That is deliberate — storing raw SVG in the database would mean injecting
 * admin-authored markup into every page, and the dashboard has exactly one
 * account, so there is no reason to take that risk for a set of six icons.
 *
 * Keys must stay in sync with CTA_ICON_KEYS in lib/data/cta.js.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const PATHS = {
  phone: (
    <path
      {...STROKE}
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
    />
  ),
  whatsapp: (
    <path
      fill="currentColor"
      d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Z"
    />
  ),
  chat: (
    <path
      {...STROKE}
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
    />
  ),
  mail: (
    <>
      <rect {...STROKE} x="2" y="4" width="20" height="16" rx="2" />
      <path {...STROKE} d="m2 7 10 6 10-6" />
    </>
  ),
  map: (
    <>
      <path {...STROKE} d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle {...STROKE} cx="12" cy="10" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect {...STROKE} x="3" y="5" width="18" height="16" rx="2" />
      <path {...STROKE} d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
};

export const CTA_ICON_LABELS = {
  phone: "Phone",
  whatsapp: "WhatsApp",
  chat: "Chat bubble",
  mail: "Email",
  map: "Location pin",
  calendar: "Calendar",
};

export default function CtaIcon({ name, size = 20 }) {
  const path = PATHS[name] || PATHS.phone;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {path}
    </svg>
  );
}
