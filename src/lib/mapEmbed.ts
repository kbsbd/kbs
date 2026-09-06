/**
 * Turns whatever the admin pastes into the Google Maps field into a URL that is
 * actually loadable inside an <iframe>.
 *
 * Google's "Share → Embed a map" gives a full `<iframe src="…/maps/embed?pb=…">`
 * snippet; people also paste a plain place link or a maps.app.goo.gl short link.
 * `/maps/embed` URLs frame directly; a normal place URL is refused by Google
 * with X-Frame-Options, but the same place as `?q=…&output=embed` renders fine.
 * Short links can't be read without following them, so `resolveMapEmbed` does
 * that once and caches the result.
 */
import { unstable_cache } from "next/cache";

/** Synchronous best-effort: iframe snippet, embed URL, or a full place URL. */
export function toMapEmbedSrc(raw: string | null | undefined): string {
  const input = (raw ?? "").trim();
  if (!input) return "";

  // A pasted <iframe …> snippet — take its src.
  const iframeSrc = input.match(/<iframe[^>]*\bsrc=["']([^"']+)["']/i);
  const value = (iframeSrc ? iframeSrc[1] : input).trim();

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "";
  }
  if (url.protocol !== "https:") return "";

  const host = url.hostname.replace(/^www\./, "");
  const isGoogleMaps =
    (host === "google.com" || host.endsWith(".google.com") || host === "maps.google.com") &&
    url.pathname.startsWith("/maps");
  if (!isGoogleMaps) return "";
  if (url.pathname.startsWith("/maps/embed")) return url.toString();

  // /maps/place/Name/@lat,lng,zoom/… or /maps?q=… → the embeddable query form
  const atMatch = value.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const q =
    (atMatch && `${atMatch[1]},${atMatch[2]}`) ||
    url.searchParams.get("q") ||
    decodeURIComponent(url.pathname.split("/place/")[1]?.split("/")[0] || "");
  if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

  return "";
}

const isGoogleShortLink = (v: string) =>
  /^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)\//i.test(v.trim());

/**
 * Async: everything `toMapEmbedSrc` does, plus following a Google short link to
 * the real place URL. Cached for a day, keyed on the raw value.
 */
export const resolveMapEmbed = unstable_cache(
  async (raw: string | null | undefined): Promise<string> => {
    const direct = toMapEmbedSrc(raw);
    if (direct) return direct;

    const input = (raw ?? "").trim();
    if (!isGoogleShortLink(input)) return "";
    try {
      const res = await fetch(input, { redirect: "follow" });
      return toMapEmbedSrc(res.url);
    } catch {
      return "";
    }
  },
  ["map-embed-resolve"],
  { revalidate: 86400 }
);
