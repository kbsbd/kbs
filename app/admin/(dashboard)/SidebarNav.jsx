"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

/* Grouped so the list stays scannable as more sections become editable. */
const GROUPS = [
  {
    title: null,
    items: [{ href: "/admin", label: "Overview" }],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/site", label: "Site & Branding" },
      { href: "/admin/navigation", label: "Navigation" },
      { href: "/admin/cta", label: "CTA Buttons" },
      { href: "/admin/footer", label: "Footer & Social" },
    ],
  },
  {
    title: "Homepage",
    items: [
      { href: "/admin/homepage", label: "Sections" },
      { href: "/admin/hero", label: "Hero & Video" },
      { href: "/admin/arrival", label: "Statement of Arrival" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/sbu", label: "SBU Units" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/properties", label: "Properties" },
      { href: "/admin/legal", label: "Legal Pages" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/media", label: "Media" },
      { href: "/admin/integrations", label: "Integrations" },
      { href: "/admin/profile", label: "Profile" },
    ],
  },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebarNav}>
      {GROUPS.map((group) => (
        <div key={group.title || "root"} className={styles.sidebarGroup}>
          {group.title && <p className={styles.sidebarGroupTitle}>{group.title}</p>}
          {group.items.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? styles.sidebarNavActive : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
