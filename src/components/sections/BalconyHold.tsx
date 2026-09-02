"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale, SiteContent } from "@/content/seed";

/**
 * The one designed interactive moment.
 *
 * The visitor holds a button and the balcony fills with planting while the
 * depth dimension counts up. Releasing early eases the progress back down, it
 * never snaps. Completing it lights the caption. Reduced motion gets the
 * finished state with no hold required.
 *
 * It exists so the visitor performs the brand's single idea with their own
 * thumb rather than only reading it.
 */

/* Plants sit along the planter and grow out of it as the visitor holds. */
const LEAVES = [
  { x: 452, y: 250, s: 1.0, d: 0.0, flip: 1 },
  { x: 472, y: 246, s: 0.86, d: 0.07, flip: -1 },
  { x: 492, y: 249, s: 0.8, d: 0.13, flip: 1 },
  { x: 440, y: 244, s: 0.92, d: 0.2, flip: -1 },
  { x: 480, y: 232, s: 1.12, d: 0.28, flip: 1 },
  { x: 458, y: 230, s: 0.74, d: 0.36, flip: -1 },
  { x: 504, y: 242, s: 0.68, d: 0.44, flip: 1 },
  { x: 468, y: 216, s: 0.88, d: 0.54, flip: -1 },
  { x: 488, y: 212, s: 0.72, d: 0.64, flip: 1 },
];

export default function BalconyHold({ c, l }: { c: SiteContent; l: Locale }) {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const holding = useRef(false);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const value = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (reduce.matches) {
        value.current = 1;
        setP(1);
        setDone(true);
        if (raf.current !== null) {
          cancelAnimationFrame(raf.current);
          raf.current = null;
        }
      }
    };
    apply();
    reduce.addEventListener("change", apply);
    return () => reduce.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  function loop(now: number) {
    const dt = Math.min(64, now - (last.current || now));
    last.current = now;
    const dir = holding.current ? 1 : -1;
    // 1.35s to fill on a hold, a gentler 2.2s to unwind on release
    const speed = holding.current ? dt / 1350 : dt / 2200;
    value.current = Math.max(0, Math.min(1, value.current + dir * speed));

    setP(value.current);
    if (value.current >= 1) setDone(true);

    if ((holding.current && value.current < 1) || (!holding.current && value.current > 0)) {
      raf.current = requestAnimationFrame(loop);
    } else {
      raf.current = null;
      last.current = 0;
    }
  }

  function start() {
    if (done && value.current >= 1) return;
    holding.current = true;
    if (raf.current === null) {
      last.current = 0;
      raf.current = requestAnimationFrame(loop);
    }
  }
  function stop() {
    holding.current = false;
    if (raf.current === null && value.current > 0) {
      last.current = 0;
      raf.current = requestAnimationFrame(loop);
    }
  }

  const t = (v: Record<Locale, string>) => v[l];
  const depth = (1.2 + p * 0.6).toFixed(1);

  return (
    <section className="sec reveal" id="balcony">
      <div className="mx-auto max-w-[64rem] px-5 text-center sm:px-8">
        <div className="part">
          <p className="font-mono-label text-[color:var(--clay)]">{t(c.balcony.kicker)}</p>
          <h2 className="font-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">
            {t(c.balcony.head)}
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] leading-relaxed text-[color:var(--text-secondary)]">
            {t(c.balcony.body)}
          </p>
        </div>

        <div className="part mt-10">
          <svg
            viewBox="0 0 620 360"
            className="mx-auto w-full max-w-[44rem]"
            role="img"
            aria-label={t(c.balcony.head)}
          >
            {/* A section cut through one floor. Room on the left, balcony on the
                right, open air beyond the rail. At rest it is a laundry balcony,
                which is what most of them actually are. The hold turns it into
                the one the copy promises. */}
            <defs>
              <linearGradient id="airGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--sky-mid)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--sky-mid)" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            <rect x="256" y="74" width="304" height="198" fill="url(#airGrad)" />
            <rect x="62" y="74" width="182" height="198" fill="var(--canvas-deep)" opacity="0.8" />

            {/* slabs above and below, the concrete the whole building is made of */}
            <rect x="40" y="54" width="520" height="20" fill="var(--text-primary)" opacity="0.19" />
            <rect x="40" y="272" width="520" height="20" fill="var(--text-primary)" opacity="0.19" />

            {/* the wall, with the building's own terracotta reveal */}
            <rect x="40" y="74" width="22" height="198" fill="var(--text-primary)" opacity="0.14" />
            <rect x="62" y="74" width="8" height="198" fill="var(--clay-deep)" opacity="0.85" />

            {/* the sliding door onto the balcony */}
            <rect x="244" y="88" width="12" height="184" fill="var(--text-primary)" opacity="0.22" />
            <rect x="230" y="96" width="14" height="176" fill="var(--sky-mid)" opacity="0.2" />

            {/* the rail: post, handrail cap, and two wires between */}
            <rect x="516" y="168" width="7" height="104" fill="var(--text-secondary)" opacity="0.75" />
            <rect x="500" y="162" width="40" height="7" rx="3" fill="var(--text-secondary)" opacity="0.85" />
            <line x1="502" y1="200" x2="538" y2="200" stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.4" />
            <line x1="502" y1="234" x2="538" y2="234" stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.4" />

            {/* what the balcony is before: a line of washing */}
            <g opacity={Math.max(0, 1 - p * 2.1)}>
              <line x1="272" y1="150" x2="514" y2="154" stroke="var(--text-quiet)" strokeWidth="1.4" opacity="0.85" />
              <rect x="296" y="152" width="34" height="52" rx="2" fill="var(--text-secondary)" opacity="0.35" />
              <rect x="352" y="153" width="28" height="44" rx="2" fill="var(--text-secondary)" opacity="0.28" />
              <rect x="404" y="154" width="32" height="58" rx="2" fill="var(--text-secondary)" opacity="0.32" />
            </g>

            {/* what it becomes: a table and two chairs, deep enough to sit in */}
            <g opacity={Math.max(0, Math.min(1, (p - 0.24) / 0.42))}>
              <rect x="308" y="228" width="72" height="5" rx="2.5" fill="var(--text-primary)" opacity="0.7" />
              <rect x="341" y="233" width="6" height="39" fill="var(--text-primary)" opacity="0.55" />
              <rect x="329" y="268" width="30" height="5" rx="2" fill="var(--text-primary)" opacity="0.55" />
              <path d="M288 272 v-26 h18 v26 M288 246 v-22" fill="none" stroke="var(--text-primary)" strokeWidth="2.4" opacity="0.5" />
              <path d="M400 272 v-26 h-18 v26 M400 246 v-22" fill="none" stroke="var(--text-primary)" strokeWidth="2.4" opacity="0.5" />
            </g>

            {/* the planter */}
            <rect x="428" y="256" width="90" height="16" rx="2" fill="var(--clay)" opacity="0.92" />
            <rect x="428" y="256" width="90" height="4" fill="var(--clay-deep)" />

            {/* the planting, which is what the hold grows */}
            {LEAVES.map((leaf, i) => {
              const k = Math.max(0, Math.min(1, (p - leaf.d) / 0.34));
              const eased = k * k * (3 - 2 * k);
              return (
                <g
                  key={i}
                  transform={`translate(${leaf.x} ${leaf.y}) scale(${(
                    leaf.flip * leaf.s * eased
                  ).toFixed(3)} ${(leaf.s * eased).toFixed(3)})`}
                  opacity={eased}
                >
                  <path d="M0 0 C 12 -8, 26 -5, 31 8 C 24 20, 8 16, 0 0 Z" fill="var(--leaf)" />
                  <path
                    d="M0 0 C 11 2, 22 5, 31 8"
                    stroke="var(--accent)"
                    strokeWidth="1.3"
                    fill="none"
                    opacity="0.6"
                  />
                </g>
              );
            })}

            {/* a figure, so the drawing has a human scale */}
            <g fill="var(--text-primary)" opacity="0.3">
              <circle cx="272" cy="176" r="10" />
              <path d="M262 190 h20 v54 h-6 v28 h-8 v-28 h-6 z" />
            </g>

            {/* the depth dimension, which counts up as the balcony fills */}
            <line x1="256" y1="316" x2="519" y2="316" stroke="var(--accent)" strokeWidth="1" opacity={0.35 + p * 0.55} />
            <line x1="256" y1="310" x2="256" y2="322" stroke="var(--accent)" strokeWidth="1" opacity={0.35 + p * 0.55} />
            <line x1="519" y1="310" x2="519" y2="322" stroke="var(--accent)" strokeWidth="1" opacity={0.35 + p * 0.55} />
            <text
              x="388"
              y="344"
              textAnchor="middle"
              fill="var(--accent)"
              opacity={0.5 + p * 0.5}
              style={{ font: "500 14px var(--font-mono), monospace", letterSpacing: "0.08em" }}
            >
              {depth} m
            </text>
          </svg>
        </div>

        <div className="part mt-10">
          <button
            type="button"
            className="btn btn-ghost select-none"
            style={{
              borderColor: p > 0.02 ? "var(--accent)" : undefined,
              color: p > 0.02 ? "var(--accent)" : undefined,
            }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              start();
            }}
            onPointerUp={stop}
            onPointerCancel={stop}
            onPointerLeave={stop}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                start();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === " " || e.key === "Enter") stop();
            }}
            aria-describedby="balcony-hold-hint"
          >
            {done && p >= 1 ? t(c.balcony.done) : t(c.balcony.hold)}
          </button>
          <p id="balcony-hold-hint" className="sr-only">
            {t(c.balcony.body)}
          </p>
        </div>
      </div>
    </section>
  );
}
