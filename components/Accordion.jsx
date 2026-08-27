"use client";

import { useState } from "react";
import styles from "./Accordion.module.css";

export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className={styles.accordion}>
      {items.map((item, i) => {
        const open = i === openIndex;
        return (
          <div key={item.question} className={styles.item}>
            <h3 className={styles.header}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? -1 : i)}
              >
                {item.question}
                <span className={styles.icon}>{open ? "−" : "+"}</span>
              </button>
            </h3>
            {open && <div className={styles.body}>{item.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
