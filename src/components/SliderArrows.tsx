"use client";

/** The pill prev / next buttons shared by every carousel, in the testimonial
 *  slider's style: a bordered circle that inverts on hover. */
export default function SliderArrows({
  onPrev,
  onNext,
  label = "carousel",
  className = "",
  tone = "ink",
}: {
  onPrev: () => void;
  onNext: () => void;
  label?: string;
  className?: string;
  /** "ink" on a light section, "light" over a dark image */
  tone?: "ink" | "light";
}) {
  const base =
    "grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300 sm:h-[52px] sm:w-[52px]";
  const skin =
    tone === "light"
      ? "border-white/60 text-white hover:bg-white hover:text-[color:var(--canvas-deep)]"
      : "border-[color:var(--text-primary)] text-[color:var(--text-primary)] hover:bg-[color:var(--text-primary)] hover:text-[color:var(--canvas)]";

  return (
    <div className={`flex shrink-0 gap-2 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        aria-label={`Previous ${label}`}
        className={`${base} ${skin}`}
      >
        <Chevron dir="prev" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label={`Next ${label}`}
        className={`${base} ${skin}`}
      >
        <Chevron dir="next" />
      </button>
    </div>
  );
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        d={dir === "prev" ? "M15 4l-8 8 8 8" : "M9 4l8 8-8 8"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
