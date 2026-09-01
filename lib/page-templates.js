/*
 * Client-safe descriptions of the page templates and section kinds.
 *
 * The admin picks a style when creating a page, and a kind for each block
 * inside it. Both lists live here so the dashboard forms and the renderer
 * agree on the vocabulary, and so a "use client" form can import them without
 * pulling in the Supabase server client.
 *
 * Keep these in sync with the CHECK constraints in migrations 0007 and 0008 —
 * the database is the real gatekeeper, this is the friendly label for it.
 */

export const PAGE_TEMPLATES = [
  {
    value: "standard",
    label: "Standard",
    blurb:
      "Centred banner over a photo, then content sections on a light background. Matches the About page.",
  },
  {
    value: "feature",
    label: "Feature",
    blurb:
      "Tall dark banner with the heading set to the left, then light content below. Matches the NRB and Landowner pages.",
  },
  {
    value: "text",
    label: "Text",
    blurb:
      "Light banner and a single narrow reading column. Best for policies, terms and long articles.",
  },
];

/*
 * Section kinds, grouped so the dropdown stays readable: the general-purpose
 * blocks first, then the ones lifted from a specific page.
 */
export const SECTION_KINDS = [
  // --- general ---
  {
    value: "richtext",
    label: "Text block",
    group: "General",
    blurb: "A heading and paragraphs. Leave a blank line between paragraphs.",
  },
  {
    value: "image_text",
    label: "Text with image",
    group: "General",
    blurb: "A heading and paragraphs beside a picture. You choose which side the picture sits on.",
  },
  {
    value: "checklist",
    label: "Ticked list",
    group: "General",
    blurb:
      "A heading and a list with tick marks, one item per line. Set the style to “Two columns” for the wider NRB layout.",
  },
  {
    value: "cards",
    label: "Card grid",
    group: "General",
    blurb: "A grid of numbered cards. One per line, written as: Title | Description",
  },
  {
    value: "cta",
    label: "Call to action",
    group: "General",
    blurb: "A short band with a heading, a line of text and one button.",
  },
  {
    value: "faq",
    label: "Questions and answers",
    group: "General",
    blurb:
      "The expanding accordion from the Landowner page. One per line: Question | Answer",
  },

  // --- lifted from the existing designs ---
  {
    value: "legacy_split",
    label: "Legacy block (About)",
    group: "From your pages",
    blurb:
      "The About page opener: a tall photo with a smaller one floating over it, the ring of rotating letters around a play button, and text alongside.",
  },
  {
    value: "feature_split",
    label: "Text and image split",
    group: "From your pages",
    blurb:
      "The mission/vision layout: several heading-and-paragraph groups plus a ticked list, beside a picture that can carry its own badge and video button.",
  },
  {
    value: "marquee",
    label: "Scrolling text strip",
    group: "From your pages",
    blurb: "The outlined text that slides across the page. Put the phrase in Paragraphs.",
  },
  {
    value: "timeline",
    label: "Company timeline",
    group: "From your pages",
    blurb:
      "The interactive year-by-year history. Entries are managed separately under Timeline so several pages can share one history.",
  },
  {
    value: "services",
    label: "Service grid (NRB)",
    group: "From your pages",
    blurb: "The icon cards. One per line: Title | Description",
  },
  {
    value: "video_split",
    label: "Video and text",
    group: "From your pages",
    blurb:
      "A YouTube still with a play badge that opens the lightbox in place, beside text. Paste the video link.",
  },
  {
    value: "review_slider",
    label: "Customer reviews",
    group: "From your pages",
    blurb: "One per line: Name | Project or role | What they said",
  },
  {
    value: "contact_block",
    label: "Contact band",
    group: "From your pages",
    blurb:
      "The closing band: heading, text, contact cards, and optionally the service finder or the enquiry form.",
  },
];

/** Which kinds use the flat `items` list, and how their lines are written. */
export const ITEM_KINDS = {
  checklist: "One item per line.",
  faq: "One per line: Question | Answer",
  cards: "One per line: Title | Description",
};

/** Which kinds use the `blocks` list, and how their lines are written. */
export const BLOCK_KINDS = {
  feature_split: "One heading group per line: Heading | Paragraph",
  services: "One card per line: Title | Description",
  review_slider: "One review per line: Name | Project or role | What they said",
  contact_block: "One card per line: icon | Title | Subtitle | link (icon = phone, chat, map or mail)",
};

export function templateLabel(value) {
  return PAGE_TEMPLATES.find((t) => t.value === value)?.label || value;
}

export function sectionLabel(value) {
  return SECTION_KINDS.find((k) => k.value === value)?.label || value;
}

/**
 * Turns the textarea the admin types into the jsonb shape the renderer wants.
 *
 * Deliberately line-based rather than a JSON field or a nested repeater UI:
 * an admin can type it without being taught a format, and a stray character
 * degrades to a slightly wrong label rather than a parse error that loses the
 * whole section.
 */
export function parseItems(kind, raw) {
  const lines = String(raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (kind === "checklist") return lines;

  if (kind === "faq") {
    return lines.map((line) => {
      const [question, ...rest] = line.split("|");
      return { question: question.trim(), answer: rest.join("|").trim() };
    });
  }

  if (kind === "cards") {
    return lines.map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), body: rest.join("|").trim() };
    });
  }

  return [];
}

/** The inverse, for putting an existing section back into the textarea. */
export function itemsToText(kind, items) {
  if (!Array.isArray(items)) return "";

  if (kind === "checklist") return items.join("\n");
  if (kind === "faq") {
    return items.map((i) => `${i.question || ""} | ${i.answer || ""}`).join("\n");
  }
  if (kind === "cards") {
    return items.map((i) => `${i.title || ""} | ${i.body || ""}`).join("\n");
  }
  return "";
}

/**
 * Same idea for `blocks`.
 *
 * `existing` is the section's current blocks. It is used to carry forward
 * values the line format has no column for — specifically the SVG path on a
 * service card. Icons are matched by position, so editing the words of the
 * third service keeps the third icon; adding a card past the end falls back to
 * the renderer's default glyph rather than rendering an empty box.
 */
export function parseBlocks(kind, raw, existing = []) {
  const lines = String(raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const prior = Array.isArray(existing) ? existing : [];

  if (kind === "feature_split") {
    return lines.map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), body: rest.join("|").trim() };
    });
  }

  if (kind === "services") {
    return lines.map((line, index) => {
      const [title, ...rest] = line.split("|");
      const block = { title: title.trim(), body: rest.join("|").trim() };
      if (prior[index]?.icon) block.icon = prior[index].icon;
      return block;
    });
  }

  if (kind === "review_slider") {
    return lines.map((line) => {
      const parts = line.split("|");
      return {
        name: (parts[0] || "").trim(),
        role: (parts[1] || "").trim(),
        text: parts.slice(2).join("|").trim(),
        stars: 5,
      };
    });
  }

  if (kind === "contact_block") {
    return lines.map((line) => {
      const parts = line.split("|");
      return {
        icon: (parts[0] || "phone").trim(),
        title: (parts[1] || "").trim(),
        body: (parts[2] || "").trim(),
        href: (parts[3] || "").trim() || null,
      };
    });
  }

  return [];
}

export function blocksToText(kind, blocks) {
  if (!Array.isArray(blocks)) return "";

  if (kind === "feature_split" || kind === "services") {
    return blocks.map((b) => `${b.title || ""} | ${b.body || ""}`).join("\n");
  }
  if (kind === "review_slider") {
    return blocks.map((b) => `${b.name || ""} | ${b.role || ""} | ${b.text || ""}`).join("\n");
  }
  if (kind === "contact_block") {
    return blocks
      .map((b) => `${b.icon || "phone"} | ${b.title || ""} | ${b.body || ""} | ${b.href || ""}`)
      .join("\n");
  }
  return "";
}

/** Lowercases and hyphenates a title into a URL-safe slug. */
export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
