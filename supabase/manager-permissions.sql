-- ============================================================
-- KBS — per-manager permissions
--
-- Builds on manager-role.sql. A row in `admins` is staff:
--   role = 'admin'   → everything, `permissions` ignored
--   role = 'manager' → only what `permissions` (text[]) grants
--
-- has_perm('key') is the gate: true for any full admin, and for a manager
-- whose `permissions` array contains that key. Every manager-relevant write
-- policy below is keyed to one permission. Reads stay is_admin() ("is staff")
-- so a manager can still see the dashboard data for the sections they manage.
-- Idempotent — safe to re-run.
-- ============================================================

alter table public.admins add column if not exists permissions text[] not null default '{}';
alter table public.profiles add column if not exists address text not null default '';

create or replace function public.has_perm(key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid()
      and (a.role = 'admin' or key = any (a.permissions))
  );
$$;

-- ---------------- site content / CMS / projects / notes ----------------
drop policy if exists "content writable by full admins" on public.site_content;
create policy "content writable by perm" on public.site_content for all
  using (public.has_perm('content')) with check (public.has_perm('content'));

drop policy if exists "projects writable by full admins" on public.projects;
create policy "projects writable by perm" on public.projects for all
  using (public.has_perm('projects')) with check (public.has_perm('projects'));

drop policy if exists "pages writable by full admins" on public.cms_pages;
create policy "pages writable by perm" on public.cms_pages for all
  using (public.has_perm('pages')) with check (public.has_perm('pages'));

drop policy if exists "menu writable by full admins" on public.cms_menu_items;
create policy "menu writable by perm" on public.cms_menu_items for all
  using (public.has_perm('pages')) with check (public.has_perm('pages'));

drop policy if exists "internal notes full admin only" on public.internal_notes;
create policy "internal notes by perm" on public.internal_notes for all
  using (public.has_perm('internal')) with check (public.has_perm('internal'));

-- ---------------- bookings ----------------
drop policy if exists "bookings updatable by admins" on public.bookings;
create policy "bookings updatable by perm" on public.bookings for update
  using (public.has_perm('bookings')) with check (public.has_perm('bookings'));

-- ---------------- products & categories ----------------
drop policy if exists "products insertable by staff" on public.products;
drop policy if exists "products updatable by staff" on public.products;
drop policy if exists "products deletable by full admins" on public.products;
create policy "products insertable by perm" on public.products for insert
  with check (public.has_perm('shop.products'));
create policy "products updatable by perm" on public.products for update
  using (public.has_perm('shop.products')) with check (public.has_perm('shop.products'));
create policy "products deletable by perm" on public.products for delete
  using (public.has_perm('shop.products.delete'));

drop policy if exists "categories insertable by staff" on public.product_categories;
drop policy if exists "categories updatable by staff" on public.product_categories;
drop policy if exists "categories deletable by full admins" on public.product_categories;
create policy "categories insertable by perm" on public.product_categories for insert
  with check (public.has_perm('shop.products'));
create policy "categories updatable by perm" on public.product_categories for update
  using (public.has_perm('shop.products')) with check (public.has_perm('shop.products'));
create policy "categories deletable by perm" on public.product_categories for delete
  using (public.has_perm('shop.products.delete'));

drop policy if exists "product images writable by staff" on public.product_images;
create policy "product images by perm" on public.product_images for all
  using (public.has_perm('shop.products')) with check (public.has_perm('shop.products'));

-- ---------------- orders ----------------
drop policy if exists "orders updatable by staff" on public.orders;
drop policy if exists "orders insertable by full admins" on public.orders;
drop policy if exists "orders deletable by full admins" on public.orders;
create policy "orders updatable by perm" on public.orders for update
  using (public.has_perm('shop.orders')) with check (public.has_perm('shop.orders'));
create policy "orders insertable by perm" on public.orders for insert
  with check (public.has_perm('shop.orders.manage'));
create policy "orders deletable by perm" on public.orders for delete
  using (public.has_perm('shop.orders.manage'));

drop policy if exists "order items writable by full admins" on public.order_items;
create policy "order items by perm" on public.order_items for all
  using (public.has_perm('shop.orders.manage')) with check (public.has_perm('shop.orders.manage'));

-- ---------------- reviews & quotes ----------------
drop policy if exists "reviews moderated by admins" on public.product_reviews;
drop policy if exists "reviews deleted by full admins" on public.product_reviews;
create policy "reviews moderated by perm" on public.product_reviews for update
  using (public.has_perm('shop.reviews')) with check (public.has_perm('shop.reviews'));
create policy "reviews deleted by perm" on public.product_reviews for delete
  using (public.has_perm('shop.reviews.delete'));

drop policy if exists "quotes writable by admins" on public.quote_requests;
create policy "quotes writable by perm" on public.quote_requests for update
  using (public.has_perm('shop.quotes')) with check (public.has_perm('shop.quotes'));

-- ---------------- payment gateways ----------------
drop policy if exists "gateways full admin only" on public.payment_gateways;
create policy "gateways by perm" on public.payment_gateways for all
  using (public.has_perm('shop.payments')) with check (public.has_perm('shop.payments'));

-- the `admins` table itself stays full-admin-only for direct writes; the team
-- server actions run as the service role and check the 'team' permission in
-- the app layer, so a manager never writes this table directly.
