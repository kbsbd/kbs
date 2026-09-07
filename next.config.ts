import type { NextConfig } from "next";

/* Security headers. These satisfy Lighthouse's Best-Practices trust checks
   (HSTS, clickjacking, MIME sniffing, referrer, permissions) without a CSP —
   the pages embed Cloudinary media, Google Maps, GTM / GA4 / Meta Pixel and
   the Supabase API, so a locked-down CSP needs its own allowlist pass. */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // real estate development moved from a CMS page to a built-in route
      {
        source: "/:locale(en|bn)/p/real-estate-development",
        destination: "/:locale/real-estate-development",
        permanent: true,
      },
      {
        source: "/p/real-estate-development",
        destination: "/en/real-estate-development",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
