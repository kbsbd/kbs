"use client";

/**
 * Deterministic text splitting.
 *
 * The offsets look random but come from a seeded generator, so every visit
 * animates the same way. The split copy is aria-hidden decoration; the full
 * sentence stays readable for screen readers and crawlers either way.
 *
 * The split markup is a few hundred `<span>`s per heading, each with its own
 * custom properties — pure decoration that is invisible until the caption is
 * scrolled into view. It is NOT rendered on the server or at hydration: the
 * plain heading renders first and the split version swaps in once the main
 * thread is idle, so it costs nothing on load. A caption cannot be seen
 * without first scrolling well into the hero, by which point the swap is done.
 */

import { useEffect, useState } from "react";

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

export type SplitEntrance =
  | "drift-down"
  | "halves-parting"
  | "grid-snap"
  | "word-punch"
  | "approach-depth"
  | "staged-settle";

type Props = {
  text: string;
  seed: number;
  level: "word" | "char";
  entrance: SplitEntrance;
  spread?: number;
};

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function SplitText({ text, seed, level, entrance, spread = 0.45 }: Props) {
  const [split, setSplit] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setSplit(true), { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setSplit(true), 500);
    return () => window.clearTimeout(id);
  }, []);

  if (!split) return <span className="split">{text}</span>;

  const r = rng(seed);
  const words = text.split(" ");

  // Bengali is a connected script: splitting a word into per-character spans
  // breaks its conjuncts and matras, so Bengali always animates at word level.
  const hasBengali = /[ঀ-৿]/.test(text);
  const effectiveLevel = hasBengali ? "word" : level;

  const totalChars = text.replace(/\s/g, "").length;
  let charIndex = 0;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="split" aria-hidden="true">
        {words.map((word, wi) => {
          const half = wi < words.length / 2 ? -1 : 1;

          if (effectiveLevel === "word") {
            const th =
              entrance === "staged-settle" || entrance === "drift-down"
                ? (wi / Math.max(1, words.length)) * spread
                : r() * 0.5;
            const style = {
              "--th": th.toFixed(3),
              "--jx": `${half * (26 + r() * 26)}px`,
            } as React.CSSProperties;
            return (
              <span className="w" key={wi} style={style}>
                {word}
                {wi < words.length - 1 ? " " : ""}
              </span>
            );
          }

          return (
            <span className="w" key={wi}>
              {Array.from(word).map((ch, ci) => {
                const th = (charIndex++ / Math.max(1, totalChars)) * spread + r() * 0.06;
                const style = {
                  "--th": th.toFixed(3),
                  "--jx": `${-18 - r() * 22}px`,
                } as React.CSSProperties;
                return (
                  <span className="c" key={ci} style={style}>
                    {ch}
                  </span>
                );
              })}
              {wi < words.length - 1 ? <span className="c">&nbsp;</span> : null}
            </span>
          );
        })}
      </span>
    </>
  );
}

export const splitSeeded = rng;
