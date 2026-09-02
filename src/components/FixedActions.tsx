"use client";

/**
 * The floating Call / WhatsApp / Reach-us control.
 *
 * One behaviour on every viewport, phone and desktop alike: a single dot
 * pinned to a screen edge. Tapping it pops the actions open (staggered scale
 * + fade, origin at the dot); tapping elsewhere, Escape, or following a link
 * closes it. The dot is DRAGGABLE — press, hold, move — and parks anywhere
 * along the edges. The spot is remembered in localStorage, and the panel
 * unfolds back onto the screen from wherever the dot ended up.
 *
 * The desktop vertical stack the old site used is gone on purpose: the client
 * wanted the mobile dot everywhere.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/content/seed";

const STORAGE_KEY = "kbs:cta-fab-pos";
const DRAG_THRESHOLD = 6; // px of movement before a press becomes a drag
const EDGE_MARGIN = 12; // keep the dot this far from every screen edge
const DOT_SIZE = 52; // matches .cta-fab-dot in globals.css

type Action = {
  label: string;
  href: string;
  icon: "phone" | "whatsapp" | "chat";
  external: boolean;
  accent?: string;
};

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Icon({ name }: { name: Action["icon"] }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {name === "phone" && (
        <path
          {...STROKE}
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
        />
      )}
      {name === "whatsapp" && (
        <path
          fill="currentColor"
          d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.3A10 10 0 1 0 12 2Z"
        />
      )}
      {name === "chat" && (
        <path
          {...STROKE}
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        />
      )}
    </svg>
  );
}

function loadSavedFraction() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (typeof parsed?.fx === "number" && typeof parsed?.fy === "number") return parsed;
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return null;
}

export default function FixedActions({
  locale,
  phone,
  whatsapp,
}: {
  locale: Locale;
  phone?: string;
  whatsapp?: string;
}) {
  const tel = (phone || "16604").replace(/\s+/g, "");
  const wa = (whatsapp || "8801313401405").replace(/[^\d]/g, "");

  const label = {
    call: locale === "bn" ? "কল" : "Call",
    whatsapp: locale === "bn" ? "হোয়াটসঅ্যাপ" : "WhatsApp",
    reach: locale === "bn" ? "যোগাযোগ" : "Reach us",
    open: locale === "bn" ? "যোগাযোগের বিকল্প — খুলতে ট্যাপ, সরাতে টেনে নিন" : "Contact options — tap to open, drag to move",
    close: locale === "bn" ? "যোগাযোগের বিকল্প বন্ধ করুন" : "Close contact options",
  };

  const list: Action[] = [
    { label: label.call, href: `tel:${tel}`, icon: "phone", external: false },
    {
      label: label.whatsapp,
      href: `https://wa.me/${wa}`,
      icon: "whatsapp",
      external: true,
      accent: "#25D366",
    },
    { label: label.reach, href: `/${locale}/contact`, icon: "chat", external: false },
  ];

  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  /* Dot top-left in px once the user has dragged it; null → default CSS corner. */
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  /* Which way the panel unfolds, derived from `pos`. */
  const [anchor, setAnchor] = useState<{ dir: "up" | "down"; side: "left" | "right" }>({
    dir: "up",
    side: "right",
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLButtonElement>(null);
  const fractionRef = useRef<{ fx: number; fy: number } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false); // swallow the click that ends a drag

  const placeAt = useCallback((x: number, y: number) => {
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
  }, []);

  /* --- restore a saved position; re-clamp it on resize / rotation --- */
  useEffect(() => {
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
  }, [placeAt]);

  /* --- "tap anywhere else closes"; Escape closes --- */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* --- drag: pointer events on the dot --- */
  const onDotPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (open) return;
    const rect = dotRef.current!.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
    try {
      dotRef.current!.setPointerCapture(event.pointerId);
    } catch {
      /* not fatal — drag still works without capture on most browsers */
    }
  };

  const onDotPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
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

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    try {
      dotRef.current!.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }

    if (drag.moved) {
      // Browsers that fire a synthetic click right after a drag's pointerup send
      // it before this timeout runs, so it still gets swallowed. Touch browsers
      // that DON'T (a drag is a pan, not a tap) must not have the flag linger,
      // or the next genuinely separate tap on the dot is silently ignored.
      suppressClickRef.current = true;
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 350);

      const rect = dotRef.current!.getBoundingClientRect();
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

  const wrapStyle: React.CSSProperties | undefined = pos
    ? { left: `${pos.x}px`, top: `${pos.y}px`, right: "auto", bottom: "auto" }
    : undefined;

  return (
    <div
      ref={wrapRef}
      className="cta-fab"
      style={wrapStyle}
      data-open={open ? "true" : "false"}
      data-dir={pos ? anchor.dir : "up"}
      data-side={pos ? anchor.side : "right"}
      data-dragging={dragging ? "true" : "false"}
    >
      <div className="cta-fab-panel" id="cta-panel">
        {list.map((action, index) => {
          const style = {
            /* Staggered reveal: each button trails the one below it, so the
               sequence reads as growing out of the dot. Reversed because the
               dot sits at the bottom of the stack. */
            "--cta-index": String(list.length - 1 - index),
            ...(action.accent ? { "--cta-accent": action.accent } : {}),
          } as React.CSSProperties;

          return action.external ? (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-fab-action"
              style={style}
              onClick={() => setOpen(false)}
            >
              <Icon name={action.icon} />
              <span>{action.label}</span>
            </a>
          ) : (
            <a
              key={action.label}
              href={action.href}
              className="cta-fab-action"
              style={style}
              onClick={() => setOpen(false)}
            >
              <Icon name={action.icon} />
              <span>{action.label}</span>
            </a>
          );
        })}
      </div>

      <button
        type="button"
        ref={dotRef}
        className="cta-fab-dot"
        onClick={onDotClick}
        onPointerDown={onDotPointerDown}
        onPointerMove={onDotPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-expanded={open}
        aria-controls="cta-panel"
        aria-label={open ? label.close : label.open}
      >
        <span className="cta-fab-core" aria-hidden="true" />
        <span className="cta-fab-pulse" aria-hidden="true" />
      </button>
    </div>
  );
}
