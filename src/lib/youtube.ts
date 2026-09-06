/**
 * Pulls the video id out of whatever YouTube link the admin pastes — a normal
 * watch URL, a youtu.be short link, an embed URL, a Shorts URL, or a bare id —
 * and returns the privacy-friendly embed URL. Returns "" when it can't find an
 * id, which is how the video section stays hidden.
 */
export function youtubeEmbed(raw: string | null | undefined): string {
  const input = (raw ?? "").trim();
  if (!input) return "";

  // bare 11-char id
  if (/^[\w-]{11}$/.test(input)) return embed(input);

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return "";
  }

  const host = url.hostname.replace(/^www\./, "");
  let id = "";

  if (host === "youtu.be") {
    id = url.pathname.slice(1);
  } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
    else if (url.pathname.startsWith("/embed/")) id = url.pathname.slice(7);
    else if (url.pathname.startsWith("/shorts/")) id = url.pathname.slice(8);
    else if (url.pathname.startsWith("/live/")) id = url.pathname.slice(6);
  }

  id = id.split("/")[0];
  return /^[\w-]{11}$/.test(id) ? embed(id) : "";
}

const embed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
