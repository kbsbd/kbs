/**
 * Media URLs.
 *
 * In production the processed video and stills live on Cloudinary, so the CDN
 * serves them and Vercel never pays the bandwidth. Until the Cloudinary cloud
 * name is set the same files are served from /public/media, so the site is
 * fully working in development with no account attached.
 */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER ?? "kbs";

/** A still image. `name` is the bare file stem, e.g. "pool-deck". */
export function img(name: string, width = 1920): string {
  if (!name) return "";
  if (name.startsWith("http")) return name;
  if (!CLOUD) return `/media/${name}.jpg`;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_${width}/${FOLDER}/${name}`;
}

/**
 * The scrub video, in two encodes.
 *
 * H.264 is the primary: every mainstream browser decodes it and it seeks
 * fastest, which is the whole game for a scrub. VP9 is there for builds
 * compiled without the proprietary codec, where an H.264 blob fails outright
 * with MEDIA_ERR_SRC_NOT_SUPPORTED and the hero would fall back to a still.
 * The client picks with canPlayType before a single byte is fetched.
 *
 * Both are delivered untransformed. They were encoded with a keyframe every 8
 * frames, which is the reason scrubbing is smooth, and a CDN transform would
 * re-encode and throw that away.
 */
function videoUrl(file: string): string {
  if (!CLOUD) return `/media/${file}`;
  return `https://res.cloudinary.com/${CLOUD}/video/upload/${FOLDER}/${file}`;
}

export const heroSources = {
  h264: { url: () => videoUrl("hero-scrub.mp4"), bytes: 14861694 },
  vp9: { url: () => videoUrl("hero-scrub.webm"), bytes: 17869065 },
};

/** Real byte sizes: the fallback when a CDN omits Content-Length. */
export const HERO_VIDEO_BYTES = 14861694;
