/* eslint-disable @next/next/no-img-element */
import { img } from "@/lib/media";

/**
 * An image with a room kept for it.
 *
 * `name` is a bare media stem (Cloudinary or /public/media). While it is blank
 * — which is how every new page ships — the slot renders a labelled placeholder
 * at the right shape, so the layout is already correct when the admin attaches
 * the real image later. No layout shift, nothing missing, just a marked gap.
 */
export default function MediaSlot({
  name,
  width = 1400,
  alt = "",
  label = "Image",
  ratio = "4 / 3",
  className = "",
  priority = false,
}: {
  name: string;
  width?: number;
  alt?: string;
  label?: string;
  ratio?: string;
  className?: string;
  priority?: boolean;
}) {
  const src = img(name, width);

  return (
    <div className={`media-slot ${className}`} style={{ aspectRatio: ratio }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
      ) : (
        <span className="media-slot-label font-mono-label" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  );
}
