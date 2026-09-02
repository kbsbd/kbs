import { seed, LOCALES, type Locale } from "@/content/seed";

/**
 * Walks the seed and finds every bilingual string in it.
 *
 * The alternative was hand building a form field for each of the hundred or so
 * strings on the site, which would go stale the first time a section changed.
 * This derives the editor from the content itself, so anything added to the
 * seed becomes editable automatically.
 */

export type EditableString = {
  /** dotted path from the top level key, e.g. "premise.head" */
  path: string;
  /** the top level key the override row is stored under */
  root: string;
  label: string;
  values: Record<Locale, string>;
};

export type EditablePlain = {
  path: string;
  root: string;
  label: string;
  value: string;
};

const isBilingual = (v: unknown): v is Record<Locale, string> =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  LOCALES.every((l) => typeof (v as Record<string, unknown>)[l] === "string");

const prettify = (path: string) =>
  path
    .split(".")
    .map((seg) => (/^\d+$/.test(seg) ? `#${Number(seg) + 1}` : seg))
    .join(" › ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");

function walk(
  node: unknown,
  root: string,
  path: string,
  out: EditableString[]
): void {
  if (isBilingual(node)) {
    out.push({
      path,
      root,
      label: prettify(path),
      values: { en: node.en, bn: node.bn },
    });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, root, path ? `${path}.${i}` : String(i), out));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      walk(v, root, path ? `${path}.${k}` : k, out);
    }
  }
}

/** Every bilingual string on the site, grouped by the section it belongs to. */
export function editableStrings(
  content: typeof seed
): Record<string, EditableString[]> {
  const groups: Record<string, EditableString[]> = {};
  for (const [root, node] of Object.entries(content)) {
    const out: EditableString[] = [];
    walk(node, root, "", out);
    if (out.length) groups[root] = out;
  }
  return groups;
}

/** Writes a value at a dotted path, creating the objects it needs on the way. */
export function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  if (!path) return value;
  const parts = path.split(".");
  let node = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextIsIndex = /^\d+$/.test(parts[i + 1]);
    if (typeof node[key] !== "object" || node[key] === null) {
      node[key] = nextIsIndex ? [] : {};
    }
    node = node[key] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
  return target;
}

export function getPath(source: unknown, path: string): unknown {
  if (!path) return source;
  return path
    .split(".")
    .reduce<unknown>((acc, key) => (acc == null ? acc : (acc as Record<string, unknown>)[key]), source);
}

/** The plain, non-bilingual site settings the client fills in first. */
export const SITE_FIELDS: Array<{ key: string; label: string; hint?: string; type?: string }> = [
  { key: "phone", label: "Phone number", hint: "Shown in the footer and used by the call link" },
  {
    key: "whatsapp",
    label: "WhatsApp number",
    hint: "Digits with country code, e.g. 8801313401405. Powers the floating WhatsApp button.",
  },
  { key: "email", label: "Email address" },
  { key: "mapEmbed", label: "Google Maps embed URL", hint: "Leave blank to hide the map" },
  { key: "founded", label: "Founded (year)", hint: 'Shown in the footer as "SINCE 1995"' },
];

/**
 * The Integrations tab. Stored under the `integrations` key, separate from the
 * business details. Blank = that tag never loads.
 */
export const INTEGRATION_FIELDS: Array<{
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
}> = [
  {
    key: "gtmId",
    label: "Google Tag Manager",
    placeholder: "GTM-XXXXXXX",
    hint: "tagmanager.google.com → your container → the GTM-XXXXXXX id at the top. Once this is set you can add Google Ads, GA, TikTok, LinkedIn and any other tag from inside GTM without touching the site.",
  },
  {
    key: "ga4Id",
    label: "Google Analytics 4",
    placeholder: "G-XXXXXXXXXX",
    hint: "Only needed if you are NOT using Tag Manager. Analytics → Admin → Data streams → your stream → Measurement ID.",
  },
  {
    key: "metaPixelId",
    label: "Meta (Facebook) Pixel ID",
    placeholder: "123456789012345",
    hint: "Events Manager → your pixel → Settings. The contact form and the site-visit booking both fire the Lead event.",
  },
  {
    key: "googleSiteVerification",
    label: "Google Search Console — verification",
    placeholder: '<meta name="google-site-verification" content="..."> or just the code',
    hint: "In Search Console pick the URL-prefix property for https://kbsbd.com, choose the “HTML tag” method, and paste the whole tag (or just the code) here. Save, then click Verify back in Search Console.",
  },
  {
    key: "bingSiteVerification",
    label: "Bing Webmaster Tools — verification",
    placeholder: '<meta name="msvalidate.01" content="..."> or just the code',
    hint: "Bing Webmaster Tools → Add site → “HTML Meta Tag” method. Paste the tag or code, save, then verify in Bing.",
  },
];
