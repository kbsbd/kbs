"use client";

import { useActionState, useState } from "react";
import MediaPicker from "@/components/admin/MediaPicker";
import { PAGE_TEMPLATES, slugify } from "@/lib/page-templates";
import { PAGE_PRESET_CHOICES } from "@/lib/page-presets";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

/*
 * The page's own settings — used both for creating a new page and for editing
 * an existing one, because the fields are identical apart from the submit
 * label and the "add to the menu" checkbox.
 *
 * The slug field mirrors the title as you type until you edit it yourself, at
 * which point it stops following. That is the behaviour people expect from a
 * CMS: helpful by default, never fighting a deliberate choice.
 */
export default function PageSettingsForm({ action, page, mode = "edit" }) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(page?.slug));
  const [template, setTemplate] = useState(page?.template || "standard");
  /* On a NEW page the style picker chooses a preset, which sets the template
     AND fills the page with that design's sections. On an existing page there
     is nothing to seed, so it is just the template. */
  const [preset, setPreset] = useState("blank");

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const activeTemplate = PAGE_TEMPLATES.find((t) => t.value === template);
  const activePreset = PAGE_PRESET_CHOICES.find((c) => c.value === preset);

  return (
    <form action={formAction} className={styles.form}>
      {page?.id && <input type="hidden" name="id" value={page.id} />}
      {page?.slug && <input type="hidden" name="previous_slug" value={page.slug} />}

      <div className={styles.grid2}>
        <label>
          Page name
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Company Profile"
          />
          <span className={styles.fieldHint}>Shown as the big heading on the banner.</span>
        </label>

        <label>
          Web address
          <input
            type="text"
            name="slug"
            value={effectiveSlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="company-profile"
          />
          <span className={styles.fieldHint}>
            The page will live at <code>/{effectiveSlug || "…"}</code>. Lowercase letters, numbers
            and hyphens.
          </span>
        </label>
      </div>

      {mode === "create" ? (
        <label>
          Style
          <select
            name="preset"
            value={preset}
            onChange={(e) => {
              const value = e.target.value;
              setPreset(value);
              const choice = PAGE_PRESET_CHOICES.find((c) => c.value === value);
              if (choice) setTemplate(choice.template);
            }}
          >
            {PAGE_PRESET_CHOICES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.fieldHint}>{activePreset?.blurb}</span>
          {/* The chosen preset decides the template; submitted alongside so the
              action doesn't have to look it up again. */}
          <input type="hidden" name="template" value={template} />
        </label>
      ) : (
        <label>
          Style
          <select name="template" value={template} onChange={(e) => setTemplate(e.target.value)}>
            {PAGE_TEMPLATES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {activeTemplate && <span className={styles.fieldHint}>{activeTemplate.blurb}</span>}
          <span className={styles.fieldHint}>
            Changing this swaps the banner and page frame. Your sections are untouched.
          </span>
        </label>
      )}

      <MediaPicker
        name="banner_image_url"
        label="Banner photo"
        defaultValue={page?.banner_image_url || ""}
        folder="kbs/pages"
        hint="Sits behind the page name under a dark overlay. A wide photo works best — around 1920px."
      />

      <label>
        Banner headline
        <textarea
          name="banner_title"
          rows={2}
          defaultValue={page?.banner_title || ""}
          placeholder="Defaults to the page name"
        />
        <span className={styles.fieldHint}>
          The large text on the banner. Often a full sentence — the page name above stays short
          for menus and search results.
        </span>
      </label>

      <label>
        Banner subtitle
        <textarea
          name="banner_subtitle"
          rows={2}
          defaultValue={page?.banner_subtitle || ""}
          placeholder="One line under the page name. Optional."
        />
      </label>

      <hr className={styles.divider} />

      <h3 className={styles.cardTitle} style={{ marginBottom: "1rem" }}>
        Opening text
      </h3>
      <p className={styles.fieldHint} style={{ marginTop: "-0.5rem" }}>
        An optional lead-in between the banner and the first section. Leave both empty to go
        straight into the sections.
      </p>

      <label>
        Opening heading
        <input type="text" name="intro_heading" defaultValue={page?.intro_heading || ""} />
      </label>

      <label>
        Opening paragraphs
        <textarea name="intro_body" rows={4} defaultValue={page?.intro_body || ""} />
        <span className={styles.fieldHint}>Leave a blank line between paragraphs.</span>
      </label>

      <hr className={styles.divider} />

      <h3 className={styles.cardTitle} style={{ marginBottom: "1rem" }}>
        Search &amp; sharing
      </h3>

      <label>
        Search result title
        <input
          type="text"
          name="meta_title"
          defaultValue={page?.meta_title || ""}
          placeholder="Defaults to the page name"
        />
      </label>

      <label>
        Search result description
        <textarea
          name="meta_description"
          rows={2}
          defaultValue={page?.meta_description || ""}
          maxLength={320}
        />
        <span className={styles.fieldHint}>Around 150–160 characters reads best in Google.</span>
      </label>

      <MediaPicker
        name="og_image_url"
        label="Share image"
        defaultValue={page?.og_image_url || ""}
        folder="kbs/pages"
        hint="Shown when the page is shared on Facebook, WhatsApp or LinkedIn. 1200×630."
      />

      <div className={styles.grid2}>
        <label className={styles.inlineCheck}>
          <input type="hidden" name="is_published" value="off" />
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={page ? page.is_published : true}
          />
          <span>
            Published
            <span className={styles.fieldHint}>Unticked, the page returns “not found” to visitors.</span>
          </span>
        </label>

        <label className={styles.inlineCheck}>
          <input type="checkbox" name="noindex" defaultChecked={page?.noindex || false} />
          <span>
            Hide from search engines
            <span className={styles.fieldHint}>
              The page stays reachable by its address, but leaves Google and the sitemap.
            </span>
          </span>
        </label>
      </div>

      <label>
        Position in the list
        <input
          type="number"
          name="sort_order"
          defaultValue={page?.sort_order ?? 100}
        />
        <span className={styles.fieldHint}>Only affects the order of this admin list.</span>
      </label>

      {mode === "create" && (
        <label className={styles.inlineCheck}>
          <input type="checkbox" name="add_to_menu" defaultChecked />
          <span>
            Also add it to the menu
            <span className={styles.fieldHint}>
              Adds a drawer link pointing at this page. You can move or rename it afterwards under
              Navigation.
            </span>
          </span>
        </label>
      )}

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : mode === "create" ? "Create page" : "Save changes"}
      </button>
    </form>
  );
}
