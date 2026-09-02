/* eslint-disable @next/next/no-img-element */
import type { Locale } from "@/content/seed";
import type { Block } from "@/lib/cms";
import { cmsPick } from "@/lib/cms";

/** Renders one CMS page's block list. Deliberately small set of block types. */
export default function Blocks({ blocks, l }: { blocks: Block[]; l: Locale }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          return (
            <h2
              key={i}
              className="font-display mt-10 text-[clamp(1.5rem,3.4vw,2.2rem)] first:mt-0"
            >
              {cmsPick(b, l, "text")}
            </h2>
          );
        }
        if (b.type === "richtext") {
          return (
            <div key={i} className="prose-block">
              {cmsPick(b, l, "text")
                .split(/\n{2,}/)
                .map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
            </div>
          );
        }
        if (b.type === "image") {
          return (
            <figure key={i}>
              <img
                src={b.url}
                alt={b.alt || ""}
                className="w-full rounded-xl border border-[color:var(--panel-edge)]"
                loading="lazy"
              />
              {cmsPick(b, l, "caption") && (
                <figcaption className="mt-2 text-sm text-[color:var(--text-quiet)]">
                  {cmsPick(b, l, "caption")}
                </figcaption>
              )}
            </figure>
          );
        }
        if (b.type === "button") {
          return (
            <div key={i}>
              <a href={b.href} className="btn btn-primary">
                {cmsPick(b, l, "label")}
              </a>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
