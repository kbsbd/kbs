"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ListingPropertyCard from "./ListingPropertyCard";
import styles from "./properties.module.css";

export default function PropertiesGrid({ properties }) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState({ status: "", location: "" });

  useEffect(() => {
    function onFilter(e) {
      setFilter(e.detail);
    }
    window.addEventListener("kbs:property-filter", onFilter);
    return () => window.removeEventListener("kbs:property-filter", onFilter);
  }, []);

  const category = searchParams.get("category");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (category === "featured" && !p.is_featured) return false;
      if (category === "special" && !p.is_special_offer) return false;
      if (filter.status && p.status !== filter.status) return false;
      if (filter.location && p.location !== filter.location) return false;
      return true;
    });
  }, [properties, category, filter]);

  return (
    <div id="properties-grid" className={styles.grid}>
      {filtered.map((property) => (
        <ListingPropertyCard key={property.slug} property={property} />
      ))}
      {filtered.length === 0 && <p className={styles.empty}>No properties match those filters.</p>}
    </div>
  );
}
