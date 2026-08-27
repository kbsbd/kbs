/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyGallery from "@/components/PropertyGallery";
import FallbackImg from "@/components/FallbackImg";
import FloorPlanSlider from "@/components/FloorPlanSlider";
import ScheduleVisitPopup from "@/components/ScheduleVisitPopup";
import BrochurePopup from "@/components/BrochurePopup";
import PropertyInquiryForm from "./PropertyInquiryForm";
import { getPropertyBySlug, getProperties } from "@/lib/data/properties.server";
import { getFooterLinks, getSocialLinks } from "@/lib/data/footer";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  return {
    title: property.title,
    description:
      property.description ||
      `${property.title} - a KBS residence in ${property.location || "Bangladesh"}.`,
    openGraph: {
      title: property.title,
      description: property.description || undefined,
      images: property.cover_image_url ? [property.cover_image_url] : undefined,
    },
  };
}

/* The nine rows of the original "At a Glance" table, with the same icons */
const SPEC_ROWS = [
  ["address", "Address", "fas fa-map-marker-alt"],
  ["land_area", "Land Area", "fas fa-pencil-ruler"],
  ["num_floors", "No. of Floors", "fas fa-building"],
  ["apartments_per_floor", "Apartment/Floor", "fas fa-th"],
  ["apartment_size", "Apartment Size (sft)", "fas fa-ruler-combined"],
  ["bedrooms", "Bedroom", "fas fa-bed"],
  ["bathrooms", "Bathroom", "fas fa-bath"],
  ["launch_date", "Launch Date", "far fa-calendar-check"],
  ["completion_date", "Expected Completion date", "fas fa-calendar"],
];

/* WordPress serves a -300x300 crop next to every upload; the thumb strip
   and the floor-plan slider use it. Strip any existing -WxH suffix first. */
function sized(url, suffix) {
  if (!url) return url;
  const m = url.match(/^(.*?)(?:-\d+x\d+)?(\.[a-z0-9]+)$/i);
  if (!m) return url;
  return `${m[1]}${suffix}${m[2]}`;
}
function base(url) {
  return sized(url, "");
}

/* Every property runs through this same page. Properties whose content
   hasn't been filled in yet simply render fewer blocks — the same way the
   original template does when a field is empty — rather than an empty
   frame. Nothing is substituted in that the data doesn't already hold. */

export default async function PropertyDetailPage({ params }) {
  const { slug } = await params;
  const [property, footerLinks, socialLinks] = await Promise.all([
    getPropertyBySlug(slug),
    getFooterLinks(),
    getSocialLinks(),
  ]);

  if (!property) notFound();

  const galleryImages =
    property.gallery_urls && property.gallery_urls.length > 0
      ? property.gallery_urls
      : [property.cover_image_url].filter(Boolean);

  const thumbs = galleryImages.map((src) => ({
    src: sized(src, "-300x300"),
    fallback: src,
  }));

  const plans = (property.floor_plan_urls || []).map((src) => ({
    full: base(src),
    thumb: sized(src, "-300x300"),
  }));

  const address = property.address || property.location || "";
  const hasGallery = galleryImages.length > 0;
  const mapSrc =
    property.map_embed_url ||
    `https://www.google.com/maps?q=${encodeURIComponent(
      `${property.title} ${address}`
    )}&output=embed`;

  /* The Address row uses the full address when the property has one and
     falls back to the short location the card already shows — both are
     existing fields, nothing is made up. */
  const specRows = SPEC_ROWS.map(([key, label, icon]) => [
    key,
    label,
    icon,
    key === "address" ? address : property[key],
  ]).filter(([, , , value]) => value);

  const hasSidebarButtons = Boolean(
    property.construction_status_url || property.brochure_url
  );

  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.title,
    description: property.description || undefined,
    image: property.cover_image_url || undefined,
    address: address || undefined,
  };

  return (
    <div className="single-bti_properties bg-theme">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
      />
      <Header />

      <div className="nm-property-single">
        <div className="container">
          {hasGallery && (
            <PropertyGallery images={galleryImages} thumbs={thumbs} alt={property.title} />
          )}

          <div className="nm_schedule_visit my-4 d-block d-sm-none">
            <button
              type="button"
              className="th-btn style6 border w-100 fw-normal nm_schedule_visit_btn"
            >
              Schedule a visit <i className="fa-solid fa-calendar-check" />
            </button>
          </div>

          <div className="row gx-30">
            <div className="col-xxl-7 col-lg-7">
              <div className="property-page-single">
                <div className="page-content">
                  <h1 className="page-title">{property.title}</h1>
                  {property.description && <div>{property.description}</div>}

                  {plans.length > 0 && (
                    <div className="row align-items-center justify-content-between">
                      <div className="col-lg-auto">
                        <h3 className="page-title mt-50 mb-30">Floor plan</h3>
                      </div>
                      <div className="col-lg-12">
                        <FloorPlanSlider plans={plans} alt={property.title} />
                      </div>
                    </div>
                  )}

                  <h3 className="page-title mt-45 mb-30">Location</h3>
                  <div className="location-map">
                    <div className="contact-map">
                      <iframe
                        src={mapSrc}
                        width="600"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${property.title} location`}
                      />
                    </div>
                    {address && (
                      <div className="location-map-address">
                        {hasGallery && (
                          <div className="thumb">
                            <FallbackImg
                              width="300"
                              height="300"
                              src={sized(galleryImages[0], "-300x300")}
                              fallback={galleryImages[0]}
                              alt="img"
                            />
                          </div>
                        )}
                        <div className="media-body">
                          <h4 className="title">Address:</h4>
                          <p className="text">{address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xxl-5 col-lg-5">
              <aside className="sidebar-area">
                <div className="nm_schedule_visit my-4 d-none d-sm-block">
                  <button
                    type="button"
                    className="th-btn style6 border w-100 fw-normal nm_schedule_visit_btn"
                  >
                    Schedule a visit <i className="fa-solid fa-calendar-check" />
                  </button>
                </div>

                {(specRows.length > 0 || hasSidebarButtons) && (
                  <div className="widget">
                    <h3 className="widget_title">At a Glance</h3>
                    {specRows.length > 0 && (
                      <table className="specification-inner-box">
                        <tbody>
                          {specRows.map(([key, label, icon, value]) => (
                            <tr className="specification-list" key={key}>
                              <td className="specification-list-item-label">
                                <i className={icon} /> {label}
                              </td>
                              <td className="specification-list-item-value">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {hasSidebarButtons && (
                      <div className="header-button d-flex nm-sidebar-widget-button">
                        {property.construction_status_url && (
                          <a href={property.construction_status_url} className="th-btn style5">
                            Construction Status{" "}
                            <i className="fa-solid fa-arrow-up-right-from-square" />
                          </a>
                        )}
                        {property.brochure_url && (
                          <button
                            type="button"
                            className="th-btn style5 nm-brouchure-download-btn"
                            data-broucher={property.brochure_url}
                          >
                            <i className="fa-solid fa-download" />
                            Brochure
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="widget widget-property-contact">
                  <p className="widget_title">I am interested in this property</p>
                  <PropertyInquiryForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                  />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <Footer footerLinks={footerLinks} socialLinks={socialLinks} />

      <ScheduleVisitPopup propertyId={property.id} propertyTitle={property.title} />
      <BrochurePopup propertyId={property.id} propertyTitle={property.title} />
    </div>
  );
}

export async function generateStaticParams() {
  const properties = await getProperties();
  return properties.map((p) => ({ slug: p.slug }));
}
