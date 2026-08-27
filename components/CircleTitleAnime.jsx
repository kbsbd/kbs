/*
 * .circle-title-anime — the ring of letters inside `.about-experience-tag`.
 *
 * The theme runs jQuery Lettering on it:
 *
 *   $(".circle-title-anime").lettering();
 *
 * which replaces the text with one `<span class="charN">` per character
 * (1-based), keeping spaces as their own char span. The stylesheet then
 * rotates each span individually — there are explicit
 * `.about-experience-tag span.char2 … span.char35` rules — so the split is
 * load-bearing, not decorative.
 *
 * Rendered on the server here (it is pure markup), so there is no flash of
 * unsplit text the way the jQuery version has.
 */
export default function CircleTitleAnime({ text, className = "" }) {
  const cls = `circle-title-anime${className ? ` ${className}` : ""}`;
  return (
    <span className={cls}>
      {Array.from(text).map((ch, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`char${i + 1}`}>
          {ch}
        </span>
      ))}
    </span>
  );
}
