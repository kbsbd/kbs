/**
 * Deterministic text splitting.
 *
 * The offsets look random but come from a seeded generator, so the server and
 * the client produce identical markup (no hydration mismatch) and every visit
 * animates the same way. The full sentence is kept in a visually hidden span for
 * screen readers; the split copy is aria-hidden decoration.
 */

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

export function SplitText({ text, seed, level, entrance, spread = 0.45 }: Props) {
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
