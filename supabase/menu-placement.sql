-- ============================================================
-- KBS — menu item placement
--
-- A cms_menu_items row can now sit in the header nav OR the footer. Footer
-- items are grouped into columns by `footer_group` (blank = a default
-- "Links" column). `page_slug` records which published page a link points at,
-- so the admin picks a page from a dropdown instead of typing a URL.
-- Idempotent.
-- ============================================================

alter table public.cms_menu_items add column if not exists placement text not null default 'header';
alter table public.cms_menu_items drop constraint if exists cms_menu_items_placement_check;
alter table public.cms_menu_items add constraint cms_menu_items_placement_check
  check (placement in ('header', 'footer'));

alter table public.cms_menu_items add column if not exists footer_group text not null default '';
alter table public.cms_menu_items add column if not exists page_slug text not null default '';
