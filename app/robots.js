const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin"] },
      // Explicitly welcome known AI/LLM crawlers rather than leaving them to
      // the wildcard rule, since some respect a named entry more strictly.
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/admin"] },
      { userAgent: "ClaudeBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "Claude-Web", allow: "/", disallow: ["/admin"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "Google-Extended", allow: "/", disallow: ["/admin"] },
      { userAgent: "CCBot", allow: "/", disallow: ["/admin"] },
      { userAgent: "Applebot-Extended", allow: "/", disallow: ["/admin"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
