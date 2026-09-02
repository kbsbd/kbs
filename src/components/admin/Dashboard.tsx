"use client";

import { useMemo, useState, useTransition } from "react";
import type { EditableString } from "@/lib/editable";
import { SITE_FIELDS, INTEGRATION_FIELDS } from "@/lib/editable";
import ImageUpload from "@/components/admin/ImageUpload";
import {
  saveContent,
  setBookingStatus,
  saveProject,
  deleteProject,
  saveInternalNote,
  signOut,
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
  groups: Record<string, EditableString[]>;
  site: Record<string, unknown>;
  integrations: Record<string, unknown>;
  bookings: Booking[];
  projects: Project[];
  notes: Array<{ key: string; value: string }>;
};

const TABS = [
  "Bookings",
  "Site details",
  "Text",
  "Projects",
  "Integrations",
  "Internal",
] as const;
type Tab = (typeof TABS)[number];

const STATUSES = ["new", "contacted", "visit booked", "visited", "closed"];

const field =
  "w-full rounded-lg border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3 py-2 text-sm outline-none transition-colors duration-300 focus:border-[color:var(--accent)]";

export default function Dashboard({
  locale,
  email,
  groups,
  site,
  integrations,
  bookings,
  projects,
  notes,
}: Props) {
  const [tab, setTab] = useState<Tab>("Bookings");
  const [toast, setToast] = useState("");

  return (
    <main className="relative z-[2] min-h-screen">
      <header className="border-b border-[color:var(--panel-edge)] bg-[color:var(--canvas-deep)]">
        <div className="mx-auto flex max-w-[80rem] flex-wrap items-center gap-4 px-5 py-4 sm:px-8">
          <span className="font-display text-lg">KBS admin</span>
          <span className="text-xs text-[color:var(--text-quiet)]">{email}</span>
          <div className="ml-auto flex items-center gap-4">
            <a
              href={`/${locale}`}
              className="text-sm text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--accent)]"
            >
              View site
            </a>
            <form action={signOut}>
              <button className="text-sm text-[color:var(--text-secondary)] transition-colors duration-300 hover:text-[color:var(--accent)]">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[80rem] gap-1 overflow-x-auto px-5 sm:px-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors duration-200 ${
                tab === t
                  ? "border-[color:var(--accent)] text-[color:var(--text-primary)]"
                  : "border-transparent text-[color:var(--text-quiet)] hover:text-[color:var(--text-secondary)]"
              }`}
            >
              {t}
              {t === "Bookings" && bookings.filter((b) => b.status === "new").length > 0 && (
                <span className="ml-2 rounded-full bg-[color:var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold text-[#07101a]">
                  {bookings.filter((b) => b.status === "new").length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {toast && (
        <div
          role="status"
          className="mx-auto mt-4 max-w-[80rem] px-5 sm:px-8"
          onAnimationEnd={() => setToast("")}
        >
          <p className="rounded-lg border border-[color:var(--accent)] bg-[color:var(--accent-muted)] px-4 py-2 text-sm">
            {toast}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-[80rem] px-5 py-10 sm:px-8">
        {tab === "Bookings" && <Bookings rows={bookings} notify={setToast} />}
        {tab === "Site details" && <SiteDetails site={site} groups={groups} notify={setToast} />}
        {tab === "Text" && <TextEditor groups={groups} notify={setToast} />}
        {tab === "Projects" && <Projects rows={projects} notify={setToast} />}
        {tab === "Integrations" && (
          <IntegrationsPanel data={integrations} notify={setToast} />
        )}
        {tab === "Internal" && <Internal notes={notes} notify={setToast} />}
      </div>
    </main>
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
  const [pending, start] = useTransition();

  function save() {
    const edits = [
      ...SITE_FIELDS.map((f) => ({ root: "site", path: f.key, value: values[f.key] })),
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

  return (
    <div className="max-w-3xl space-y-8">
      <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
        Anything you leave blank simply does not appear on the site. Nothing here breaks
        the page.
      </p>

      <div className="space-y-5">
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

      <button className="btn btn-primary" onClick={save} disabled={pending}>
        {pending ? "Saving" : "Save changes"}
      </button>
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
