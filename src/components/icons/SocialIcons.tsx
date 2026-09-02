/**
 * Footer social icons.
 *
 * Same 24-unit grid as icons/Icons.tsx. Brand marks are filled (they read wrong
 * as outlines); the generic fallback is a stroke link glyph. `SocialIcon` picks
 * by platform key and quietly falls back to the link glyph for anything unknown.
 */

type P = { className?: string };

const brands: Record<string, (p: P) => React.ReactElement> = {
  facebook: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.04-1.3-.13-2.47-.13-2.44 0-4.11 1.49-4.11 4.23V9.9H7.7V13h2.72v8z" />
    </svg>
  ),
  instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M12 8.9A3.1 3.1 0 1 0 12 15.1 3.1 3.1 0 0 0 12 8.9zm0 5.1A2 2 0 1 1 12 10a2 2 0 0 1 0 4zm3.3-5.9a.72.72 0 1 1 0 1.44.72.72 0 0 1 0-1.44zM19.8 8c-.05-1-.28-1.9-1.02-2.63C18.04 4.63 17.14 4.4 16.14 4.35 15.11 4.29 12 4.29 12 4.29s-3.11 0-4.14.06C6.86 4.4 5.96 4.63 5.22 5.37 4.48 6.1 4.25 7 4.2 8 4.14 9.03 4.13 12 4.13 12s0 2.97.07 4c.05 1 .28 1.9 1.02 2.63.74.74 1.64.97 2.64 1.02 1.03.06 4.14.06 4.14.06s3.11 0 4.14-.06c1-.05 1.9-.28 2.64-1.02.74-.73.97-1.63 1.02-2.63.06-1.03.06-4 .06-4s0-2.97-.06-4zM18.2 16.14a2.9 2.9 0 0 1-1.63 1.63c-1.13.45-3.81.35-5.07.35s-3.94.1-5.07-.35a2.9 2.9 0 0 1-1.63-1.63c-.45-1.13-.35-3.81-.35-5.07s-.1-3.94.35-5.07A2.9 2.9 0 0 1 6.86 4.4c1.13-.45 3.81-.35 5.07-.35s3.94-.1 5.07.35a2.9 2.9 0 0 1 1.63 1.63c.45 1.13.35 3.81.35 5.07s.1 3.94-.35 5.07z" />
    </svg>
  ),
  linkedin: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M6.94 6.5a1.94 1.94 0 1 1-.01-3.88A1.94 1.94 0 0 1 6.94 6.5zM5.3 8.2h3.3V21H5.3zM11 8.2h3.16v1.75h.05c.44-.83 1.5-1.7 3.1-1.7 3.32 0 3.93 2.18 3.93 5.02V21h-3.3v-5.9c0-1.4-.03-3.22-1.96-3.22-1.97 0-2.27 1.53-2.27 3.11V21H11z" />
    </svg>
  ),
  youtube: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M21.6 7.2s-.19-1.36-.78-1.96c-.75-.78-1.58-.79-1.97-.83C16.06 4.2 12 4.2 12 4.2h-.01s-4.05 0-6.84.2c-.39.05-1.22.06-1.97.84-.59.6-.78 1.96-.78 1.96S2.2 8.8 2.2 10.4v1.5c0 1.6.2 3.2.2 3.2s.19 1.36.78 1.96c.75.78 1.73.75 2.17.84 1.58.15 6.65.2 6.65.2s4.06-.01 6.85-.21c.39-.05 1.22-.06 1.97-.84.59-.6.78-1.96.78-1.96s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2zM9.9 13.7V8.9l5.2 2.4z" />
    </svg>
  ),
  x: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.6L8 21H4.8l7.5-8.6L4.5 3h6.6l4.5 6zM16.4 19l-9-11.9H6.5l9.1 11.9z" />
    </svg>
  ),
  whatsapp: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2z" />
    </svg>
  ),
  tiktok: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
      <path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.8v2.7c-1.2.1-2.3-.3-3.5-.9v6.1c0 3.6-2.7 5.8-5.8 5.3-2.6-.4-4.4-2.6-4.2-5.3.2-2.6 2.6-4.6 5.3-4.2v2.8c-.5-.1-1-.1-1.5.1-1 .3-1.6 1.3-1.4 2.3.2 1 1.1 1.7 2.2 1.6 1.1-.1 1.9-1 1.9-2.1V3z" />
    </svg>
  ),
};

const linkGlyph = (p: P) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    <path d="M9.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);

/** Ordered keys for the admin dropdown. */
export const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X (Twitter)" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "tiktok", label: "TikTok" },
  { key: "other", label: "Other link" },
] as const;

export function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const draw = brands[platform] ?? linkGlyph;
  return draw({ className });
}
