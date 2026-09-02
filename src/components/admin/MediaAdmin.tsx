"use client";

import { useState, useTransition } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { saveContent } from "@/app/[locale]/admin/actions";

/**
 * The Media tab — every image on the marketing pages in one place.
 *
 * Scalar slots (premise, building, static hero) save just their `image` key.
 * The item grids and the two lists save their WHOLE array back, because the
 * content merge replaces arrays wholesale rather than merging by index — so the
 * array handed here is the already-merged one and every field it carries is
 * preserved on save.
 */

type L = { en: string; bn: string };
type Item = { id: string; image: string; title?: L; body?: L };
type GalleryItem = { id: string; image: string; caption: L };
type Logo = { id: string; name: string; image: string; href: string };
type ClientProject = { id: string; name: string; image: string };

export type MediaContent = {
  staticHero: { image: string };
  premise: { image: string };
  building: { image: string };
  amenities: { items: Item[] };
  servicesPage: { items: Item[] };
  kbHomes: { gallery: GalleryItem[] };
  clientsPage: { logos: Logo[]; projects: ClientProject[] };
};

const lbl = "font-mono-label text-[color:var(--text-quiet)]";
const field =
  "w-full rounded-lg border border-[color:var(--panel-edge)] bg-[color:var(--canvas)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent)]";
const rid = () => Math.random().toString(36).slice(2, 9);

export default function MediaAdmin({
  media,
  notify,
}: {
  media: MediaContent;
  notify: (s: string) => void;
}) {
  const [pending, start] = useTransition();

  // scalar slots
  const [scalars, setScalars] = useState({
    "staticHero.image": media.staticHero.image,
    "premise.image": media.premise.image,
    "building.image": media.building.image,
  });

  const [amenities, setAmenities] = useState<Item[]>(media.amenities.items);
  const [services, setServices] = useState<Item[]>(media.servicesPage.items);
  const [gallery, setGallery] = useState<GalleryItem[]>(media.kbHomes.gallery);
  const [logos, setLogos] = useState<Logo[]>(media.clientsPage.logos);
  const [clientProjects, setClientProjects] = useState<ClientProject[]>(
    media.clientsPage.projects ?? []
  );

  function save(edits: Array<{ root: string; path: string; value: unknown }>, msg: string) {
    start(async () => {
      const r = await saveContent(edits);
      notify(r.ok ? msg : r.error);
    });
  }

  const SCALARS: Array<{ key: keyof typeof scalars; root: string; label: string; ratio: string }> = [
    { key: "staticHero.image", root: "staticHero", label: "Static hero image (phones & reduced-motion)", ratio: "3 / 4" },
    { key: "premise.image", root: "premise", label: "“The idea” section image", ratio: "4 / 5" },
    { key: "building.image", root: "building", label: "“The building” section image", ratio: "21 / 9" },
  ];

  return (
    <div className="max-w-3xl space-y-12">
      <p className="text-sm leading-relaxed text-[color:var(--text-secondary)]">
        Every image on the public marketing pages. Uploads are compressed in your browser and
        pushed to Cloudinary; only the URL is stored. Text for these sections is on the{" "}
        <b>Text</b> tab.
      </p>

      {/* scalar slots */}
      <section className="space-y-6">
        <h3 className="font-display text-lg">Home page sections</h3>
        {SCALARS.map((s) => (
          <div key={s.key}>
            <ImageUpload
              label={s.label}
              value={scalars[s.key]}
              onChange={(url) => {
                setScalars((v) => ({ ...v, [s.key]: url }));
                save([{ root: s.root, path: "image", value: url }], "Image updated.");
              }}
            />
          </div>
        ))}
      </section>

      {/* amenity images */}
      <ItemGrid
        title="Amenity images"
        items={amenities}
        onChange={setAmenities}
        onSave={(items) => save([{ root: "amenities", path: "items", value: items }], "Amenity images saved.")}
        pending={pending}
      />

      {/* service images */}
      <ItemGrid
        title="Service images"
        items={services}
        onChange={setServices}
        onSave={(items) => save([{ root: "servicesPage", path: "items", value: items }], "Service images saved.")}
        pending={pending}
      />

      {/* KB Homes gallery */}
      <section className="space-y-4">
        <div className="flex items-center">
          <h3 className="font-display text-lg">KB Homes gallery</h3>
          <button
            className="btn btn-ghost ml-auto text-xs"
            onClick={() => setGallery((g) => [...g, { id: rid(), image: "", caption: { en: "", bn: "" } }])}
          >
            Add photo
          </button>
        </div>
        {gallery.map((g, i) => (
          <div key={g.id} className="rounded-xl border border-[color:var(--panel-edge)] p-3">
            <ImageUpload
              label={`Photo ${i + 1}`}
              value={g.image}
              onChange={(url) =>
                setGallery((list) =>
                  url
                    ? list.map((x, j) => (j === i ? { ...x, image: url } : x))
                    : list.filter((_, j) => j !== i)
                )
              }
            />
            <input
              className={`${field} mt-2`}
              placeholder="Caption (optional)"
              value={g.caption.en}
              onChange={(e) =>
                setGallery((list) =>
                  list.map((x, j) => (j === i ? { ...x, caption: { en: e.target.value, bn: e.target.value } } : x))
                )
              }
            />
          </div>
        ))}
        <button
          className="btn btn-primary text-sm"
          disabled={pending}
          onClick={() => save([{ root: "kbHomes", path: "gallery", value: gallery }], "Gallery saved.")}
        >
          Save gallery
        </button>
      </section>

      {/* client logos */}
      <section className="space-y-4">
        <div className="flex items-center">
          <h3 className="font-display text-lg">Client logos</h3>
          <button
            className="btn btn-ghost ml-auto text-xs"
            onClick={() => setLogos((l) => [...l, { id: rid(), name: "", image: "", href: "" }])}
          >
            Add logo
          </button>
        </div>
        {logos.map((logo, i) => (
          <div key={logo.id} className="rounded-xl border border-[color:var(--panel-edge)] p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className={lbl}>Client name</span>
                <input
                  className={`${field} mt-1`}
                  value={logo.name}
                  onChange={(e) =>
                    setLogos((list) => list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                />
              </label>
              <label className="block">
                <span className={lbl}>Link (optional)</span>
                <input
                  className={`${field} mt-1`}
                  value={logo.href}
                  onChange={(e) =>
                    setLogos((list) => list.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))
                  }
                />
              </label>
            </div>
            <div className="mt-2">
              <ImageUpload
                label="Logo"
                value={logo.image}
                onChange={(url) =>
                  setLogos((list) =>
                    url
                      ? list.map((x, j) => (j === i ? { ...x, image: url } : x))
                      : list.filter((_, j) => j !== i)
                  )
                }
              />
            </div>
          </div>
        ))}
        <button
          className="btn btn-primary text-sm"
          disabled={pending}
          onClick={() => save([{ root: "clientsPage", path: "logos", value: logos }], "Logos saved.")}
        >
          Save logos
        </button>
      </section>

      {/* client projects — public autoplay carousel */}
      <section className="space-y-4">
        <div className="flex items-center">
          <h3 className="font-display text-lg">Client projects carousel</h3>
          <button
            className="btn btn-ghost ml-auto text-xs"
            onClick={() => setClientProjects((l) => [...l, { id: rid(), name: "", image: "" }])}
          >
            Add project
          </button>
        </div>
        <p className="text-xs text-[color:var(--text-quiet)]">
          Each project shows on the Clients page as a slide in an auto-playing carousel.
          Upload a wide photo and give it a name.
        </p>
        {clientProjects.map((pr, i) => (
          <div key={pr.id} className="rounded-xl border border-[color:var(--panel-edge)] p-3">
            <label className="block">
              <span className={lbl}>Project name</span>
              <input
                className={`${field} mt-1`}
                value={pr.name}
                onChange={(e) =>
                  setClientProjects((list) =>
                    list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                  )
                }
              />
            </label>
            <div className="mt-2">
              <ImageUpload
                label="Project photo"
                value={pr.image}
                onChange={(url) =>
                  setClientProjects((list) =>
                    url
                      ? list.map((x, j) => (j === i ? { ...x, image: url } : x))
                      : list.filter((_, j) => j !== i)
                  )
                }
              />
            </div>
            <button
              className="mt-2 text-xs text-[color:var(--clay)] hover:underline"
              onClick={() => setClientProjects((list) => list.filter((_, j) => j !== i))}
            >
              Remove project
            </button>
          </div>
        ))}
        <button
          className="btn btn-primary text-sm"
          disabled={pending}
          onClick={() =>
            save(
              [{ root: "clientsPage", path: "projects", value: clientProjects.filter((p) => p.image) }],
              "Client projects saved."
            )
          }
        >
          Save projects
        </button>
      </section>
    </div>
  );
}

function ItemGrid({
  title,
  items,
  onChange,
  onSave,
  pending,
}: {
  title: string;
  items: Item[];
  onChange: (items: Item[]) => void;
  onSave: (items: Item[]) => void;
  pending: boolean;
}) {
  return (
    <section className="space-y-3">
      <h3 className="font-display text-lg">{title}</h3>
      {items.map((it, i) => (
        <div key={it.id} className="rounded-xl border border-[color:var(--panel-edge)] p-3">
          <p className="mb-2 text-sm font-medium">{it.title?.en || it.id}</p>
          <ImageUpload
            label=""
            value={it.image}
            onChange={(url) => onChange(items.map((x, j) => (j === i ? { ...x, image: url } : x)))}
          />
        </div>
      ))}
      <button className="btn btn-primary text-sm" disabled={pending} onClick={() => onSave(items)}>
        Save {title.toLowerCase()}
      </button>
    </section>
  );
}
