"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CtaIcon from "./CtaIcon";
import { DEFAULT_CTA_BUTTONS } from "@/lib/cta-defaults";
import styles from "./FixedActions.module.css";

/*
 * The floating Call / WhatsApp / Reach-us stack pinned to the right edge.
 *
 * Two behaviours, split at 1024px:
 *
 *   desktop (>= 1025px)  the buttons are always visible as a vertical stack,
 *                        exactly as before. The dot is display:none, so it is
 *                        not in the tab order.
 *
 *   tablet + mobile      the stack collapses behind a single dot in the
 *   (<= 1024px)          bottom-right corner. Tapping the dot pops the buttons
 *                        open (staggered scale + fade, origin at the dot).
 *                        Tapping anywhere else, pressing Escape, or following
 *                        one of the links closes it again.
 *
 * Which mode applies is decided entirely in CSS, not in JS. That matters:
 * the server has no idea how wide the viewport is, so if the collapsed state
 * depended on a JS media-query check the panel would render open and then snap
 * shut on hydration. Driving it from a media query means the first paint is
 * already correct.
 *
 * Collapsed buttons are hidden with `visibility: hidden`, which — unlike
 * opacity alone — also takes them out of the tab order and the accessibility
 * tree, so there is no keyboard trap behind a closed dot.
 *
 * Content comes from the `cta_buttons` table via lib/data/cta.js; the bundled
 * defaults are the fallback for an un-migrated database.
 */

export default function FixedActions({ buttons }) {
  const list = (buttons?.length ? buttons : DEFAULT_CTA_BUTTONS).filter(
    (b) => b.is_active !== false
  );

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  /* "tap anywhere else should close" — pointerdown rather than click, so the
     panel closes on the press instead of waiting for a full tap, and so a
     scroll that starts outside the panel dismisses it too. */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* Rotating a phone from portrait to landscape can cross the 1024px line.
     Without this, the desktop layout would render with `open` still true —
     harmless visually, but it would leave the dot in its rotated "close"
     state the next time the viewport narrowed again. */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1025px)");
    const sync = (e) => e.matches && setOpen(false);

    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (list.length === 0) return null;

  return (
    <div ref={wrapRef} className={styles.wrap} data-open={open ? "true" : "false"}>
      <div className={styles.panel} id="cta-panel">
        {list.map((action, index) => {
          const shared = {
            className: styles.action,
            onClick: () => setOpen(false),
            style: {
              /* Staggered reveal: each button trails the one below it, so the
                 sequence reads as growing out of the dot. Reversed because the
                 dot sits at the bottom of the stack on mobile. */
              "--cta-index": String(list.length - 1 - index),
              ...(action.accent_color ? { "--cta-accent": action.accent_color } : {}),
            },
          };

          return action.external ? (
            <a
              key={action.id || action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              {...shared}
            >
              <CtaIcon name={action.icon} />
              <span>{action.label}</span>
            </a>
          ) : (
            <Link key={action.id || action.label} href={action.href} {...shared}>
              <CtaIcon name={action.icon} />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.dot}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="cta-panel"
        aria-label={open ? "Close contact options" : "Open contact options"}
      >
        <span className={styles.dotCore} aria-hidden="true" />
        <span className={styles.dotPulse} aria-hidden="true" />
      </button>
    </div>
  );
}
