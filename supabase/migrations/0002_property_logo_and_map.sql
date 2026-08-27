-- The property detail page can show a property-specific Google Maps embed
-- (the original site pastes one per property), and the property cards use a
-- logo image in the hover panel. Neither column existed in 0001_init.sql,
-- so editing a property in /admin used to drop the logo and there was no way
-- to set the exact map.

alter table public.properties
  add column if not exists logo_image_url text;

alter table public.properties
  add column if not exists map_embed_url text;
