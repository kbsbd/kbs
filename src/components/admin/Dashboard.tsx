"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { EditableString } from "@/lib/editable";
import { SITE_FIELDS, INTEGRATION_FIELDS } from "@/lib/editable";
import ImageUpload from "@/components/admin/ImageUpload";
import ShopAdmin, {
  type AdminProduct,
  type AdminCategory,
  type AdminOrder,
  type AdminQuote,
  type AdminReview,
  type AdminGateway,
} from "@/components/admin/ShopAdmin";
import CmsAdmin, { type AdminPage, type AdminMenuItem } from "@/components/admin/CmsAdmin";
import MediaAdmin, { type MediaContent } from "@/components/admin/MediaAdmin";
import { SOCIAL_PLATFORMS } from "@/components/icons/SocialIcons";
import { MenuIcon, CloseIcon } from "@/components/icons/Icons";
import ThemeToggle from "@/components/ThemeToggle";
import {
  saveContent,
  setBookingStatus,
  saveProject,
  deleteProject,
  saveInternalNote,
  signOut,
  listStaff,
  addManager,
  removeStaff,
  type StaffMember,
} from "@/app/[locale]/admin/actions";

type Booking = {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  language: string;
  visit_date: string | null;
  status: string;
  created_at: string;
};

type Project = {
  id: string;
  image: string;
  title_en: string;
  title_bn: string;
  location_en: string;
  location_bn: string;
  status_en: string;
  status_bn: string;
  sort: number;
  published: boolean;
};

type Props = {
  locale: string;
  email: string;
  role: "admin" | "manager";
  groups: Record<string, EditableString[]>;
  site: Record<string, unknown>;
  integrations: Record<string, unknown>;
  bookings: Booking[];
  projects: Project[];
  notes: Array<{ key: string; value: string }>;
  shop: {
    products: AdminProduct[];
    categories: AdminCategory[];
    orders: AdminOrder[];
    quotes: AdminQuote[];
    reviews: AdminReview[];
    gateways: AdminGateway[];
  };
  cms: { pages: AdminPage[]; menu: AdminMenuItem[] };
  media: MediaContent;
};

const TABS = [
  "Dashboard",
  "Bookings",
  "Shop",
  "Pages",
  "Media",
  "Site details",
  "Text",
  "Projects",
  "Team",
  "Integrations",
  "Internal",
] as const;
type Tab = (typeof TABS)[number];

/** What a manager sees. Everything else is full-admin only. */
const MANAGER_TABS: Tab[] = ["Bookings", "Shop"];

const STATUSES = ["new", "contacted", "visit booked", "visited", "closed"];

const field =
  "w-full rounded-lg border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3 py-2 text-sm outline-none transition-colors duration-300 focus:border-[color:var(--accent)]";

export default function Dashboard({
  locale,
  email,
  role,
  groups,
  site,
  integrations,
  bookings,
  projects,
  notes,
  shop,
  cms,
  media,
}: Props) {
  const isAdmin = role === "admin";
  const tabs = isAdmin ? TABS : MANAGER_TABS;
  const [tab, setTab] = useState<Tab>(isAdmin ? "Dashboard" : "Bookings");
  const [toast, setToast] = useState("");
  const [drawer, setDrawer] = useState(true);

  useEffect(() => {
    // start collapsed on a phone
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.matchMedia("(max-width: 1023px)").matches) setDrawer(false);
  }, []);

  const newBookings = bookings.filter((b) => b.status === "new").length;
  const pendingReviews = shop.reviews.filter((r) => r.status === "pending").length;
  const badge = (t: Tab) =>
    t === "Bookings" ? newBookings : t === "Shop" ? pendingReviews : 0;

  return (
    <main
      className="relative z-[2] min-h-screen"
      data-drawer={drawer ? "open" : "closed"}
    >
      {/* scrim, phone only */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 lg:hidden ${drawer ? "" : "pointer-events-none opacity-0"} transition-opacity`}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[color:var(--panel-edge)] bg-[color:var(--canvas-deep)] transition-transform duration-300 ${
          drawer ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-display text-lg">KBS admin</span>
          <button
            type="button"
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
            className="text-[color:var(--text-quiet)] hover:text-[color:var(--text-primary)]"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="truncate px-5 pb-3 text-xs text-[color:var(--text-quiet)]">{email} · {isAdmin ? "Admin" : "Manager"}</p>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (window.matchMedia("(max-width: 1023px)").matches) setDrawer(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
                tab === t
                  ? "bg-[color:var(--accent-muted)] text-[color:var(--text-primary)]"
                  : "text-[color:var(--text-secondary)] hover:bg-[color:var(--panel)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              {t}
              {badge(t) > 0 && (
                <span className="ml-auto rounded-full bg-[color:var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold text-[#07101a]">
                  {badge(t)}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 border-t border-[color:var(--panel-edge)] px-4 py-3">
          <ThemeToggle />
          <a
            href={`/${locale}`}
            className="text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--accent)]"
          >
            View site
          </a>
          <form action={signOut} className="ml-auto">
            <button className="text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--clay)]">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className={`transition-[padding] duration-300 ${drawer ? "lg:pl-60" : "lg:pl-0"}`}>
        <div className="flex items-center gap-3 border-b border-[color:var(--panel-edge)] bg-[color:var(--canvas-deep)] px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawer((v) => !v)}
            aria-label={drawer ? "Hide menu" : "Show menu"}
            aria-expanded={drawer}
            className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <span className="font-display text-base">{tab}</span>
        </div>

        {toast && (
          <div
            role="status"
            className="mx-auto mt-4 max-w-[72rem] px-5 sm:px-8"
            onAnimationEnd={() => setToast("")}
          >
            <p className="rounded-lg border border-[color:var(--accent)] bg-[color:var(--accent-muted)] px-4 py-2 text-sm">
              {toast}
            </p>
          </div>
        )}

        <div className="mx-auto max-w-[72rem] px-5 py-10 sm:px-8">
          {tab === "Dashboard" && (
            <Overview
              go={setTab}
              locale={locale}
              site={site}
              integrations={integrations}
              bookings={bookings}
              projects={projects}
              shop={shop}
              cms={cms}
            />
          )}
          {tab === "Bookings" && <Bookings rows={bookings} notify={setToast} />}
          {tab === "Shop" && <ShopAdmin {...shop} isAdmin={isAdmin} notify={setToast} />}
          {tab === "Pages" && <CmsAdmin {...cms} notify={setToast} />}
          {tab === "Media" && <MediaAdmin media={media} notify={setToast} />}
          {tab === "Site details" && <SiteDetails site={site} groups={groups} notify={setToast} />}
          {tab === "Text" && <TextEditor groups={groups} notify={setToast} />}
          {tab === "Projects" && <Projects rows={projects} notify={setToast} />}
          {tab === "Team" && <TeamSection notify={setToast} />}
          {tab === "Integrations" && (
            <IntegrationsPanel data={integrations} notify={setToast} />
          )}
          {tab === "Internal" && <Internal notes={notes} notify={setToast} />}
        </div>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  sub,
  onClick,
}: {
  label: string;
  value: string | number;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start rounded-2xl border border-[color:var(--panel-edge)] bg-[color:var(--canvas-deep)] p-4 text-left transition-colors duration-150 hover:border-[color:var(--accent)]"
    >
      <span className="font-mono-label text-[color:var(--text-quiet)]">{label}</span>
      <span className="mt-2 font-display text-2xl">{value}</span>
      <span className="mt-1 text-xs text-[color:var(--text-quiet)]">
        {sub ?? "View details →"}
      </span>
    </button>
  );
}

function Overview({
  go,
  locale,
  site,
  integrations,
  bookings,
  projects,
  shop,
  cms,
}: {
  go: (t: Tab) => void;
  locale: string;
  site: Record<string, unknown>;
  integrations: Record<string, unknown>;
  bookings: Booking[];
  projects: Project[];
  shop: Props["shop"];
  cms: Props["cms"];
}) {
  const [staffCount, setStaffCount] = useState<number | null>(null);
  useEffect(() => {
    listStaff().then((r) => {
      if (r.ok) setStaffCount(r.staff.length);
    });
  }, []);

  const newBookings = bookings.filter((b) => b.status === "new").length;
  const pendingOrders = shop.orders.filter((o) => o.status === "pending").length;
  const unpaidOrders = shop.orders.filter((o) => o.payment_status === "unpaid").length;
  const activeProducts = shop.products.filter((p) => p.status === "active").length;
  const lowStock = shop.products.filter(
    (p) => p.track_stock && Number(p.stock) <= 3
  ).length;
  const pendingReviews = shop.reviews.filter((r) => r.status === "pending").length;
  const newQuotes = shop.quotes.filter((q) => q.status === "new").length;
  const publishedPages = cms.pages.filter((p) => p.status === "published").length;
  const publishedProjects = projects.filter((p) => p.published).length;
  const integrationsSet = INTEGRATION_FIELDS.filter((f) =>
    String(integrations[f.key] ?? "").trim()
  ).length;

  const s = (k: string) => String(site[k] ?? "").trim();
  const siteRows: Array<[string, string]> = [
    ["Business name", s("name") || "—"],
    ["Founded", s("founded") || "—"],
    ["Phone", s("phone") || "not set"],
    ["WhatsApp", s("whatsapp") || "not set"],
    ["Email", s("email") || "not set"],
    ["Logo", s("logo") ? "uploaded" : "not set"],
    ["Favicon", s("favicon") ? "uploaded" : "not set"],
    ["Map embed", s("mapEmbed") ? "set" : "not set"],
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-[color:var(--text-secondary)]">
          Everything at a glance. Tap any card to open that section.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard
            label="Site visit requests"
            value={bookings.length}
            sub={newBookings ? `${newBookings} new →` : "View details →"}
            onClick={() => go("Bookings")}
          />
          <StatCard
            label="Orders"
            value={shop.orders.length}
            sub={
              pendingOrders || unpaidOrders
                ? `${pendingOrders} pending · ${unpaidOrders} unpaid →`
                : "View details →"
            }
            onClick={() => go("Shop")}
          />
          <StatCard
            label="Products"
            value={shop.products.length}
            sub={`${activeProducts} active${lowStock ? ` · ${lowStock} low stock` : ""} →`}
            onClick={() => go("Shop")}
          />
          <StatCard
            label="Reviews to moderate"
            value={pendingReviews}
            sub={pendingReviews ? "Needs attention →" : "All clear →"}
            onClick={() => go("Shop")}
          />
          <StatCard
            label="Quote requests"
            value={shop.quotes.length}
            sub={newQuotes ? `${newQuotes} new →` : "View details →"}
            onClick={() => go("Shop")}
          />
          <StatCard
            label="Pages"
            value={cms.pages.length}
            sub={`${publishedPages} published →`}
            onClick={() => go("Pages")}
          />
          <StatCard
            label="Projects"
            value={projects.length}
            sub={`${publishedProjects} published →`}
            onClick={() => go("Projects")}
          />
          <StatCard
            label="Team"
            value={staffCount ?? "—"}
            sub="Manage access →"
            onClick={() => go("Team")}
          />
          <StatCard
            label="Integrations"
            value={`${integrationsSet}/${INTEGRATION_FIELDS.length}`}
            sub="Analytics & verification →"
            onClick={() => go("Integrations")}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <h3 className="font-display text-lg">Site information</h3>
          <button
            type="button"
            className="btn btn-ghost ml-auto text-xs"
            onClick={() => go("Site details")}
          >
            Edit
          </button>
        </div>
        <dl className="mt-4 grid gap-x-8 gap-y-3 rounded-2xl border border-[color:var(--panel-edge)] p-5 sm:grid-cols-2">
          {siteRows.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="font-mono-label text-[color:var(--text-quiet)]">{k}</dt>
              <dd className="truncate text-sm">{v}</dd>
            </div>
          ))}
        </dl>
        <a
          href={`/${locale}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--accent)]"
        >
          Open the public site ↗
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Bookings({ rows, notify }: { rows: Booking[]; notify: (s: string) => void }) {
  const [pending, start] = useTransition();
  if (!rows.length)
    return (
      <p className="text-[color:var(--text-secondary)]">
        No site visit requests yet. They will appear here the moment someone submits the
        form.
      </p>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border border-[color:var(--panel-edge)]">
      <table className="w-full min-w-[54rem] text-sm">
        <thead className="bg-[color:var(--panel)] text-left">
          <tr className="font-mono-label text-[color:var(--text-quiet)]">
            <th className="px-4 py-3">Received</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Wants</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id} className="border-t border-[color:var(--panel-edge)] align-top">
              <td className="whitespace-nowrap px-4 py-3 text-[color:var(--text-quiet)]">
                {new Date(b.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </td>
              <td className="px-4 py-3">{b.name}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="hover:text-[color:var(--accent)]">
                  {b.phone}
                </a>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-[color:var(--text-secondary)]">
                {b.visit_date ?? "any day"}
                <br />
                <span className="text-xs text-[color:var(--text-quiet)]">
                  speaks {b.language === "bn" ? "Bangla" : "English"}
                </span>
              </td>
              <td className="max-w-[22rem] px-4 py-3 text-[color:var(--text-secondary)]">
                {b.message || ""}
              </td>
              <td className="px-4 py-3">
                <select
                  defaultValue={b.status}
                  disabled={pending}
                  className={field}
                  onChange={(e) => {
                    const v = e.target.value;
                    start(async () => {
                      const r = await setBookingStatus(b.id, v);
                      notify(r.ok ? "Status saved." : r.error);
                    });
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SiteDetails({
  site,
  groups,
  notify,
}: {
  site: Record<string, unknown>;
  groups: Record<string, EditableString[]>;
  notify: (s: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(SITE_FIELDS.map((f) => [f.key, String(site[f.key] ?? "")]))
  );
  const bilingual = (groups.site ?? []).concat(groups.footer ?? []);
  const [bi, setBi] = useState<Record<string, { en: string; bn: string }>>(() =>
    Object.fromEntries(bilingual.map((s) => [`${s.root}|${s.path}`, { ...s.values }]))
  );
  type Social = { id: string; platform: string; label: string; href: string };
  const [socials, setSocials] = useState<Social[]>(
    () => (Array.isArray(site.socials) ? (site.socials as Social[]) : [])
  );
  const [logo, setLogo] = useState(String(site.logo ?? ""));
  const [favicon, setFavicon] = useState(String(site.favicon ?? ""));
  const [pending, start] = useTransition();

  function saveOne(path: string, value: string, msg: string) {
    start(async () => {
      const r = await saveContent([{ root: "site", path, value }]);
      notify(r.ok ? msg : r.error);
    });
  }

  function save() {
    const edits = [
      ...SITE_FIELDS.map((f) => ({ root: "site", path: f.key, value: values[f.key] })),
      { root: "site", path: "socials", value: socials.filter((s) => s.href.trim()) },
      ...bilingual.map((s) => ({
        root: s.root,
        path: s.path,
        value: bi[`${s.root}|${s.path}`],
      })),
    ];
    start(async () => {
      const r = await saveContent(edits);
      notify(r.ok ? "Saved. The public site is already showing it." : r.error);
    });
  }

  const setSocial = (i: number, patch: Partial<Social>) =>
    setSocials((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  return (
    <div className="max-w-3xl space-y-8">
      <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
        Anything you leave blank simply does not appear on the site. Nothing here breaks
        the page.
      </p>

      <div className="space-y-6">
        <h3 className="font-display text-lg">Logo &amp; favicon</h3>
        <ImageUpload
          label="Logo"
          variant="logo"
          value={logo}
          hint="PNG with a transparent background, wide rather than tall (about 200×60px or larger). Shown ~32px tall in the header and ~36px in the footer. Leave blank to use the KBS wordmark."
          onChange={(url) => {
            setLogo(url);
            saveOne("logo", url, url ? "Logo updated." : "Logo cleared.");
          }}
        />
        <ImageUpload
          label="Favicon"
          variant="favicon"
          value={favicon}
          hint="A square image, at least 256×256px (512 is better). We centre-crop it and generate the 32px browser-tab icon and the 180px iOS icon. PNG with a transparent or solid background."
          onChange={(url) => {
            setFavicon(url);
            saveOne("favicon", url, url ? "Favicon updated — it may take a minute to refresh in the tab." : "Favicon cleared.");
          }}
        />
      </div>

      <div className="space-y-5 border-t border-[color:var(--panel-edge)] pt-8">
        {SITE_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="font-mono-label text-[color:var(--text-quiet)]">{f.label}</label>
            <input
              className={`${field} mt-2`}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
            {f.hint && <p className="mt-1.5 text-xs text-[color:var(--text-quiet)]">{f.hint}</p>}
          </div>
        ))}
      </div>

      <div className="space-y-5 border-t border-[color:var(--panel-edge)] pt-8">
        {bilingual.map((s) => (
          <BiField
            key={`${s.root}|${s.path}`}
            label={s.label}
            value={bi[`${s.root}|${s.path}`]}
            onChange={(v) => setBi((b) => ({ ...b, [`${s.root}|${s.path}`]: v }))}
          />
        ))}
      </div>

      <div className="border-t border-[color:var(--panel-edge)] pt-8">
        <div className="flex items-center">
          <h3 className="font-display text-lg">Footer social links</h3>
          <button
            type="button"
            className="btn btn-ghost ml-auto text-xs"
            onClick={() =>
              setSocials((l) => [
                ...l,
                { id: Math.random().toString(36).slice(2, 9), platform: "facebook", label: "", href: "" },
              ])
            }
          >
            Add link
          </button>
        </div>
        <p className="mt-1 text-xs text-[color:var(--text-quiet)]">
          Each appears as an icon in the footer. Paste the full profile URL.
        </p>

        <div className="mt-4 space-y-3">
          {socials.map((s, i) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[color:var(--panel-edge)] p-3"
            >
              <select
                className={`${field} w-auto`}
                value={s.platform}
                onChange={(e) => setSocial(i, { platform: e.target.value })}
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                className={`${field} flex-1`}
                placeholder="https://…"
                value={s.href}
                onChange={(e) => setSocial(i, { href: e.target.value })}
              />
              {s.platform === "other" && (
                <input
                  className={`${field} w-40`}
                  placeholder="Label"
                  value={s.label}
                  onChange={(e) => setSocial(i, { label: e.target.value })}
                />
              )}
              <button
                type="button"
                className="text-sm text-[color:var(--clay)] hover:underline"
                onClick={() => setSocials((l) => l.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          {socials.length === 0 && (
            <p className="text-sm text-[color:var(--text-quiet)]">No social links yet.</p>
          )}
        </div>
      </div>

      <button className="btn btn-primary" onClick={save} disabled={pending}>
        {pending ? "Saving" : "Save changes"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TeamSection({ notify }: { notify: (s: string) => void }) {
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [pending, start] = useTransition();

  const load = () =>
    start(async () => {
      const r = await listStaff();
      if (r.ok) setStaff(r.staff);
      else notify(r.error);
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function add() {
    if (!email.trim() || password.length < 8) {
      notify("Enter an email and a password of at least 8 characters.");
      return;
    }
    start(async () => {
      const r = await addManager({ email, password, fullName });
      if (r.ok) {
        notify("Manager added. They can sign in with that email and password.");
        setEmail("");
        setFullName("");
        setPassword("");
        const list = await listStaff();
        if (list.ok) setStaff(list.staff);
      } else {
        notify(r.error);
      }
    });
  }

  function remove(userId: string) {
    start(async () => {
      const r = await removeStaff(userId);
      if (r.ok) {
        notify("Manager removed.");
        setStaff((s) => (s ? s.filter((m) => m.userId !== userId) : s));
      } else {
        notify(r.error);
      }
    });
  }

  return (
    <div className="max-w-3xl">
      <h3 className="font-display text-lg">Team</h3>
      <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
        A manager can check orders, change order status and add products. They cannot edit
        or delete orders, delete products, or reach payments, integrations, pages or the
        site settings.
      </p>

      <div className="mt-4 space-y-2">
        {staff === null && (
          <p className="text-sm text-[color:var(--text-quiet)]">Loading…</p>
        )}
        {staff?.map((m) => (
          <div
            key={m.userId}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-[color:var(--panel-edge)] p-3 text-sm"
          >
            <span className="flex-1 break-all">{m.email}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                m.role === "admin"
                  ? "bg-[color:var(--accent-muted)] text-[color:var(--text-primary)]"
                  : "bg-[color:var(--panel)] text-[color:var(--text-secondary)]"
              }`}
            >
              {m.role === "admin" ? "Full admin" : "Manager"}
            </span>
            {m.role === "manager" && (
              <button
                type="button"
                disabled={pending}
                className="text-sm text-[color:var(--clay)] hover:underline disabled:opacity-50"
                onClick={() => remove(m.userId)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3 rounded-xl border border-[color:var(--panel-edge)] p-4">
        <h4 className="font-mono-label text-[color:var(--text-quiet)]">Add a manager</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={field}
            type="email"
            placeholder="manager@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={field}
            placeholder="Full name (optional)"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <input
          className={field}
          type="text"
          placeholder="Temporary password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary" onClick={add} disabled={pending}>
          {pending ? "Working…" : "Add manager"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TextEditor({
  groups,
  notify,
}: {
  groups: Record<string, EditableString[]>;
  notify: (s: string) => void;
}) {
  const sections = useMemo(
    () => Object.keys(groups).filter((k) => !["site", "footer"].includes(k)),
    [groups]
  );
  const [open, setOpen] = useState(sections[0] ?? "");
  const [edited, setEdited] = useState<Record<string, { en: string; bn: string }>>({});
  const [pending, start] = useTransition();

  const key = (s: EditableString) => `${s.root}|${s.path}`;
  const dirty = Object.keys(edited).length;

  function save() {
    const edits = Object.entries(edited).map(([k, value]) => {
      const [root, path] = k.split("|");
      return { root, path, value };
    });
    start(async () => {
      const r = await saveContent(edits);
      if (r.ok) {
        setEdited({});
        notify("Saved. The public site is already showing it.");
      } else notify(r.error);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Every word on the public site, in both languages.
        </p>
        <button className="btn btn-primary ml-auto text-sm" onClick={save} disabled={!dirty || pending}>
          {pending ? "Saving" : dirty ? `Save ${dirty} change${dirty > 1 ? "s" : ""}` : "No changes"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setOpen(s)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors duration-200 ${
              open === s
                ? "border-[color:var(--accent)] text-[color:var(--accent)]"
                : "border-[color:var(--panel-edge)] text-[color:var(--text-secondary)]"
            }`}
          >
            {s.replace(/([a-z])([A-Z])/g, "$1 $2")}
          </button>
        ))}
      </div>

      <div className="max-w-3xl space-y-5">
        {(groups[open] ?? []).map((s) => (
          <BiField
            key={key(s)}
            label={s.label}
            value={edited[key(s)] ?? s.values}
            onChange={(v) => setEdited((e) => ({ ...e, [key(s)]: v }))}
          />
        ))}
      </div>
    </div>
  );
}

function BiField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { en: string; bn: string };
  onChange: (v: { en: string; bn: string }) => void;
}) {
  const long = (value.en?.length ?? 0) > 70 || (value.bn?.length ?? 0) > 70;
  const Input = long ? "textarea" : "input";
  return (
    <div className="rounded-xl border border-[color:var(--panel-edge)] p-4">
      <p className="font-mono-label text-[color:var(--text-quiet)]">{label}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-[color:var(--text-quiet)]">English</span>
          <Input
            className={`${field} mt-1`}
            rows={long ? 3 : undefined}
            value={value.en}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, en: e.target.value })
            }
          />
        </label>
        <label className="block">
          <span className="text-xs text-[color:var(--text-quiet)]">বাংলা</span>
          <Input
            className={`${field} mt-1`}
            rows={long ? 3 : undefined}
            value={value.bn}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, bn: e.target.value })
            }
          />
        </label>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function IntegrationsPanel({
  data,
  notify,
}: {
  data: Record<string, unknown>;
  notify: (s: string) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(INTEGRATION_FIELDS.map((f) => [f.key, String(data[f.key] ?? "")]))
  );
  const [pending, start] = useTransition();

  function save() {
    const edits = INTEGRATION_FIELDS.map((f) => ({
      root: "integrations",
      path: f.key,
      value: values[f.key].trim(),
    }));
    start(async () => {
      const r = await saveContent(edits);
      notify(r.ok ? "Saved. The tags update on the next page load." : r.error);
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="rounded-xl border border-[color:var(--panel-edge)] bg-[color:var(--panel)]/40 p-4 text-sm leading-relaxed text-[color:var(--text-secondary)]">
        <p className="font-mono-label text-[color:var(--text-quiet)]">
          Verifying the domain with Google
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Open{" "}
            <a
              className="text-[color:var(--accent)] hover:underline"
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Search Console
            </a>{" "}
            and add a <strong>URL prefix</strong> property for{" "}
            <code>https://kbsbd.com</code>.
          </li>
          <li>
            Choose the <strong>HTML tag</strong> method. Google shows a line like{" "}
            <code className="break-all">
              &lt;meta name=&quot;google-site-verification&quot; content=&quot;…&quot;&gt;
            </code>
          </li>
          <li>
            Paste that whole line (or just the code inside{" "}
            <code>content=&quot;…&quot;</code>) into the field below and press{" "}
            <strong>Save changes</strong>.
          </li>
          <li>
            Wait about a minute, then click <strong>Verify</strong> back in Search Console.
            The tag is now in the <code>&lt;head&gt;</code> of every page.
          </li>
        </ol>
        <p className="mt-2 text-[color:var(--text-quiet)]">
          Bing Webmaster Tools works the same way. The DNS / TXT-record method needs
          nothing here — that one is done at the domain registrar.
        </p>
      </div>

      <div className="space-y-5">
        {INTEGRATION_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="font-mono-label text-[color:var(--text-quiet)]">
              {f.label}
            </label>
            <input
              className={`${field} mt-2 font-mono`}
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
            {f.hint && (
              <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--text-quiet)]">
                {f.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-[color:var(--text-quiet)]">
        Every field is optional. A blank field loads nothing — no third-party script and
        no tag. None of these load on this dashboard, only on the public site.
      </p>

      <button className="btn btn-primary" onClick={save} disabled={pending}>
        {pending ? "Saving" : "Save changes"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const EMPTY_PROJECT: Project = {
  id: "",
  image: "",
  title_en: "",
  title_bn: "",
  location_en: "",
  location_bn: "",
  status_en: "",
  status_bn: "",
  sort: 0,
  published: false,
};

function Projects({ rows, notify }: { rows: Project[]; notify: (s: string) => void }) {
  const [draft, setDraft] = useState<Project | null>(null);
  const [pending, start] = useTransition();

  function save(p: Project) {
    start(async () => {
      const { id, ...rest } = p;
      const r = await saveProject(id ? { id, ...rest } : rest);
      notify(r.ok ? "Project saved." : r.error);
      if (r.ok) setDraft(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <p className="max-w-[52ch] text-sm leading-relaxed text-[color:var(--text-secondary)]">
          The projects section only appears on the public site once at least one project
          here is published, so it never shows an empty shelf.
        </p>
        <button className="btn btn-primary ml-auto text-sm" onClick={() => setDraft(EMPTY_PROJECT)}>
          Add a project
        </button>
      </div>

      {draft && (
        <div className="max-w-3xl space-y-4 rounded-2xl border border-[color:var(--accent)] p-5">
          <ImageUpload
            label="Project image"
            value={draft.image}
            onChange={(url) => setDraft({ ...draft, image: url })}
          />
          {[
            ["title_en", "Title (English)"],
            ["title_bn", "Title (বাংলা)"],
            ["location_en", "Location (English)"],
            ["location_bn", "Location (বাংলা)"],
            ["status_en", "Status (English)"],
            ["status_bn", "Status (বাংলা)"],
          ].map(([k, label]) => (
            <div key={k}>
              <label className="font-mono-label text-[color:var(--text-quiet)]">{label}</label>
              <input
                className={`${field} mt-2`}
                value={String(draft[k as keyof Project] ?? "")}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
            />
            Published
          </label>
          <div className="flex gap-3">
            <button className="btn btn-primary text-sm" onClick={() => save(draft)} disabled={pending}>
              {pending ? "Saving" : "Save project"}
            </button>
            <button className="btn btn-ghost text-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border border-[color:var(--panel-edge)] px-4 py-3"
          >
            <span className="font-medium">{p.title_en || "Untitled"}</span>
            <span className="text-sm text-[color:var(--text-quiet)]">{p.location_en}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                p.published
                  ? "bg-[color:var(--accent-muted)] text-[color:var(--accent)]"
                  : "text-[color:var(--text-quiet)]"
              }`}
            >
              {p.published ? "published" : "draft"}
            </span>
            <div className="ml-auto flex gap-3 text-sm">
              <button className="hover:text-[color:var(--accent)]" onClick={() => setDraft(p)}>
                Edit
              </button>
              <button
                className="text-[color:var(--clay)] hover:underline"
                onClick={() =>
                  start(async () => {
                    const r = await deleteProject(p.id);
                    notify(r.ok ? "Project removed." : r.error);
                  })
                }
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Internal({
  notes,
  notify,
}: {
  notes: Array<{ key: string; value: string }>;
  notify: (s: string) => void;
}) {
  const [value, setValue] = useState(
    notes.find((n) => n.key === "rajuk_status")?.value ?? ""
  );
  const [pending, start] = useTransition();

  return (
    <div className="max-w-3xl space-y-5">
      <div className="rounded-xl border border-[color:var(--clay-deep)] bg-[color:var(--panel)] p-4">
        <p className="font-mono-label text-[color:var(--clay)]">Staff only</p>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          Nothing on this tab is rendered on the public site. It is stored in a separate
          table with its own access rules, so approval status cannot leak onto a page by
          accident.
        </p>
      </div>

      <div>
        <label className="font-mono-label text-[color:var(--text-quiet)]">
          RAJUK approval status
        </label>
        <textarea
          rows={3}
          className={`${field} mt-2`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await saveInternalNote("rajuk_status", value);
            notify(r.ok ? "Note saved." : r.error);
          })
        }
      >
        {pending ? "Saving" : "Save note"}
      </button>
    </div>
  );
}
