"use client";

import { useActionState } from "react";
import styles from "../../admin.module.css";

const initialState = { ok: false, message: "" };

export default function PropertyForm({ property, action }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const p = property || {};

  return (
    <form action={formAction} className={styles.form}>
      {p.id && <input type="hidden" name="id" value={p.id} />}

      <div className={styles.grid2}>
        <label>
          Title
          <input type="text" name="title" defaultValue={p.title || ""} required />
        </label>
        <label>
          Slug (blank = auto from title)
          <input type="text" name="slug" defaultValue={p.slug || ""} />
        </label>
      </div>

      <div className={styles.grid2}>
        <label>
          Location (short, e.g. &quot;Gulshan, Dhaka&quot;)
          <input type="text" name="location" defaultValue={p.location || ""} />
        </label>
        <label>
          Full address
          <input type="text" name="address" defaultValue={p.address || ""} />
        </label>
      </div>

      <label>
        Description
        <textarea name="description" defaultValue={p.description || ""} rows={4} />
      </label>

      <div className={styles.grid2}>
        <label>
          Cover image URL
          <input type="url" name="cover_image_url" defaultValue={p.cover_image_url || ""} />
        </label>
        <label>
          Badge (e.g. &quot;Special Offer&quot;)
          <input type="text" name="badge" defaultValue={p.badge || ""} />
        </label>
      </div>

      <div className={styles.grid2}>
        <label>
          Logo image URL (shown on the property card hover panel)
          <input type="url" name="logo_image_url" defaultValue={p.logo_image_url || ""} />
        </label>
        <label>
          Google Maps embed URL (blank = looked up from the address)
          <input type="url" name="map_embed_url" defaultValue={p.map_embed_url || ""} />
        </label>
      </div>

      <div className={styles.grid2}>
        <label>
          Type (search filter category)
          <select name="category" defaultValue={p.category || ""}>
            <option value="">— Unassigned —</option>
            <option value="classic">Classic</option>
            <option value="critical">Critical</option>
            <option value="featured">Featured</option>
            <option value="luxury">Luxury</option>
            <option value="offer-interior">Offer Interior</option>
            <option value="special">Special</option>
            <option value="wellness-communities">Wellness Communities</option>
          </select>
        </label>
        <label>
          Status (search filter)
          <select name="property_status" defaultValue={p.property_status || ""}>
            <option value="">— Unassigned —</option>
            <option value="Coming Soon">Coming Soon</option>
            <option value="Ongoing">Ongoing</option>
          </select>
        </label>
      </div>

      <label>
        Gallery image URLs (one per line)
        <textarea
          name="gallery_urls"
          defaultValue={(p.gallery_urls || []).join("\n")}
          rows={4}
        />
      </label>

      <label>
        Floor plan image URLs (one per line)
        <textarea
          name="floor_plan_urls"
          defaultValue={(p.floor_plan_urls || []).join("\n")}
          rows={3}
        />
      </label>

      <label>
        Property video (YouTube URL or ID, optional)
        <input type="text" name="youtube_video_id" defaultValue={p.youtube_video_id || ""} />
      </label>

      <div className={styles.grid2}>
        <label>
          Land area
          <input type="text" name="land_area" defaultValue={p.land_area || ""} />
        </label>
        <label>
          Number of floors
          <input type="text" name="num_floors" defaultValue={p.num_floors || ""} />
        </label>
        <label>
          Apartments per floor
          <input
            type="text"
            name="apartments_per_floor"
            defaultValue={p.apartments_per_floor || ""}
          />
        </label>
        <label>
          Apartment size
          <input type="text" name="apartment_size" defaultValue={p.apartment_size || ""} />
        </label>
        <label>
          Bedrooms
          <input type="text" name="bedrooms" defaultValue={p.bedrooms || ""} />
        </label>
        <label>
          Bathrooms
          <input type="text" name="bathrooms" defaultValue={p.bathrooms || ""} />
        </label>
        <label>
          Launch date
          <input type="text" name="launch_date" defaultValue={p.launch_date || ""} />
        </label>
        <label>
          Expected completion date
          <input type="text" name="completion_date" defaultValue={p.completion_date || ""} />
        </label>
      </div>

      <div className={styles.grid2}>
        <label>
          Construction status link
          <input
            type="url"
            name="construction_status_url"
            defaultValue={p.construction_status_url || ""}
          />
        </label>
        <label>
          Brochure URL
          <input type="url" name="brochure_url" defaultValue={p.brochure_url || ""} />
        </label>
      </div>

      <div className={styles.grid2}>
        <label>
          Construction: location (falls back to Location above)
          <input
            type="text"
            name="construction_location"
            defaultValue={p.construction_location || ""}
          />
        </label>
        <label>
          Construction: expected completion date
          <input
            type="text"
            name="construction_completion_date"
            defaultValue={p.construction_completion_date || ""}
          />
        </label>
        <label>
          Construction: status last updated
          <input
            type="text"
            name="construction_status_updated"
            defaultValue={p.construction_status_updated || ""}
          />
        </label>
      </div>
      <label>
        Construction progress details (shown at /construction-status/[slug])
        <textarea
          name="construction_progress"
          defaultValue={p.construction_progress || ""}
          rows={6}
        />
      </label>

      <label style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
        <input type="checkbox" name="is_featured" defaultChecked={p.is_featured} />
        Show in Featured properties
      </label>
      <label style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
        <input type="checkbox" name="is_special_offer" defaultChecked={p.is_special_offer} />
        Show in Special offer
      </label>

      <label>
        Sort order
        <input type="number" name="sort_order" defaultValue={p.sort_order ?? 0} />
      </label>

      <label>
        Featured order (position in the &quot;Featured properties&quot; grid; blank = use sort order)
        <input type="number" name="featured_order" defaultValue={p.featured_order ?? ""} />
      </label>

      {state.message && (
        <p className={state.ok ? styles.success : styles.error}>{state.message}</p>
      )}

      <button type="submit" className={styles.primaryButton} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
