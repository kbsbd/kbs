"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isOpen, subscribe } from "./property-filter-store";

/*
 * The collapsible advanced filter, ported from main.min.js.
 *
 * Toggle:
 *   const open = toggle.getAttribute("aria-expanded") !== "true";
 *   panel.hidden = !open;
 *   panel.classList.toggle("is-open", open);
 *   toggle.classList.toggle("is-open", open);
 *   toggle.setAttribute("aria-expanded", open ? "true" : "false");
 *   sr.textContent = open ? "Hide property filters" : "Show property filters";
 *
 * Suggestions (same file):
 *   - debounced 250ms on keyword input; also on focus when value.trim() >= 2;
 *     and on change of the size / bedrooms / block selects
 *   - request carries property_keyword plus whichever of the three selects
 *     have a value; the previous request is aborted
 *   - fewer than 2 characters hides the list without requesting
 *   - each hit renders
 *       <a class="nm-property-search-suggestions__item" href role="option">
 *         <strong>title</strong><span>location</span></a>
 *     and an empty result renders
 *       <div class="nm-property-search-suggestions__empty">
 *         No matching ongoing projects</div>
 *   - Escape hides, ArrowDown moves focus to the first hit, a click outside hides
 *
 * The toggle lives in the hero and is a SEPARATE component
 * (PropertyFilterToggle) wired through property-filter-store, because the
 * original has them as two independent nodes in different parts of the tree.
 */

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

export default function PropertyArchiveFilterPanel({
  sizes,
  bedrooms,
  blocks,
  initial = {},
  endpoint = "/api/property-suggestions",
}) {
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState(null); // null = closed, [] = empty result
  const formRef = useRef(null);
  const keywordRef = useRef(null);
  const listRef = useRef(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const hide = useCallback(() => setHits(null), []);

  const request = useCallback(async () => {
    const form = formRef.current;
    const input = keywordRef.current;
    if (!form || !input) return;
    const value = input.value.trim();

    /* The original does NOT gate the request on length — it always fetches and
       applies the 2-character rule when RENDERING the response:
         t = n; w.replaceChildren(); t.length < 2 ? hide() : (…render…)
       Only the `focus` handler checks the length before scheduling. */
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("property_keyword", value);
    for (const name of ["property_size", "property_bedrooms", "property_block"]) {
      const el = form.querySelector(`select[name="${name}"]`);
      if (el && el.value) url.searchParams.set(name, el.value);
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const res = await fetch(url.toString(), {
        credentials: "same-origin",
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error("Property suggestion request failed.");
      const data = await res.json();
      const results = Array.isArray(data.results) ? data.results : [];
      if (value.length < MIN_CHARS) { hide(); return; }
      setHits(results);
    } catch (e) {
      if (e.name !== "AbortError") hide();
    }
  }, [endpoint, hide]);

  const schedule = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(request, DEBOUNCE_MS);
  }, [request]);

  useEffect(() => {
    setOpen(isOpen());
    return subscribe(setOpen);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) hide();
    };
    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [hide]);

  const onKeywordKeyDown = (e) => {
    if (e.key === "Escape") hide();
    if (e.key === "ArrowDown" && hits) {
      const first = listRef.current && listRef.current.querySelector("a");
      if (first) { e.preventDefault(); first.focus(); }
    }
  };

  return (
      <div
        id="nm-property-archive-filter-panel"
        className={`col-12 g-0 nm-inventory-count${open ? " is-open" : ""}`}
        data-property-filter-panel
        hidden={!open}
      >
        <form
          ref={formRef}
          className="nm-property-archive-filter"
          method="get"
          action="/properties"
          data-property-filter-form
          data-suggestions-endpoint={endpoint}
        >
          <div className="nm-property-archive-filter__fields">
            <div className="nm-property-archive-filter__field">
              <label htmlFor="nm-property-size-filter">Apartment size</label>
              <div className="nm-property-archive-filter__select-wrap">
                <select
                  id="nm-property-size-filter"
                  name="property_size"
                  defaultValue={initial.property_size || ""}
                  onChange={schedule}
                >
                  <option value="">All apartment sizes</option>
                  {sizes.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down" aria-hidden="true" />
              </div>
            </div>

            <div className="nm-property-archive-filter__field">
              <label htmlFor="nm-property-bedroom-filter">Bedrooms</label>
              <div className="nm-property-archive-filter__select-wrap">
                <select
                  id="nm-property-bedroom-filter"
                  name="property_bedrooms"
                  defaultValue={initial.property_bedrooms || ""}
                  onChange={schedule}
                >
                  <option value="">All bedrooms</option>
                  {bedrooms.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down" aria-hidden="true" />
              </div>
            </div>

            <div className="nm-property-archive-filter__field">
              <label htmlFor="nm-property-block-filter">Block</label>
              <div className="nm-property-archive-filter__select-wrap">
                <select
                  id="nm-property-block-filter"
                  name="property_block"
                  defaultValue={initial.property_block || ""}
                  onChange={schedule}
                >
                  <option value="">All blocks</option>
                  {blocks.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down" aria-hidden="true" />
              </div>
            </div>

            <div className="nm-property-archive-filter__field nm-property-archive-filter__field--search">
              <label htmlFor="nm-property-keyword-filter">Search</label>
              <div className="nm-property-archive-filter__search-wrap">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  id="nm-property-keyword-filter"
                  ref={keywordRef}
                  type="search"
                  name="property_keyword"
                  defaultValue={initial.property_keyword || ""}
                  placeholder="Search project or location"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="nm-property-search-suggestions"
                  aria-expanded={hits ? "true" : "false"}
                  onInput={schedule}
                  onFocus={() => {
                    if (keywordRef.current.value.trim().length >= MIN_CHARS) schedule();
                  }}
                  onKeyDown={onKeywordKeyDown}
                />
                <div
                  id="nm-property-search-suggestions"
                  ref={listRef}
                  className="nm-property-search-suggestions"
                  role="listbox"
                  hidden={!hits}
                  data-property-suggestions
                >
                  {hits && hits.length > 0
                    ? hits.map((r) => (
                        <a
                          key={r.url}
                          className="nm-property-search-suggestions__item"
                          href={r.url}
                          role="option"
                        >
                          <strong>{r.title}</strong>
                          {r.location ? <span>{r.location}</span> : null}
                        </a>
                      ))
                    : hits && (
                        <div className="nm-property-search-suggestions__empty">
                          No matching ongoing projects
                        </div>
                      )}
                </div>
              </div>
            </div>

            <div className="nm-property-archive-filter__actions">
              <button className="nm-property-archive-filter__submit" type="submit">
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
  );
}
