export function extractYouTubeId(input) {
  if (!input) return "";
  const match = input.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/
  );
  if (match) return match[1];
  // Assume they pasted a bare video ID.
  return /^[\w-]{6,}$/.test(input) ? input : "";
}
