"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/content/seed";
import {
  MenuIcon,
  CloseIcon,
  ArrowIcon,
  PhoneIcon,
  UserIcon,
} from "@/components/icons/Icons";

/**
 * The phone menu.
 *
 * A full-screen panel behind one button, every target at least 44px. The panel
 * is `inert` while closed (out of the tab order and the a11y tree, but still in
 * the DOM so it animates), traps Tab focus while open, closes on Escape and on
 * a backdrop tap, locks the page behind it, and hands focus back to the button
 * that opened it. Adapted from the nav refactor in kbs-web-source.zip.
 */

type Item = { href: string; label: string };

export default function MobileMenu({
  locale,
  items,
  ctaLabel,
  ctaHref,
  phone,
  accountHref,
  logo,
  labels,
}: {
  locale: Locale;
  items: Item[];
  ctaLabel: string;
  ctaHref: string;
  phone?: string;
  accountHref?: string;
  logo?: string;
  labels: { open: string; close: string; account: string; call: string };
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = buttonRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [open]);

  const link = (href: string) =>
    href.startsWith("/") || href.startsWith("#") ? `/${locale}${href}` : href;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--text-primary)] lg:hidden"
        aria-label={labels.open}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <MenuIcon className="h-[23px] w-[23px]" />
      </button>

      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
        inert={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-[color:var(--canvas-deep)]/80 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: open ? 1 : 0 }}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.open}
          className="absolute inset-x-0 top-0 origin-top border-b border-[color:var(--panel-edge)] bg-[color:var(--canvas)] transition-transform duration-[420ms]"
          style={{
            transform: open ? "translateY(0)" : "translateY(-100%)",
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          <div className="flex items-center px-5 py-3.5 sm:px-8">
            {logo ? (
              <img src={logo} alt="KBS" className="mr-auto h-8 w-auto max-w-[160px] object-contain" />
            ) : (
              <span className="mr-auto font-display text-lg tracking-tight">KBS</span>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              aria-label={labels.close}
            >
              <CloseIcon className="h-[23px] w-[23px]" />
            </button>
          </div>

          <ul className="border-t border-[color:var(--panel-edge)] px-5 pb-3 pt-1 sm:px-8">
            {items.map((it) => (
              <li key={it.href}>
                <a
                  href={link(it.href)}
                  onClick={() => setOpen(false)}
                  className="group flex min-h-[56px] items-center justify-between border-b border-[color:var(--panel-edge)] py-3 text-[1.15rem] last:border-0"
                >
                  {it.label}
                  <ArrowIcon className="h-5 w-5 text-[color:var(--text-quiet)] transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-2 px-5 pb-4 sm:px-8">
            {accountHref && (
              <Link
                href={accountHref}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[color:var(--panel-edge)] px-4 text-sm text-[color:var(--text-secondary)]"
              >
                <UserIcon className="h-[18px] w-[18px]" />
                {labels.account}
              </Link>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[color:var(--panel-edge)] px-4 text-sm text-[color:var(--text-secondary)]"
              >
                <PhoneIcon className="h-[18px] w-[18px]" />
                {labels.call}
              </a>
            )}
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <a
              href={link(ctaHref)}
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full text-base"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
