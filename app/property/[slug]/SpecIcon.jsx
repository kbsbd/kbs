const PATHS = {
  address: "M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z",
  land_area: "M3 21 21 3M3 3h6M3 3v6M21 21h-6M21 21v-6",
  num_floors: "M4 21V9l8-5 8 5v12M4 21h16M9 21v-6h6v6",
  apartments_per_floor: "M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z",
  apartment_size: "M3 21 3 15M3 21h6M21 3v6M21 3h-6M3 3v6M3 3h6M21 21h-6M21 21v-6",
  bedrooms: "M2 19v-6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6M2 19v2M22 19v2M6 10V7a2 2 0 0 1 2-2h2M2 15h20",
  bathrooms: "M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Zm2-2V6a2 2 0 0 1 3.46-1.37M2 12h1",
  launch_date: "M3 5h18v16H3V5Zm0 5h18M8 3v4M16 3v4M8.5 15l2 2 3.5-4",
  completion_date: "M3 5h18v16H3V5Zm0 5h18M8 3v4M16 3v4M8 14h3M8 17h6",
};

export default function SpecIcon({ name }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
