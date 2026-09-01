"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

/*
 * The dashboard's left-hand menu.
 *
 * Grouped by the JOB an admin is trying to do, not by how the code is
 * organised, and every label is written for someone who has never seen the
 * word "CMS". Adding a screen? Drop it in the group that matches the task and
 * give it a plain-language name.
 *
 * On a phone / tablet the whole menu collapses behind a "Menu" button so it
 * doesn't push the page down; on desktop it is always open in the sidebar.
 *
 * `icon` is a key into ICONS below. `end` marks a link that should only be
 * highlighted on an exact match (so "/admin" isn't active on every page).
 */
const GROUPS = [
  {
    title: null,
    items: [
      { href: "/admin", label: "Overview", icon: "overview", end: true },
      { href: "/admin/properties", label: "Properties", icon: "building" },
    ],
  },
  {
    title: "Home page",
    items: [
      { href: "/admin/homepage", label: "Sections & order", icon: "layout" },
      { href: "/admin/hero", label: "Hero video", icon: "play" },
      { href: "/admin/arrival", label: "Video band", icon: "film" },
      { href: "/admin/testimonials", label: "Customer reviews", icon: "star" },
      { href: "/admin/sbu", label: "Business units", icon: "briefcase" },
    ],
  },
  {
    title: "Pages",
    items: [
      { href: "/admin/pages", label: "All pages", icon: "page" },
      { href: "/admin/timeline", label: "Company history", icon: "clock" },
      { href: "/admin/legal", label: "Legal & privacy", icon: "shield" },
      { href: "/admin/built-in", label: "Search & visibility", icon: "search" },
    ],
  },
  {
    title: "Site settings",
    items: [
      { href: "/admin/site", label: "Branding & contact", icon: "brush" },
      { href: "/admin/navigation", label: "Menu links", icon: "menu" },
      { href: "/admin/cta", label: "Floating buttons", icon: "bubble" },
      { href: "/admin/footer", label: "Footer & social", icon: "footer" },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/admin/media", label: "Media library", icon: "image" },
      { href: "/admin/integrations", label: "Analytics & tracking", icon: "chart" },
      { href: "/admin/profile", label: "My account", icon: "user" },
    ],
  },
];

/* 18px line icons, one path string per key. Kept inline so the sidebar pulls
   in no icon library. */
const ICONS = {
  overview: "M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-16v5h7V4h-7Z",
  building:
    "M4 21V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v15M15 21V10h4a1 1 0 0 1 1 1v10M3 21h18M8 8h3M8 12h3M8 16h3",
  layout: "M4 5h16v14H4zM4 10h16M10 10v9",
  play: "M4 5v14a1 1 0 0 0 1.5.87l11-7a1 1 0 0 0 0-1.74l-11-7A1 1 0 0 0 4 5Z",
  film: "M4 4h16v16H4zM4 9h16M4 15h16M9 4v16M15 4v16",
  star: "M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5Z",
  briefcase:
    "M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18",
  page: "M6 3h9l5 5v13H6zM15 3v5h5M9 13h6M9 17h6",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  shield: "M12 3l8 3v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14ZM20 20l-4-4",
  brush:
    "M9.5 14.5 3 21M14 4l6 6M17 7l-8.5 8.5a3 3 0 0 1-4.2 0M13.5 3.5l7 7-3 3-7-7 3-3Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  bubble: "M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  footer: "M4 5h16v14H4zM4 15h16",
  image: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0",
};

function NavIcon({ name }) {
  return (
    <svg
      className={styles.navIcon}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name] || ICONS.page} />
    </svg>
  );
}

export default function SidebarNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={styles.navToggle}
        aria-expanded={open}
        aria-controls="admin-nav"
        onClick={() => setOpen((v) => !v)}
      >
        <NavIcon name="menu" />
        <span>Menu</span>
      </button>

      <nav
        id="admin-nav"
        className={styles.sidebarNav}
        data-open={open ? "true" : "false"}
      >
        {GROUPS.map((group) => (
          <div key={group.title || "root"} className={styles.sidebarGroup}>
            {group.title && <p className={styles.sidebarGroupTitle}>{group.title}</p>}
            {group.items.map((item) => {
              const active = item.end
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? styles.sidebarNavActive : undefined}
                  onClick={() => setOpen(false)}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}
