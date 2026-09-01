-- ===========================================================================
-- 0007_cms_pages.sql
--
-- Phase 3: pages the admin can create from the dashboard.
--
--   * pages          one row per admin-built page, served at /<slug> by the
--                    dynamic route app/[slug]/page.js. `template` picks the
--                    overall look; the content comes from page_sections.
--   * page_sections  the ordered content blocks inside a page.
--   * route_settings search-engine visibility for the pages that are BUILT IN
--                    to the code (/about, /nrb, …). Those pages are files, not
--                    rows, so they can't be deleted from the dashboard — this
--                    is how you take one out of Google without deleting it.
--
-- Safe to re-run: every statement is guarded, seeds only fire into an empty
-- table, and the route_settings seed uses on conflict do nothing.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- pages
--
-- template values (the "style" picked when creating the page):
--   standard — centred light banner, light content sections   (About-like)
--   feature  — tall dark cinematic banner, left-aligned copy  (NRB/Landowner-like)
--   text     — light banner, narrow single reading column     (Legal-like)
--
-- slug is stored WITHOUT a leading slash ('company-profile'), because that is
-- what Next.js hands the dynamic route as a param. Anything that builds a
-- link adds the slash.
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  template text not null default 'standard',

  -- banner
  banner_image_url text,
  banner_subtitle text,

  -- optional lede directly under the banner, before the first section
  intro_heading text,
  intro_body text,

  -- SEO
  meta_title text,
  meta_description text,
  og_image_url text,
  noindex boolean not null default false,

  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pages_slug_idx on public.pages (slug);
create index if not exists pages_published_idx on public.pages (is_published);

-- Reserved slugs: these would be shadowed by a real route in app/, so a page
-- created with one of them would never be reachable. Blocking it at the
-- database level means a typo can't create an invisible page.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pages_slug_not_reserved'
  ) then
    alter table public.pages add constraint pages_slug_not_reserved
      check (slug !~ '^(admin|api|about|contact|nrb|landowner|properties|property|construction-status|legal|_next|sitemap|robots|favicon)$');
  end if;

  -- Lowercase letters, digits and single hyphens only — a slug with a slash
  -- or a space produces a URL that never matches the route.
  if not exists (
    select 1 from pg_constraint where conname = 'pages_slug_format'
  ) then
    alter table public.pages add constraint pages_slug_format
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pages_template_valid'
  ) then
    alter table public.pages add constraint pages_template_valid
      check (template in ('standard', 'feature', 'text'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- page_sections
--
-- kind values:
--   richtext   heading + body paragraphs
--   image_text heading + body + image beside it (image_side picks the side)
--   checklist  heading + ticked list (items: ["line", …])
--   faq        accordion            (items: [{question, answer}, …])
--   cards      heading + card grid  (items: [{title, body}, …])
--   cta        heading + text + one button
--
-- `items` is jsonb because its shape depends on `kind`. The admin types it as
-- lines in a textarea and the server action parses it into this shape, so the
-- dashboard never asks anyone to write JSON.
-- ---------------------------------------------------------------------------
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  kind text not null default 'richtext',

  heading text,
  subheading text,
  body text,

  image_url text,
  image_side text not null default 'right',   -- left | right

  cta_label text,
  cta_href text,

  items jsonb not null default '[]'::jsonb,

  background text not null default 'light',   -- light | dark

  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists page_sections_page_id_idx on public.page_sections (page_id, sort_order);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'page_sections_kind_valid') then
    alter table public.page_sections add constraint page_sections_kind_valid
      check (kind in ('richtext', 'image_text', 'checklist', 'faq', 'cards', 'cta'));
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- route_settings
--
-- One row per built-in route. These pages live in app/ as files, so the
-- dashboard cannot create or delete them — but it can decide whether search
-- engines index them and whether they appear in sitemap.xml. That is what you
-- want after unlinking a page from the menu: the page stays reachable for
-- anyone with the URL, and quietly leaves Google.
-- ---------------------------------------------------------------------------
create table if not exists public.route_settings (
  path text primary key,
  label text not null,
  noindex boolean not null default false,
  in_sitemap boolean not null default true,
  meta_title text,
  meta_description text,
  updated_at timestamptz not null default now()
);

-- The four pages being unlinked from the menu are seeded hidden from search;
-- everything still in the menu stays indexed. All of it is a toggle away in
-- the dashboard under Content → Built-in Pages.
insert into public.route_settings (path, label, noindex, in_sitemap) values
  ('/',                    'Homepage',           false, true),
  ('/properties',          'Properties',         false, true),
  ('/contact',             'Contact',            false, true),
  ('/legal/privacy-policy','Privacy Policy',     false, true),
  ('/about',               'About Us',           true,  false),
  ('/nrb',                 'NRB',                true,  false),
  ('/landowner',           'Landowner',          true,  false),
  ('/construction-status', 'Construction Status',true,  false)
on conflict (path) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- pages/page_sections are public-read like the rest of the content tables.
-- Unpublished pages are filtered in the query, not by policy — the dashboard
-- needs to read them, and it uses the same anon key.
-- ---------------------------------------------------------------------------
alter table public.pages          enable row level security;
alter table public.page_sections  enable row level security;
alter table public.route_settings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'pages' and policyname = 'public read pages') then
    create policy "public read pages" on public.pages for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'pages' and policyname = 'admin write pages') then
    create policy "admin write pages" on public.pages
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'page_sections' and policyname = 'public read page_sections') then
    create policy "public read page_sections" on public.page_sections for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'page_sections' and policyname = 'admin write page_sections') then
    create policy "admin write page_sections" on public.page_sections
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'route_settings' and policyname = 'public read route_settings') then
    create policy "public read route_settings" on public.route_settings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'route_settings' and policyname = 'admin write route_settings') then
    create policy "admin write route_settings" on public.route_settings
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;
