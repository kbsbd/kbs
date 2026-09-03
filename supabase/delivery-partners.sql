-- ============================================================
-- KBS — delivery partner settings
--
-- Same shape as payment_gateways: one row per courier, `enabled` toggle and
-- a jsonb `config` the admin pastes their API credentials into. The couriers
-- are recognised but not yet wired to book shipments — this stores the setup
-- so that work is a small next step. Gated by the 'shop.delivery' permission.
-- Idempotent.
-- ============================================================

create table if not exists public.delivery_partners (
  id text primary key check (id in ('steadfast', 'pathao', 'redx', 'sundarban', 'sa-paribahan')),
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.delivery_partners enable row level security;

drop policy if exists "delivery by perm" on public.delivery_partners;
create policy "delivery by perm" on public.delivery_partners for all
  using (public.has_perm('shop.delivery')) with check (public.has_perm('shop.delivery'));

insert into public.delivery_partners (id) values
  ('steadfast'), ('pathao'), ('redx'), ('sundarban'), ('sa-paribahan')
on conflict (id) do nothing;
