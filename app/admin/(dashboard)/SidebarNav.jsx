"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/hero", label: "Hero & Video" },
  { href: "/admin/arrival", label: "Statement of Arrival" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/legal", label: "Legal Pages" },
  { href: "/admin/footer", label: "Footer & Social" },
  { href: "/admin/integrations", label: "Integrations" },
  { href: "/admin/profile", label: "Profile" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebarNav}>
      {ITEMS.map((item) => {
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
    </nav>
  );
}
