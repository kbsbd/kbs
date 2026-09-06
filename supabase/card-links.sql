-- Clickable project cards.
--
-- Amenity cards store their destination inside site_content, so they need no
-- migration. Project cards are rows in a real table, so they need this column.
-- Safe to run twice. The app also degrades gracefully without it: the public
-- read and the admin save both retry without `link`.

alter table public.projects
  add column if not exists link text not null default '';
