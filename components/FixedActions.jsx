"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CtaIcon from "./CtaIcon";
import { DEFAULT_CTA_BUTTONS } from "@/lib/cta-defaults";
import styles from "./FixedActions.module.css";

/*
 * The floating Call / WhatsApp / Reach-us stack.
 *
 * Two behaviours, split at 1024px:
 *
 *   desktop (>= 1025px)  the buttons are always visible as a vertical stack
 *                        pinned to the right edge. The dot is display:none, so
 *                        it is not in the tab order and nothing here drags.
 *
 *   tablet + mobile      the stack collapses behind a single dot. Tapping it
 *   (<= 1024px)          pops the buttons open (staggered scale + fade, origin
 *                        at the dot). Tapping elsewhere, Escape, or following a
 *                        link closes it.
 *
 *                        The dot is also DRAGGABLE: touch-and-hold-and-move
 *                        parks it anywhere along the edges of the screen, and
 *                        the spot is remembered (localStorage) for next time.
 *                        The panel opens up or down, left or right, so it
 *                        always unfolds back onto the screen from wherever the
 *                        dot ended up.
 *
 * Whether the compact layout applies is still decided in CSS (a media query),
 * so the first server-rendered paint on a phone is already collapsed. JS only
 * layers on the drag position once mounted.
 */

const COMPACT_QUERY = "(max-width: 1024px)";
const STORAGE_KEY = "kbs:cta-fab-pos";
const DRAG_THRESHOLD = 6; // px of movement before a press becomes a drag
const EDGE_MARGIN = 12; // keep the dot this far from every screen edge
const DOT_SIZE = 52; // matches .dot in the stylesheet

function loadSavedFraction() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (typeof parsed?.fx === "number" && typeof parsed?.fy === "number") {
      return parsed;
    }
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return null;
}

export default function FixedActions({ buttons }) {
  const list = (buttons?.length ? buttons : DEFAULT_CTA_BUTTONS).filter(
    (b) => b.is_active !== false
  );

  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [dragging, setDragging] = useState(false);
  /* Dot top-left in px once the user has dragged it; null → default CSS corner. */
  const [pos, setPos] = useState(null);
  /* Which way the panel unfolds, derived from `pos`. */
  const [anchor, setAnchor] = useState({ dir: "up", side: "right" });

  const wrapRef = useRef(null);
  const dotRef = useRef(null);
  const fractionRef = useRef(null); // last {fx, fy} as a share of the viewport
  const dragRef = useRef(null); // active pointer-drag session
  const suppressClickRef = useRef(false); // swallow the click that ends a drag

  /* --- compact-mode flag, kept in sync with the CSS breakpoint --- */
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const placeAt = useCallback((x, y) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = Math.max(EDGE_MARGIN, vw - DOT_SIZE - EDGE_MARGIN);
    const maxY = Math.max(EDGE_MARGIN, vh - DOT_SIZE - EDGE_MARGIN);
    const cx = Math.min(Math.max(x, EDGE_MARGIN), maxX);
    const cy = Math.min(Math.max(y, EDGE_MARGIN), maxY);

    setPos({ x: cx, y: cy });
    setAnchor({
      dir: cy + DOT_SIZE / 2 < vh * 0.42 ? "down" : "up",
      side: cx + DOT_SIZE / 2 < vw / 2 ? "left" : "right",
    });
    return { cx, cy, vw, vh };
  }, []);

  /* --- restore a saved position; re-clamp it on resize / rotation --- */
  useEffect(() => {
    if (!compact) {
      setPos(null);
      setDragging(false);
      return;
    }

    const apply = () => {
      const saved = fractionRef.current || loadSavedFraction();
      fractionRef.current = saved;
      if (!saved) {
        setPos(null);
        return;
      }
      placeAt(saved.fx * window.innerWidth, saved.fy * window.innerHeight);
    };

    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, [compact, placeAt]);

  /* --- "tap anywhere else closes"; Escape closes --- */
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

  /* Crossing back to the desktop layout drops the transient open state. */
  useEffect(() => {
    if (!compact) setOpen(false);
  }, [compact]);

  /* --- drag: pointer events on the dot (compact only) --- */
  const onDotPointerDown = (event) => {
    if (!compact || open) return;
    const rect = dotRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
    try {
      dotRef.current.setPointerCapture(event.pointerId);
    } catch {
      /* not fatal — drag still works without capture on most browsers */
    }
  };

  const onDotPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    drag.moved = true;
    setDragging(true);
    event.preventDefault();
    placeAt(drag.originX + dx, drag.originY + dy);
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      dotRef.current.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }

    if (drag.moved) {
      // Browsers that fire a synthetic click right after a drag's pointerup
      // send it before this timeout runs, so it still gets swallowed here.
      // Touch browsers that DON'T fire one (dragging is treated as a pan, not
      // a tap) must not have this flag linger — otherwise the next, genuinely
      // separate tap on the dot would be silently ignored.
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 350);

      const rect = dotRef.current.getBoundingClientRect();
      const fraction = {
        fx: rect.left / window.innerWidth,
        fy: rect.top / window.innerHeight,
      };
      fractionRef.current = fraction;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fraction));
      } catch {
        /* private mode / storage disabled — position just won't persist */
      }
    }
  };

  const onDotClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setOpen((v) => !v);
  };

  if (list.length === 0) return null;

  const positioned = compact && pos;
  const wrapStyle = positioned
    ? {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        right: "auto",
        bottom: "auto",
        transform: "none",
      }
    : undefined;

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      style={wrapStyle}
      data-open={open ? "true" : "false"}
      data-dir={positioned ? anchor.dir : "up"}
      data-side={positioned ? anchor.side : "right"}
      data-dragging={dragging ? "true" : "false"}
    >
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
        ref={dotRef}
        className={styles.dot}
        onClick={onDotClick}
        onPointerDown={onDotPointerDown}
        onPointerMove={onDotPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-expanded={open}
        aria-controls="cta-panel"
        aria-label={
          open ? "Close contact options" : "Contact options — tap to open, drag to move"
        }
      >
        <span className={styles.dotCore} aria-hidden="true" />
        <span className={styles.dotPulse} aria-hidden="true" />
      </button>
    </div>
  );
}
