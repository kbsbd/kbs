import type { Locale, SiteContent } from "@/content/seed";
import { youtubeEmbed } from "@/lib/youtube";

/**
 * The landing-page video. One YouTube link, set on the Site details tab; a
 * blank or unparseable link hides the whole section, the same way Projects
 * hides itself with no rows.
 */
export function VideoSection({ c, l }: { c: SiteContent; l: Locale }) {
  const src = youtubeEmbed(c.site.videoUrl);
  if (!src) return null;
  const pick = (v: Record<Locale, string>) => v[l] || v.en;

  return (
    <section className="sec reveal" id="video">
      <div className="mx-auto max-w-[86rem] px-5 sm:px-8">
        <div className="part max-w-[46rem]">
          <p className="font-mono-label text-[color:var(--clay)]">{pick(c.video.kicker)}</p>
          <h2 className="font-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">
            {pick(c.video.head)}
          </h2>
          {pick(c.video.body) && (
            <p className="mt-4 max-w-[46ch] leading-relaxed text-[color:var(--text-secondary)]">
              {pick(c.video.body)}
            </p>
          )}
        </div>

        <div className="part mt-10 overflow-hidden rounded-2xl border border-[color:var(--panel-edge)] bg-black">
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <iframe
              src={src}
              title={pick(c.video.head)}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
