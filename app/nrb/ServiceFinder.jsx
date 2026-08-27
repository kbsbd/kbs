"use client";

import { useState } from "react";
import ThemeButton from "@/components/ThemeButton";
import styles from "./nrb.module.css";

const OPTIONS = [
  { label: "Choose a property", value: "/properties" },
  { label: "Joint venture land development", value: "/landowner" },
  { label: "Buy, sell & rent", value: "https://brokeragebd.com/" },
  { label: "Security & Management", value: "https://psmbd.com/" },
  { label: "Interior design & implementation", value: "https://squarefeetstory.com/" },
];

export default function ServiceFinder() {
  const [value, setValue] = useState("");

  function handleContinue() {
    if (!value) return;
    if (value.startsWith("http")) {
      window.open(value, "_blank", "noopener");
    } else {
      window.location.href = value;
    }
  }

  return (
    <div className={styles.finder}>
      <h3>Find your service</h3>
      <p>Select the service you need and go directly to the relevant platform.</p>
      <select
        aria-label="Find your NRB service"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">Select a service</option>
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ThemeButton onClick={handleContinue} full icon className={styles.goldBtn}>
        Continue
      </ThemeButton>
    </div>
  );
}
