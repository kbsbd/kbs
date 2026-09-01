/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard2 from "@/components/PropertyCard2";
import PropertyFilterToggle from "@/components/PropertyFilterToggle";
import PropertyArchiveFilterPanel from "@/components/PropertyArchiveFilterPanel";
import { getProperties } from "@/lib/data/properties.server";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";
import { getSiteSettings } from "@/lib/data/site";
import {
  filterProperties,
  archiveFacets,
  PER_PAGE,
} from "@/lib/data/property-filters";
import "./properties.css";
import { buildRouteMetadata } from "@/lib/data/routes";

/*
 * /properties/ — the bti_properties archive, ported 1:1 from WordPress.
 *
 *   .breadcumb-wrapper.properties-breadcumb-wrapper   data-bg-src hero
 *     .container.properties-search-container
 *       .row.justify-content-center > .col-auto.hero-13 > form.nm-project-search
 *         three .form-group.nm-group selects (Type / Status / Location)
 *         + the search button
 *     .container.nm-property-breadcrumb-footer.d-none  (static count)
 *     button.nm-property-filter-toggle.d-none
 *   .pt-60.bg-white > .container > .row.gy-40
 *     #nm-property-archive-filter-panel (hidden)
 *     one .col-md-6.col-xl-4 per property
 *   .text-center.pt-40.pb-10 > .th-pagination.nm-properties-pagination
 *
 * Faithful details that look odd:
 *  - the count block and the filter toggle are BOTH `d-none`, i.e. rendered
 *    but never visible. Kept because the markup has them.
 *  - the advanced filter panel ships `hidden`; only the (invisible) toggle
 *    opens it.
 *  - the Type select carries `nm-search-type-hidden`, and the voice-search
 *    link is `style="display:none"` — both present, both invisible.
 *  - `data-bg-src` is rewritten by main.min.js into an inline background-image
 *    plus the `background-image` class; the clone renders that end state.
 *  - the section background is WHITE (`bg-white`), not the site's dark theme.
 *
 * Filtering is server-side off the query string, exactly as the original's
 * GET forms work — no client-side state.
 */

const THEME = "/wp-content/themes/bti-new-properties-special/assets/img";
/* Fallback only — the banner photo is admin-managed via
   site_settings.properties_hero_url (migration 0008). */
const HERO = `${THEME}/demo/properties-hero.webp`;

/* Search visibility for this route is admin-controlled: the noindex
   flag and any title/description override come from route_settings.
   With no row, buildRouteMetadata returns this base unchanged. */
export async function generateMetadata() {
  return buildRouteMetadata("/properties", {
    title: "Properties",
    description:
      "Browse every KBS property across Dhaka and Chattogram.",
  });
}

function Select({ id, name, placeholder, options, value }) {
  return (
    <div className={`form-group nm-group${id === "nmTypeVal" ? " nm-search-type-hidden" : ""}`}>
      <div className="nm-select-wrapper">
        <select className="nm-menu" id={id} name={name} defaultValue={value || ""}>
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <i className="fa-solid fa-chevron-down nm-fa-caret" />
      </div>
    </div>
  );
}

function Pagination({ page, pages }) {
  if (pages < 2) return null;
  const href = (n) => (n === 1 ? "/properties" : `/properties/page/${n}`);
  return (
    <div className="text-center pt-40 pb-10">
      {/* The original writes each item on its own line, and these items are
          inline-level — so every newline is a real ~4.45px space. Four gaps
          across five items is ~17.8px of width, which shifts the centred row
          by ~8.9px if the spaces are dropped. */}
      <div className="th-pagination nm-properties-pagination">
        {Array.from({ length: pages }, (_, i) => i + 1).map((n, idx) => (
          <Fragment key={n}>
            {idx > 0 ? " " : null}
            {n === page ? (
              <span aria-current="page" className="page-numbers current">{n}</span>
            ) : (
              <Link className="page-numbers" href={href(n)}>{n}</Link>
            )}
          </Fragment>
        ))}
        {page < pages && (
          <>
            {" "}
            <Link className="next page-numbers" href={href(page + 1)}>
              Next <i className="fa-solid fa-arrow-right-long ms-2" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default async function PropertiesPage({ searchParams }) {
  const sp = await searchParams;
  const [all, footerLinks, socialLinks, settings] = await Promise.all([
    getProperties(),
    getFooterLinks(),
    getSocialLinks(),
    getSiteSettings(),
  ]);

  const facets = archiveFacets(all);
  const matched = filterProperties(all, sp);
  const page = Math.max(1, Number(sp?.page) || 1);
  const pages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const shown = matched.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <Header />

      <div
        className="breadcumb-wrapper properties-breadcumb-wrapper background-image"
        style={{ backgroundImage: `url(${settings.properties_hero_url || HERO})` }}
      >
        <div className="container properties-search-container">
          <div className="row justify-content-center">
            <div className="col-auto hero-13">
              <form className="nm-project-search" role="search" method="get" action="/properties">
                <input type="hidden" name="post_type" value="bti_properties" />
                <input type="hidden" name="s" value="" />
                <div className="d-flex justify-content-center align-items-baseline gap-4 flex-wrap">
                  <Select
                    id="nmTypeVal"
                    name="bti_type"
                    placeholder="Type"
                    options={facets.types}
                    value={sp?.bti_type}
                  />
                  <Select
                    id="nmStatusVal"
                    name="bti_status"
                    placeholder="Status"
                    options={facets.statuses}
                    value={sp?.bti_status}
                  />
                  <Select
                    id="nmLocationVal"
                    name="bti_location"
                    placeholder="Location"
                    options={facets.locations}
                    value={sp?.bti_location}
                  />
                  <div className="form-group">
                    <a
                      href="#"
                      className="nm-voice-search-hidden"
                      aria-label="Voice search"
                      style={{ display: "none" }}
                    >
                      <i className="fas fa-microphone" />
                    </a>
                    <button className="th-btn ml-3 nm-search-form-sbt-btn" type="submit">
                      <i className="fas fa-search" /> Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="container nm-property-breadcrumb-footer d-none">
          <p className="nm-property-archive-static-count">
            <strong>{matched.length}</strong> {settings.properties_count_label || "ongoing properties"}
          </p>
        </div>

        <PropertyFilterToggle />
      </div>

      <div className="pt-60 bg-white">
        <div className="container">
          <div className="row gy-40">
            <PropertyArchiveFilterPanel
              sizes={facets.sizes}
              bedrooms={facets.bedrooms}
              blocks={facets.blocks}
              initial={sp || {}}
            />
            {shown.map((property) => (
              <PropertyCard2 key={property.slug} property={property} />
            ))}
          </div>
        </div>
        {/* the pagination is a sibling of .container, not inside it */}
        <Pagination page={page} pages={pages} />
      </div>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />
    </>
  );
}
