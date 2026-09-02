-- ============================================================
-- KBS site schema
--
-- Run this once in the Supabase SQL editor.
--
-- Shape of the thing: the public site reads `site_content` and `projects`
-- through the anon role, guarded by row level security. Nothing public can
-- write. Bookings are written only by the server using the service role key,
-- and are readable only by signed-in admins.
--
-- There is deliberately no public sign up anywhere. Admins are created by hand
-- in the Supabase dashboard and then listed in `admins`.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- who is allowed into the dashboard
-- ------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allow list for the dashboard. Add a row by hand after creating the user in Auth. Being in auth.users is not enough on its own.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ------------------------------------------------------------
-- editable page content: one row per top level key of the seed
-- ------------------------------------------------------------
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

comment on table public.site_content is
  'Overrides merged over src/content/seed.ts at render time. A missing key simply means the seed value is used, so this table can be empty and the site still renders.';

-- ------------------------------------------------------------
-- other projects, added from the dashboard
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  image text not null default '',
  title_en text not null default '',
  title_bn text not null default '',
  location_en text not null default '',
  location_bn text not null default '',
  status_en text not null default '',
  status_bn text not null default '',
  sort integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists projects_published_sort_idx
  on public.projects (published, sort);

-- ------------------------------------------------------------
-- site visit bookings
-- ------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text,
  language text not null default 'bn',
  locale text not null default 'bn',
  visit_date date,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);

-- ------------------------------------------------------------
-- internal notes that must never reach the public site.
-- Approval status lives here, not in site_content, so it cannot be
-- rendered by accident.
-- ------------------------------------------------------------
create table if not exists public.internal_notes (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.internal_notes (key, value)
values ('rajuk_status', 'Submitted, approval not yet granted. Internal only, never shown on the public site.')
on conflict (key) do nothing;

-- ============================================================
-- Row level security
-- ============================================================

alter table public.admins         enable row level security;
alter table public.site_content   enable row level security;
alter table public.projects       enable row level security;
alter table public.bookings       enable row level security;
alter table public.internal_notes enable row level security;

-- content: world readable, admin writable
drop policy if exists "content readable by anyone" on public.site_content;
create policy "content readable by anyone"
  on public.site_content for select
  using (true);

drop policy if exists "content writable by admins" on public.site_content;
create policy "content writable by admins"
  on public.site_content for all
  using (public.is_admin())
  with check (public.is_admin());

-- projects: only published rows are public, admins see and edit everything
drop policy if exists "published projects readable by anyone" on public.projects;
create policy "published projects readable by anyone"
  on public.projects for select
  using (published or public.is_admin());

drop policy if exists "projects writable by admins" on public.projects;
create policy "projects writable by admins"
  on public.projects for all
  using (public.is_admin())
  with check (public.is_admin());

-- bookings: no public access at all. Inserts happen server side with the
-- service role key, which bypasses RLS. Admins can read and update.
drop policy if exists "bookings readable by admins" on public.bookings;
create policy "bookings readable by admins"
  on public.bookings for select
  using (public.is_admin());

drop policy if exists "bookings updatable by admins" on public.bookings;
create policy "bookings updatable by admins"
  on public.bookings for update
  using (public.is_admin())
  with check (public.is_admin());

-- admins table: a signed-in admin may read the list, nobody may write it from
-- the client. Add and remove admins in the Supabase dashboard.
drop policy if exists "admins readable by admins" on public.admins;
create policy "admins readable by admins"
  on public.admins for select
  using (public.is_admin());

-- internal notes: admins only, both ways. Never exposed to the site.
drop policy if exists "internal notes admin only" on public.internal_notes;
create policy "internal notes admin only"
  on public.internal_notes for all
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- keep updated_at honest
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch
  before update on public.site_content
  for each row execute function public.touch_updated_at();

drop trigger if exists internal_notes_touch on public.internal_notes;
create trigger internal_notes_touch
  before update on public.internal_notes
  for each row execute function public.touch_updated_at();
