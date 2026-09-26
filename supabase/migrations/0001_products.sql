-- NOT CURRENTLY IN USE. The live product catalog runs on data/products.json
-- (read/written via the GitHub Contents API, see api/_github.ts) instead of
-- a real database, specifically to avoid creating a new third-party account
-- for a catalog this small. This file is kept as the migration target for
-- when the catalog outgrows a flat JSON file — the `products` table below
-- matches data/products.json's shape field-for-field on purpose, so moving
-- day is "bulk insert this JSON," not a schema redesign.
--
-- KEEMVERSE product catalog — replaces the Google Sheet + Apps Script
-- read API (docs/apps-script-verify.gs's sibling script) as the source of
-- truth for Fashion Finds, Lightroom Presets, and Digital Craft bundles.
-- One table, discriminated by `type`, since the fields overlap enough that
-- three separate tables would just be the same columns three times.

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('fashion_find', 'preset', 'design_bundle')),

  name text not null,
  source text,
  category text,
  description text,
  why_picked text,
  tags text,                 -- comma-separated, matches the site's existing parsing

  price text,                -- kept as text ("₦4,586" / "$12") to match formatPrice() as-is
  rating numeric,

  image_url text,
  affiliate_link text,
  direct_product_link text,  -- the real per-product link, preserved separately from the affiliate link

  status text not null default 'Live' check (status in ('Live', 'Sold Out', 'Hidden')),
  featured boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_type_idx on products (type);
create index if not exists products_status_idx on products (status);

-- Public (anon) read access — only rows that should actually be visible on
-- the live site. Writes are never done with the anon key; the admin API
-- route uses the service-role key server-side, which bypasses RLS entirely.
alter table products enable row level security;

create policy "Public can read live products"
  on products for select
  using (status = 'Live');

-- Keep updated_at honest on every write, same idea as Content Master's
-- Last Updated stamp — don't rely on callers to set it themselves.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();
