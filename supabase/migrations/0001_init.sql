-- btibd-nextjs initial schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- site_settings: singleton row (id = 1) holding global editable config
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  id int primary key default 1,
  hero_video_url text,
  hero_poster_url text,
  hero_headline text,
  hero_subheadline text,
  arrival_heading text default 'A Statement of Arrival',
  arrival_youtube_id text,
  meta_pixel_id text,
  ga_measurement_id text,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,                 -- Featured / Special / Luxury / etc.
  badge text,                    -- e.g. "Special Offer" (listing card ribbon)
  location text,                 -- short "Area, City" shown on cards
  address text,                  -- full postal address (detail page + map)
  description text,
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  floor_plan_urls text[] not null default '{}',
  land_area text,                -- "5 Katha"
  num_floors text,                -- "G+8"
  apartments_per_floor text,      -- "1"
  apartment_size text,            -- "1900+ sft"
  bedrooms text,
  bathrooms text,
  launch_date text,               -- free text, e.g. "February 2025"
  completion_date text,           -- "November 2027"
  construction_status_url text,
  brochure_url text,
  youtube_video_id text,
  construction_location text,
  construction_completion_date text,
  construction_status_updated text,
  construction_progress text,
  is_featured boolean not null default false,
  is_special_offer boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_sort_order_idx on properties (sort_order);

-- ---------------------------------------------------------------------------
-- legal_pages
-- ---------------------------------------------------------------------------
create table if not exists legal_pages (
  slug text primary key,          -- 'privacy-policy'
  title text not null,
  content text not null default '',
  updated_at timestamptz not null default now()
);

insert into legal_pages (slug, title, content) values
  ('privacy-policy', 'Privacy Policy', '')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- footer_links / social_links
-- ---------------------------------------------------------------------------
create table if not exists footer_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  sort_order int not null default 0,
  open_new_tab boolean not null default false
);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,         -- facebook / linkedin / instagram / youtube
  url text not null,
  sort_order int not null default 0
);

-- ---------------------------------------------------------------------------
-- leads (property interest / schedule-a-visit forms) + newsletter
-- ---------------------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties (id) on delete set null,
  property_title text,
  source text not null default 'interest_form', -- interest_form | schedule_visit
  name text,
  email text,
  phone text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security: public read on content tables, public insert on the
-- lead-capture tables, everything else restricted to authenticated (admin).
-- ---------------------------------------------------------------------------
alter table site_settings enable row level security;
alter table properties enable row level security;
alter table legal_pages enable row level security;
alter table footer_links enable row level security;
alter table social_links enable row level security;
alter table leads enable row level security;
alter table newsletter_subscribers enable row level security;

create policy "public read site_settings" on site_settings for select using (true);
create policy "admin write site_settings" on site_settings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read properties" on properties for select using (true);
create policy "admin write properties" on properties for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read legal_pages" on legal_pages for select using (true);
create policy "admin write legal_pages" on legal_pages for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read footer_links" on footer_links for select using (true);
create policy "admin write footer_links" on footer_links for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read social_links" on social_links for select using (true);
create policy "admin write social_links" on social_links for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Leads/newsletter: anyone can submit (insert), only admin can read/manage.
create policy "public insert leads" on leads for insert with check (true);
create policy "admin read leads" on leads for select using (auth.role() = 'authenticated');
create policy "admin manage leads" on leads for update using (auth.role() = 'authenticated');
create policy "admin delete leads" on leads for delete using (auth.role() = 'authenticated');

create policy "public insert newsletter" on newsletter_subscribers for insert with check (true);
create policy "admin read newsletter" on newsletter_subscribers for select using (auth.role() = 'authenticated');
create policy "admin delete newsletter" on newsletter_subscribers for delete using (auth.role() = 'authenticated');
