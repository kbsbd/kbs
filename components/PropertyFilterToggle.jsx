"use client";

import { useEffect, useState } from "react";
import { isOpen, subscribe, toggleFilters } from "./property-filter-store";

/*
 * button.nm-property-filter-toggle — sits in the hero, below the search form.
 * It is `d-none`, so it never shows; the markup has it, so the clone has it.
 *
 * From main.min.js:
 *   const open = toggle.getAttribute("aria-expanded") !== "true";
 *   toggle.classList.toggle("is-open", open);
 *   toggle.setAttribute("aria-expanded", open ? "true" : "false");
 *   sr.textContent = open ? "Hide property filters" : "Show property filters";
 */
export default function PropertyFilterToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen());
    return subscribe(setOpen);
  }, []);

  return (
    <button
      className={`nm-property-filter-toggle d-none${open ? " is-open" : ""}`}
      type="button"
      aria-expanded={open ? "true" : "false"}
      aria-controls="nm-property-archive-filter-panel"
      data-property-filter-toggle
      onClick={toggleFilters}
    >
      <span className="screen-reader-text">
        {open ? "Hide property filters" : "Show property filters"}
      </span>
      <i className="fa-solid fa-chevron-down" aria-hidden="true" />
    </button>
  );
}
