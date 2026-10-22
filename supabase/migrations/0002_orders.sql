-- KEEMVERSE orders: Phase 1 of the Supabase move (see roadmap.md).
--
-- The Apps Script verifier keeps writing every paid order to the Orders sheet
-- exactly as before, and ALSO sends a copy here. The sheet stays the source of
-- truth for delivery until the two have matched for a few weeks. Nothing on
-- the live site reads this table yet.
--
-- PRIVATE DATA: this table holds buyers' emails. The repo is public, so the
-- table is locked down: row level security is on and there are NO policies, so
-- the public (anon) key can read and write nothing. Only the server-side
-- secret key used inside Apps Script can write, and it bypasses RLS by design.
-- Never put that key in this repo, the site, or chat.

create extension if not exists "pgcrypto";

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  tx_ref text not null unique,            -- Flutterwave reference; the unique key makes retries harmless
  email text not null,                    -- stored lower-case
  buyer_name text,
  item text not null,                     -- the product name, as in the Lightroom Presets sheet
  amount numeric,
  currency text,
  status text not null default 'Paid',

  marketing_opt_in boolean not null default false,   -- the checkout checkbox
  source text not null default 'apps-script'
);

create index if not exists orders_email_idx on orders (lower(email));
create index if not exists orders_item_idx on orders (item);

alter table orders enable row level security;
-- (no policies on purpose: nothing is readable or writable with the public key)

-- Who to tell when a new look is added to the Preset Pack: paid pack buyers who
-- ticked "Email me when new looks are added to my pack". Run it in the SQL
-- editor:  select * from pack_update_list;
create or replace view pack_update_list
with (security_invoker = true) as
  select distinct lower(email) as email
  from orders
  where status = 'Paid'
    and marketing_opt_in
    and item ilike '%preset pack%';

revoke all on orders from anon, authenticated;
revoke all on pack_update_list from anon, authenticated;
