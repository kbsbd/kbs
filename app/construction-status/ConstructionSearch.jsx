"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./construction-status-index.module.css";

export default function ConstructionSearch({ properties }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || (p.location || "").toLowerCase().includes(q)
    );
  }, [properties, query]);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div>
              <h1 className={styles.heroTitle}>Construction status</h1>
              <div className={styles.heroCopy}>
                <p>
                  Track live progress across every KBS project, from foundation work to
                  handover.
                </p>
              </div>
              <span className={styles.propertyCount}>{properties.length} live projects</span>
            </div>

            <div className={styles.archiveSearch}>
              <input
                type="search"
                placeholder="Search projects by name or location"
                aria-label="Search construction projects"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {filtered.map((property) => (
              <Link
                key={property.slug}
                href={`/construction-status/${property.slug}`}
                className={styles.card}
              >
                <span className={styles.thumb}>
                  {property.construction_status_updated && (
                    <span className={styles.badge}>
                      Updated {property.construction_status_updated}
                    </span>
                  )}
                  <Image
                    src={property.cover_image_url}
                    alt={property.title}
                    width={500}
                    height={400}
                    className={styles.image}
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                  />
                </span>
                <span className={styles.body}>
                  <span className={styles.title}>{property.title}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8h10M8 3l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </span>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && (
            <p style={{ color: "hsla(0,0%,100%,.72)", textAlign: "center", marginTop: "2rem" }}>
              No projects match your search.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
