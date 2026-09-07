"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { img } from "@/lib/media";
import Lightbox, { type LightboxItem } from "./Lightbox";

/**
 * A responsive grid of service cards. Each card lifts and its photo zooms on
 * hover; clicking one opens the full-screen Lightbox at that card, showing the
 * full text. Cards with no image get a plain panel and still open the popup.
 */
export default function ServiceCards({
  items,
  moreLabel,
}: {
  items: Array<LightboxItem & { id?: string }>;
  moreLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!items.length) return null;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => {
          const src = img(it.image, 900);
          return (
            <button
              key={it.id ?? i}
              type="button"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color:var(--panel-edge)] bg-[color:var(--panel)] text-left transition duration-500 ease-out will-change-transform hover:z-10 hover:-translate-y-1 hover:shadow-[0_28px_60px_-20px_rgba(7,16,26,.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--clay)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[color:var(--canvas-deep)]">
                {src ? (
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.08]"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--panel) 0%, var(--canvas-deep) 100%)",
                    }}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg">{it.title}</h3>
                {it.body && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
                    {it.body}
                  </p>
                )}
                <span className="font-mono-label mt-4 text-[color:var(--clay)]">
                  {moreLabel} →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <Lightbox
          items={items}
          index={index}
          onIndex={setIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
