"use client";

import { useMemo, useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ properties, targetId = "special-offer" }) {
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");

  const locations = useMemo(() => {
    const unique = Array.from(new Set(properties.map((p) => p.location).filter(Boolean)));
    return unique.sort();
  }, [properties]);

  const statuses = useMemo(() => {
    return Array.from(new Set(properties.map((p) => p.status).filter(Boolean)));
  }, [properties]);

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (location) params.set("location", location);
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(
      new CustomEvent("kbs:property-filter", { detail: { status, location } })
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <div className={styles.row}>
        {/* The real site keeps a Type field in the DOM but hides it with
            .nm-search-type-hidden{display:none!important} - only Status and
            Location are ever visible. */}
        <div className={styles.field}>
          <label htmlFor="search-status" className="visually-hidden">
            Status
          </label>
          <div className={styles.selectWrap}>
            <select
              id="search-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <svg
              className={styles.caret}
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 1 5 5 9 1" />
            </svg>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="search-location" className="visually-hidden">
            Location
          </label>
          <div className={styles.selectWrap}>
            <select
              id="search-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Location</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <svg
              className={styles.caret}
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 1 5 5 9 1" />
            </svg>
          </div>
        </div>

        <button type="submit" className={styles.submit}>
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path
              fill="currentColor"
              d="M11.3 9.9a5.5 5.5 0 1 0-1.4 1.4l3.4 3.4 1.4-1.4-3.4-3.4ZM2 6.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z"
            />
          </svg>
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}
