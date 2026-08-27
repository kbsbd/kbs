-- The original site orders the "Featured properties" grid independently of
-- the global sort_order (dew-drops is first in Special offer but fifth in
-- Featured), so a property needs its own position for that grid. Null falls
-- back to sort_order.

alter table public.properties
  add column if not exists featured_order integer;
