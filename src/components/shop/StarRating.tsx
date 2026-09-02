/** Five stars, `value` of them filled (rounded to the nearest half is not shown —
 *  we round to whole for a calmer look). Server-safe. */
export default function StarRating({
  value,
  size = 15,
}: {
  value: number;
  size?: number;
}) {
  const filled = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <path
            d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 2.5z"
            fill={n <= filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            opacity={n <= filled ? 1 : 0.4}
          />
        </svg>
      ))}
    </span>
  );
}
