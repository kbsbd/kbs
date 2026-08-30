-- ===========================================================================
-- 0006_homepage_content.sql
--
-- Phase 2: the homepage and the contact page.
--
--   * site_settings   gains the copy for every homepage band (Special offer,
--                     Featured properties, Testimonials, SBU) plus the two
--                     images that were baked into components, and the contact
--                     page's background art.
--   * testimonials    the customer-review images that were an 8-entry const
--                     array inside components/Testimonials.jsx.
--   * sbu_units       the six business units that were in lib/data/sbu.js.
--
-- Safe to re-run: every statement is guarded, and the seeds only fire into an
-- empty table so a second run never duplicates rows.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- site_settings: homepage section copy
-- ---------------------------------------------------------------------------
alter table public.site_settings add column if not exists special_offer_heading text;
alter table public.site_settings add column if not exists special_offer_text text;
alter table public.site_settings add column if not exists special_offer_cta_label text;
alter table public.site_settings add column if not exists special_offer_cta_href text;

alter table public.site_settings add column if not exists featured_heading text;
alter table public.site_settings add column if not exists featured_text text;
alter table public.site_settings add column if not exists featured_cta_label text;
alter table public.site_settings add column if not exists featured_cta_href text;

alter table public.site_settings add column if not exists testimonials_heading text;

-- The "Statement of Arrival" band's poster frame. The YouTube id and heading
-- already existed; the thumbnail was hardcoded.
alter table public.site_settings add column if not exists arrival_thumb_url text;

alter table public.site_settings add column if not exists sbu_heading text;
alter table public.site_settings add column if not exists sbu_subheading text;
alter table public.site_settings add column if not exists sbu_bg_url text;

-- Contact page art
alter table public.site_settings add column if not exists contact_heading text;
alter table public.site_settings add column if not exists contact_form_bg_url text;
alter table public.site_settings add column if not exists contact_map_logo_url text;

-- Seed with exactly what the components used to hardcode, without clobbering
-- anything an admin has already set.
update public.site_settings
set
  special_offer_heading   = coalesce(special_offer_heading, 'Special offer'),
  special_offer_text      = coalesce(special_offer_text, 'Explore our ongoing projects across Dhaka and Chattogram.'),
  special_offer_cta_label = coalesce(special_offer_cta_label, 'View all properties'),
  special_offer_cta_href  = coalesce(special_offer_cta_href, '/properties?category=special'),

  featured_heading        = coalesce(featured_heading, 'Featured properties'),
  featured_cta_label      = coalesce(featured_cta_label, 'View all properties'),
  featured_cta_href       = coalesce(featured_cta_href, '/properties?category=featured'),

  testimonials_heading    = coalesce(testimonials_heading, 'What do our customers say?'),

  arrival_thumb_url       = coalesce(
                              arrival_thumb_url,
                              '/wp-content/themes/bti-new-properties-special/assets/img/demo/home-video-thumb.webp'
                            ),

  sbu_heading             = coalesce(sbu_heading, 'SBU'),
  sbu_subheading          = coalesce(sbu_subheading, 'Other Initiatives'),
  sbu_bg_url              = coalesce(
                              sbu_bg_url,
                              '/wp-content/themes/bti-new-properties-special/assets/img/demo/business-logo-bg.webp'
                            ),

  contact_heading         = coalesce(contact_heading, 'Get in touch'),
  contact_form_bg_url     = coalesce(
                              contact_form_bg_url,
                              '/wp-content/themes/bti-new-properties-special/assets/img/demo/contact-us-form-bg.webp'
                            ),
  contact_map_logo_url    = coalesce(
                              contact_map_logo_url,
                              '/wp-content/themes/bti-new-properties-special/assets/img/demo/bti-icon-logo-white.webp'
                            )
where id = 1;

-- ---------------------------------------------------------------------------
-- testimonials: the homepage customer-review slider
--
-- width/height are stored because the original markup declares the intrinsic
-- size of each image, and keeping them prevents layout shift as the slider
-- loads. They are optional — an upload through the dashboard fills them in
-- automatically from Cloudinary's response.
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default 'Customer review',
  caption text not null default 'Customer review',
  width int,
  height int,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_sort_order_idx on public.testimonials (sort_order);

insert into public.testimonials (image_url, width, height, sort_order)
select * from (values
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(1).webp',  1386, 1080, 10),
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(4).webp',   800,  624, 20),
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(6).webp',  1386, 1080, 30),
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(7).webp',   800,  623, 40),
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(8).webp',   800,  623, 50),
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(9).webp',  1000, 1000, 60),
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(10).webp', 1000, 1000, 70),
  ('/wp-content/themes/bti-new-properties-special/assets/img/customer/customer-review%20(11).webp', 1000, 1000, 80)
) as seed(image_url, width, height, sort_order)
where not exists (select 1 from public.testimonials);

-- ---------------------------------------------------------------------------
-- sbu_units: the "Other Initiatives" slider
-- ---------------------------------------------------------------------------
create table if not exists public.sbu_units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  description text,
  url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists sbu_units_sort_order_idx on public.sbu_units (sort_order);

insert into public.sbu_units (name, logo_url, description, url, sort_order)
select * from (values
  (
    'Square Feet Story',
    '/wp-content/themes/bti-new-properties-special/assets/img/demo/ss-logo-01.webp',
    'With years of real estate expertise, Square Feet Story (SFS) delivers end-to-end design & construction solutions for residential and commercial spaces—covering architecture, interiors, landscaping, logistics, 3D imaging, and virtual tours.',
    'https://squarefeetstory.com/',
    10
  ),
  (
    'The Business Centre',
    '/wp-content/themes/bti-new-properties-special/assets/img/demo/tbc-logo-01.webp',
    'The Business Centre (TBC) at bti Celebration Point, Gulshan, offers flexible serviced office spaces and hosts seminars, workshops, and events—online or in-person—with comfort and convenience in mind.',
    'https://thebusinesscenterbd.com/',
    20
  ),
  (
    'bti Building Products',
    '/wp-content/themes/bti-new-properties-special/assets/img/demo/bp-logo-01.webp',
    'bti''s construction excellence is strengthened by bti Building Products, offering innovative, eco-friendly materials like concrete hollow blocks that ensure quality while supporting the environment.',
    'https://btibuildingproducts.com/',
    30
  ),
  (
    'Property Security & Management',
    '/wp-content/themes/bti-new-properties-special/assets/img/demo/psm-logo-01.webp',
    'At Property Security & Management, you can get the best service for securing, managing, and maintaining your property.',
    'https://psmbd.com/',
    40
  ),
  (
    'Landscapers',
    '/wp-content/themes/bti-new-properties-special/assets/img/demo/ls-logo-01.webp',
    'Backed by expert landscapers and urban planners, Landscapers delivers high-quality landscaping solutions that effortlessly transform your space.',
    'https://www.facebook.com/landscapersbd/',
    50
  ),
  (
    'FSS',
    '/wp-content/themes/bti-new-properties-special/assets/img/demo/fss-logo.webp',
    'FSS is an exclusive service by bti, dedicated to fire safety and awareness, ensuring a safer and more joyful homeownership experience.',
    '/fss',
    60
  )
) as seed(name, logo_url, description, url, sort_order)
where not exists (select 1 from public.sbu_units);

-- ---------------------------------------------------------------------------
-- Row Level Security — world-readable content, writes restricted to admin.
-- ---------------------------------------------------------------------------
alter table public.testimonials enable row level security;
alter table public.sbu_units    enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'public read testimonials') then
    create policy "public read testimonials" on public.testimonials for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'testimonials' and policyname = 'admin write testimonials') then
    create policy "admin write testimonials" on public.testimonials
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;

  if not exists (select 1 from pg_policies where tablename = 'sbu_units' and policyname = 'public read sbu_units') then
    create policy "public read sbu_units" on public.sbu_units for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'sbu_units' and policyname = 'admin write sbu_units') then
    create policy "admin write sbu_units" on public.sbu_units
      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
  end if;
end $$;
