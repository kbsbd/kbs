-- ===========================================================================
-- 0005_admin_cms_foundation.sql
--
-- Phase 1 of making the whole site editable from /admin.
--
--   * site_settings  gains branding (favicon, logo, site name), SEO defaults
--                    and contact details that were previously hardcoded in
--                    app/layout.js, components/Footer.jsx and app/contact.
--   * media_assets   a library row per file uploaded through the dashboard
--                    (Cloudinary holds the file; this table holds the link,
--                    so the admin can browse, reuse and delete).
--   * nav_links      header + mobile menu links (was lib/nav.js, code-only).
--   * cta_buttons    the floating Call / WhatsApp / Reach-us buttons (was a
--                    const array in components/FixedActions.jsx).
--
-- Safe to re-run: every statement is guarded.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- site_settings: branding, SEO, contact
-- ---------------------------------------------------------------------------
alter table public.site_settings add column if not exists site_name text;
alter table public.site_settings add column if not exists site_tagline text;
alter table public.site_settings add column if not exists logo_url text;
alter table public.site_settings add column if not exists logo_alt text;
alter table public.site_settings add column if not exists favicon_url text;
alter table public.site_settings add column if not exists apple_icon_url text;
alter table public.site_settings add column if not exists og_image_url text;
alter table public.site_settings add column if not exists meta_title text;
alter table public.site_settings add column if not exists meta_description text;

alter table public.site_settings add column if not exists contact_phone text;
alter table public.site_settings add column if not exists contact_phone_alt text;
alter table public.site_settings add column if not exists contact_whatsapp text;
alter table public.site_settings add column if not exists contact_email text;
alter table public.site_settings add column if not exists contact_address text;
alter table public.site_settings add column if not exists map_query text;

alter table public.site_settings add column if not exists footer_address text;
alter table public.site_settings add column if not exists footer_copyright text;
alter table public.site_settings add column if not exists newsletter_heading text;

-- Seed the singleton with the values that were previously hardcoded, but only
-- where the admin has not already set something.
update public.site_settings
set
  site_name          = coalesce(site_name, 'KBS'),
  site_tagline       = coalesce(site_tagline, 'A Leading Real Estate Developer in Bangladesh'),
  meta_description   = coalesce(
                         meta_description,
                         'KBS is a leading real estate developer building functional, design-forward homes in Dhaka and Chattogram.'
                       ),
  favicon_url        = coalesce(favicon_url, '/wp-content/uploads/2021/05/cropped-site-icon-788309-102463-32x32.png'),
  apple_icon_url     = coalesce(apple_icon_url, '/wp-content/uploads/2021/05/cropped-site-icon-788309-102463-180x180.png'),
  contact_phone      = coalesce(contact_phone, '16604'),
  contact_phone_alt  = coalesce(contact_phone_alt, '+8809613191919'),
  contact_whatsapp   = coalesce(contact_whatsapp, '+8801313401405'),
  contact_email      = coalesce(contact_email, 'info@kbs.com'),
  contact_address    = coalesce(contact_address, 'KBS Celebration Point, Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212'),
  map_query          = coalesce(map_query, 'KBS Celebration Point, Gulshan-2, Dhaka-1212'),
  footer_address     = coalesce(footer_address, 'KBS Celebration Point, Plot: 3 & 5, Road: 113/A, Gulshan-2, Dhaka-1212'),
  newsletter_heading = coalesce(newsletter_heading, 'Never miss an update')
where id = 1;

-- ---------------------------------------------------------------------------
-- media_assets: the dashboard's media library
--
-- Files live in Cloudinary. public_id is what lets us delete them there, so
-- it is required for anything uploaded through the dashboard.
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  public_id text not null,
  secure_url text not null,
  resource_type text not null default 'image',  -- image | video | raw
  format text,
  width int,
  height int,
  bytes bigint,
  original_filename text,
  alt_text text,
  folder text not null default 'kbs',
  created_at timestamptz not null default now()
);

create unique index if not exists media_assets_public_id_idx
  on public.media_assets (public_id);
create index if not exists media_assets_created_at_idx
  on public.media_assets (created_at desc);

-- ---------------------------------------------------------------------------
-- nav_links: header + mobile menu
-- ---------------------------------------------------------------------------
create table if not exists public.nav_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  external boolean not null default false,
  -- 'primary' shows in the always-visible desktop strip, 'drawer' only in the
  -- slide-out / mobile menu, 'both' in both.
  placement text not null default 'both',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists nav_links_sort_order_idx on public.nav_links (sort_order);

-- Seed from the old lib/nav.js so the menu is not empty on first load.
insert into public.nav_links (label, href, external, placement, sort_order)
select * from (values
  ('Home',               '/',                                                   false, 'drawer',  10),
  ('About Us',           '/about',                                              false, 'drawer',  20),
  ('Properties',         '/properties',                                         false, 'both',    30),
  ('Landowner',          '/landowner',                                          false, 'drawer',  40),
  ('Construction status','/construction-status',                                false, 'drawer',  50),
  ('Referral program',   'https://campaign.btibd.com/bti-referral-program/',    true,  'drawer',  60),
  ('NRB',                '/nrb',                                                false, 'drawer',  70),
  ('Contact us',         '/contact',                                            false, 'drawer',  80),
  ('Arshi Haider',       'https://arshihaider.com/',                            true,  'drawer',  90)
) as seed(label, href, external, placement, sort_order)
where not exists (select 1 from public.nav_links);

-- ---------------------------------------------------------------------------
-- cta_buttons: the floating action stack (Call / WhatsApp / Reach us)
--
-- icon is a key into the icon map in components/CtaIcon.jsx, so an admin
-- picks from a dropdown rather than pasting SVG.
-- ---------------------------------------------------------------------------
create table if not exists public.cta_buttons (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  icon text not null default 'phone',        -- phone | whatsapp | chat | mail | map | calendar
  external boolean not null default false,
  accent_color text,                          -- optional hover colour, e.g. #25D366
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists cta_buttons_sort_order_idx on public.cta_buttons (sort_order);

insert into public.cta_buttons (label, href, icon, external, accent_color, sort_order)
select * from (values
  ('Call',     'tel:16604',                    'phone',    false, null,        10),
  ('WhatsApp', 'https://wa.me/+8801313401405', 'whatsapp', true,  '#25D366',   20),
  ('Reach Us', '/contact',                     'chat',     false, null,        30)
) as seed(label, href, icon, external, accent_color, sort_order)
where not exists (select 1 from public.cta_buttons);

-- ---------------------------------------------------------------------------
-- footer_links / social_links: editing needs a stable order + labels
-- ---------------------------------------------------------------------------
alter table public.footer_links add column if not exists is_active boolean not null default true;
alter table public.social_links add column if not exists is_active boolean not null default true;
alter table public.social_links add column if not exists label text;

-- ---------------------------------------------------------------------------
-- Row Level Security — same shape as 0001: world-readable content, writes
-- restricted to an authenticated (admin) session.
-- ---------------------------------------------------------------------------
alter table public.media_assets enable row level security;
alter table public.nav_links    enable row level security;
alter table public.cta_buttons  enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'media_assets' and policyname = 'admin read media_assets') then
    create policy "admin read media_assets" on public.media_assets
      for select using (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'media_assets' and policyname = 'admin write media_assets') then
    create policy "admin write media_assets" on public.media_assets
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'nav_links' and policyname = 'public read nav_links') then
    create policy "public read nav_links" on public.nav_links for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'nav_links' and policyname = 'admin write nav_links') then
    create policy "admin write nav_links" on public.nav_links
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'cta_buttons' and policyname = 'public read cta_buttons') then
    create policy "public read cta_buttons" on public.cta_buttons for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'cta_buttons' and policyname = 'admin write cta_buttons') then
    create policy "admin write cta_buttons" on public.cta_buttons
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;
