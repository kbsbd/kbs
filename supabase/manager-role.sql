-- ============================================================
-- KBS — manager role
--
-- A row in `admins` is staff. `role` splits staff into:
--   admin   — everything (default; existing rows stay admin)
--   manager — day-to-day: sees orders, changes order status, adds and
--             edits products, moderates reviews. Cannot edit or delete an
--             order, cannot delete a product or category, cannot touch
--             payment keys, site content, pages, the team, or internal notes.
--
-- is_admin() stays "is staff" so every existing read policy keeps working
-- for managers. is_full_admin() is the new stricter check, applied only to
-- the sensitive policies below. Idempotent — safe to re-run.
-- ============================================================

alter table public.admins add column if not exists role text not null default 'admin';
alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check check (role in ('admin', 'manager'));

create or replace function public.is_full_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- payment keys and internal notes: full admin only, both ways
-- ------------------------------------------------------------
drop policy if exists "gateways admin only" on public.payment_gateways;
create policy "gateways full admin only" on public.payment_gateways for all
  using (public.is_full_admin()) with check (public.is_full_admin());

drop policy if exists "internal notes admin only" on public.internal_notes;
create policy "internal notes full admin only" on public.internal_notes for all
  using (public.is_full_admin()) with check (public.is_full_admin());

-- ------------------------------------------------------------
-- site content / CMS / real-estate projects: full admin writes only
-- ------------------------------------------------------------
drop policy if exists "content writable by admins" on public.site_content;
create policy "content writable by full admins" on public.site_content for all
  using (public.is_full_admin()) with check (public.is_full_admin());

drop policy if exists "projects writable by admins" on public.projects;
create policy "projects writable by full admins" on public.projects for all
  using (public.is_full_admin()) with check (public.is_full_admin());

drop policy if exists "pages writable by admins" on public.cms_pages;
create policy "pages writable by full admins" on public.cms_pages for all
  using (public.is_full_admin()) with check (public.is_full_admin());

drop policy if exists "menu writable by admins" on public.cms_menu_items;
create policy "menu writable by full admins" on public.cms_menu_items for all
  using (public.is_full_admin()) with check (public.is_full_admin());

-- ------------------------------------------------------------
-- the team list: only a full admin may add or remove staff
-- ------------------------------------------------------------
drop policy if exists "admins readable by admins" on public.admins;
create policy "own admin row readable" on public.admins for select
  using (user_id = auth.uid() or public.is_full_admin());

drop policy if exists "admins writable by full admins" on public.admins;
create policy "admins writable by full admins" on public.admins for all
  using (public.is_full_admin()) with check (public.is_full_admin());

-- ------------------------------------------------------------
-- products: staff add + edit, full admin only deletes
-- ------------------------------------------------------------
drop policy if exists "products writable by admins" on public.products;
create policy "products readable by staff" on public.products for select
  using (status = 'active' or public.is_admin());
create policy "products insertable by staff" on public.products for insert
  with check (public.is_admin());
create policy "products updatable by staff" on public.products for update
  using (public.is_admin()) with check (public.is_admin());
create policy "products deletable by full admins" on public.products for delete
  using (public.is_full_admin());
drop policy if exists "active products readable" on public.products;

drop policy if exists "categories writable by admins" on public.product_categories;
create policy "categories insertable by staff" on public.product_categories for insert
  with check (public.is_admin());
create policy "categories updatable by staff" on public.product_categories for update
  using (public.is_admin()) with check (public.is_admin());
create policy "categories deletable by full admins" on public.product_categories for delete
  using (public.is_full_admin());

-- product images: staff manage them (needed when adding a product)
drop policy if exists "product images writable by admins" on public.product_images;
create policy "product images writable by staff" on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- orders: staff read + change status, full admin only edits / deletes
-- ------------------------------------------------------------
drop policy if exists "orders writable by admins" on public.orders;
create policy "orders updatable by staff" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());
create policy "orders insertable by full admins" on public.orders for insert
  with check (public.is_full_admin());
create policy "orders deletable by full admins" on public.orders for delete
  using (public.is_full_admin());
-- select policy "own orders readable" (own or is_admin) already covers staff

drop policy if exists "order items writable by admins" on public.order_items;
create policy "order items writable by full admins" on public.order_items for all
  using (public.is_full_admin()) with check (public.is_full_admin());

-- ------------------------------------------------------------
-- reviews: staff moderate (publish / reject), full admin only deletes
-- ------------------------------------------------------------
drop policy if exists "reviews deleted by admins" on public.product_reviews;
create policy "reviews deleted by full admins" on public.product_reviews for delete
  using (public.is_full_admin());
-- "reviews moderated by admins" (update, is_admin) already lets managers moderate

-- quote_requests "quotes writable by admins" (update, is_admin) already lets
-- managers change quote status — no change needed.
