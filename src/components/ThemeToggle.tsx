"use client";

import { useEffect, useState } from "react";

/**
 * Light / dark switch. The theme is resolved before paint by the inline script
 * in the root layout, which sets data-theme on <html>; this button just flips
 * it and remembers the choice. With no stored choice it follows the OS, and
 * keeps following it until the visitor picks one here.
 */
export default function ThemeToggle({ label = "Theme" }: { label?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as "light" | "dark") || "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);

    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystem = () => {
      try {
        if (localStorage.getItem("kbs:theme")) return; // an explicit choice wins
      } catch {
        /* ignore */
      }
      const next = mq.matches ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("kbs:theme", next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }

  if (theme === null) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${label}: ${theme === "light" ? "switch to dark" : "switch to light"}`}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--text-primary)]"
    >
      {theme === "light" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3v2M12 19v2M5 12H3M21 12h-2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
