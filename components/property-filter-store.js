"use client";

/*
 * The original's toggle and panel are two independent DOM nodes in different
 * parts of the page — main.min.js finds them with separate querySelectors and
 * wires them through one shared closure variable:
 *
 *   m = document.querySelector("[data-property-filter-toggle]")   // in the hero
 *   p = document.querySelector("[data-property-filter-panel]")    // in the grid row
 *
 * So the clone cannot put them in one component without changing the DOM.
 * This module is that shared variable: a 20-line store both components use,
 * which keeps the markup identical to the original's.
 */

let open = false;
const listeners = new Set();

export function isOpen() {
  return open;
}

export function toggleFilters() {
  open = !open;
  listeners.forEach((fn) => fn(open));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
