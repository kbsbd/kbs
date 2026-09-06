/**
 * Turns whatever the admin pastes into the Google Maps field into a URL that is
 * actually loadable inside an <iframe>.
 *
 * Google's "Share → Embed a map" gives a full `<iframe src="…/maps/embed?pb=…">`
 * snippet; people also paste a plain place link or a maps.app.goo.gl short link.
 * Only the `…/maps/embed` URL renders in a frame — a normal maps URL is refused
 * by Google with X-Frame-Options. So: pull the src out of a pasted iframe, keep
 * a real embed URL as-is, and fall back to the `?output=embed` form for a plain
 * maps link (short links can't be resolved here, so those are dropped).
 */
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
    (host === "google.com" || host.endsWith(".google.com")) && url.pathname.startsWith("/maps");
  const isEmbed = isGoogleMaps && url.pathname.startsWith("/maps/embed");

  if (isEmbed) return url.toString();

  if (isGoogleMaps) {
    // /maps/place/… or /maps?q=… → the embeddable query form
    const q =
      url.searchParams.get("q") ||
      decodeURIComponent(url.pathname.split("/place/")[1]?.split("/")[0] || "");
    if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  }

  return "";
}
