"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { ProductImage } from "@/lib/shop";
import MediaSlot from "@/components/MediaSlot";

export default function ProductGallery({
  images,
  alt,
}: {
  images: ProductImage[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <MediaSlot name="" alt={alt} label="Product image" ratio="1 / 1" />;
  }

  return (
    <div>
      <div className="media-slot" style={{ aspectRatio: "1 / 1" }}>
        <img
          src={images[active].url}
          alt={images[active].alt || alt}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              className="media-slot h-16 w-16 shrink-0 overflow-hidden"
              style={{
                aspectRatio: "1 / 1",
                borderColor: i === active ? "var(--accent)" : undefined,
              }}
              aria-label={`Image ${i + 1}`}
              aria-current={i === active}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
