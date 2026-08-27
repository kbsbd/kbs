-- The /properties/ archive filters on status, which WordPress stores as the
-- bti_status taxonomy. (Type already exists on this model as `category`.)
-- Nullable: an unset value simply does not appear in the derived facet list.
alter table public.properties add column if not exists property_status text;
