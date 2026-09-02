-- ============================================================
-- KBS site — Phase 3 schema
--
-- The shop (catalog, cart-driven orders, quote requests, reviews,
-- wishlists), customer accounts, a small page/menu CMS, and the
-- place where payment-gateway keys are stored.
--
-- Run this in the Supabase SQL editor after schema.sql. It is
-- idempotent — safe to re-run.
--
-- Shape: the public site reads active/published rows through the
-- anon role under RLS. Customers (auth.users with a row in
-- `profiles` but NOT in `admins`) read and write only their own
-- orders, wishlist and reviews. The dashboard (admins) writes
-- everything. Order + quote inserts also happen server-side with
-- the service role, which bypasses RLS.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- customer accounts
-- ------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per customer. Created by the signup flow. Having a profile is NOT admin access — that is still the separate `admins` table.';

-- a signed-in user who is not an admin
create or replace function public.is_authenticated()
returns boolean language sql stable as $$
  select auth.uid() is not null
$$;

-- ------------------------------------------------------------
-- catalog
-- ------------------------------------------------------------
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null default '',
  name_bn text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null default '',
  name_bn text not null default '',
  summary text not null default '',
  summary_bn text not null default '',
  description text not null default '',
  description_bn text not null default '',
  category_id uuid references public.product_categories (id) on delete set null,
  price numeric(12, 2) not null default 0,
  compare_at_price numeric(12, 2),
  sku text not null default '',
  stock integer not null default 0,
  track_stock boolean not null default true,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_sort_idx on public.products (status, sort);
create index if not exists products_category_idx on public.products (category_id);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  sort integer not null default 0
);

create index if not exists product_images_product_idx on public.product_images (product_id, sort);

-- ------------------------------------------------------------
-- reviews — moderated, published by an admin
-- ------------------------------------------------------------
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null default '',
  rating smallint not null check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_idx
  on public.product_reviews (product_id, status);

-- ------------------------------------------------------------
-- wishlists
-- ------------------------------------------------------------
create table if not exists public.wishlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ------------------------------------------------------------
-- orders (from the cart) and quote requests (from the inquiry flow)
-- ------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('KBS-' || nextval('public.order_number_seq')),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded', 'failed')),
  payment_method text not null default 'cod'
    check (payment_method in ('cod', 'bkash', 'nagad', 'sslcommerz', 'quote')),
  payment_ref text not null default '',
  currency text not null default 'BDT',
  subtotal numeric(12, 2) not null default 0,
  shipping numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  customer_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  shipping_address text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  name text not null default '',
  price numeric(12, 2) not null default 0,
  qty integer not null default 1,
  line_total numeric(12, 2) not null default 0
);

create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  company text not null default '',
  message text not null default '',
  items jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new', 'quoted', 'won', 'lost')),
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);

-- ------------------------------------------------------------
-- payment gateway config — keys entered from the dashboard later
-- ------------------------------------------------------------
create table if not exists public.payment_gateways (
  id text primary key check (id in ('bkash', 'nagad', 'sslcommerz')),
  enabled boolean not null default false,
  mode text not null default 'sandbox' check (mode in ('sandbox', 'live')),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.payment_gateways (id) values ('bkash'), ('nagad'), ('sslcommerz')
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- CMS: arbitrary pages and the editable nav
-- ------------------------------------------------------------
create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null default '',
  title_bn text not null default '',
  seo_description text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_menu_items (
  id uuid primary key default gen_random_uuid(),
  label text not null default '',
  label_bn text not null default '',
  href text not null default '',
  parent_id uuid references public.cms_menu_items (id) on delete cascade,
  sort integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists cms_menu_items_sort_idx on public.cms_menu_items (sort);

-- ============================================================
-- Row level security
-- ============================================================

alter table public.profiles          enable row level security;
alter table public.product_categories enable row level security;
alter table public.products          enable row level security;
alter table public.product_images    enable row level security;
alter table public.product_reviews   enable row level security;
alter table public.wishlists         enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.quote_requests    enable row level security;
alter table public.payment_gateways  enable row level security;
alter table public.cms_pages             enable row level security;
alter table public.cms_menu_items        enable row level security;

-- profiles: a user owns their row; admins can read all
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles" on public.profiles for select
  using (public.is_admin());

-- categories: world readable, admin writable
drop policy if exists "categories readable" on public.product_categories;
create policy "categories readable" on public.product_categories for select using (true);
drop policy if exists "categories writable by admins" on public.product_categories;
create policy "categories writable by admins" on public.product_categories for all
  using (public.is_admin()) with check (public.is_admin());

-- products: active rows are public, admins see and edit everything
drop policy if exists "active products readable" on public.products;
create policy "active products readable" on public.products for select
  using (status = 'active' or public.is_admin());
drop policy if exists "products writable by admins" on public.products;
create policy "products writable by admins" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- product images follow their product
drop policy if exists "product images readable" on public.product_images;
create policy "product images readable" on public.product_images for select
  using (
    exists (select 1 from public.products p
            where p.id = product_id and (p.status = 'active' or public.is_admin()))
  );
drop policy if exists "product images writable by admins" on public.product_images;
create policy "product images writable by admins" on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

-- reviews: published are public; a signed-in user may submit (forced pending);
-- admins moderate
drop policy if exists "published reviews readable" on public.product_reviews;
create policy "published reviews readable" on public.product_reviews for select
  using (status = 'published' or public.is_admin() or user_id = auth.uid());
drop policy if exists "users submit reviews" on public.product_reviews;
create policy "users submit reviews" on public.product_reviews for insert
  with check (user_id = auth.uid() and status = 'pending');
drop policy if exists "reviews moderated by admins" on public.product_reviews;
create policy "reviews moderated by admins" on public.product_reviews for update
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "reviews deleted by admins" on public.product_reviews;
create policy "reviews deleted by admins" on public.product_reviews for delete
  using (public.is_admin());

-- wishlists: a user owns their rows
drop policy if exists "own wishlist" on public.wishlists;
create policy "own wishlist" on public.wishlists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders: a user reads their own; admins read/write all. Inserts come from
-- the server (service role) so guests can check out.
drop policy if exists "own orders readable" on public.orders;
create policy "own orders readable" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders writable by admins" on public.orders;
create policy "orders writable by admins" on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "own order items readable" on public.order_items;
create policy "own order items readable" on public.order_items for select
  using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );
drop policy if exists "order items writable by admins" on public.order_items;
create policy "order items writable by admins" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());

-- quote requests: no public read; admins only. Inserts are server-side.
drop policy if exists "quotes readable by admins" on public.quote_requests;
create policy "quotes readable by admins" on public.quote_requests for select
  using (public.is_admin());
drop policy if exists "quotes writable by admins" on public.quote_requests;
create policy "quotes writable by admins" on public.quote_requests for update
  using (public.is_admin()) with check (public.is_admin());

-- payment gateways: admins only, both ways. Never exposed to the anon role.
drop policy if exists "gateways admin only" on public.payment_gateways;
create policy "gateways admin only" on public.payment_gateways for all
  using (public.is_admin()) with check (public.is_admin());

-- pages: published are public, admins edit
drop policy if exists "published pages readable" on public.cms_pages;
create policy "published pages readable" on public.cms_pages for select
  using (status = 'published' or public.is_admin());
drop policy if exists "pages writable by admins" on public.cms_pages;
create policy "pages writable by admins" on public.cms_pages for all
  using (public.is_admin()) with check (public.is_admin());

-- menu: visible items are public, admins edit
drop policy if exists "visible menu readable" on public.cms_menu_items;
create policy "visible menu readable" on public.cms_menu_items for select
  using (visible or public.is_admin());
drop policy if exists "menu writable by admins" on public.cms_menu_items;
create policy "menu writable by admins" on public.cms_menu_items for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- keep updated_at honest on the new tables
-- ------------------------------------------------------------
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists cms_pages_touch on public.cms_pages;
create trigger cms_pages_touch before update on public.cms_pages
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- a profile row is created automatically on signup
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
