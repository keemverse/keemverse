# Product Catalog Backend — Setup

This replaces the Google Sheet + Apps Script read API as the source of
truth for Fashion Finds, Lightroom Presets, and Digital Craft bundles.
No new third-party account: the "database" is a JSON file
(`data/products.json`) in this same GitHub repo, read and written through
GitHub's API. One Vercel serverless API (`/api/products`), one gated admin
form (`/admin/products`). Images stay on Google (Drive/Photos) — the
catalog only ever stores a URL to the image, never the file itself.

## One-time setup

1. **Generate a GitHub Personal Access Token** on your existing GitHub
   account (Settings → Developer settings → Fine-grained tokens → Generate
   new token). Scope it to just this repo, with **Contents: Read and
   write** permission — nothing else needed. This is `GITHUB_TOKEN`.
2. Note your repo as `owner/name` (e.g. `keemverse/keemverse`) — this is
   `GITHUB_REPO`. The branch it commits to (probably `main`) is
   `GITHUB_BRANCH` (optional — defaults to `main` if not set).
3. Pick your own **admin secret** — any long random string, this is what
   unlocks `/admin/products` for you (same idea as the KEEMVERSE Sheets
   bridge's shared secret). This is `ADMIN_SECRET`.
4. In **Vercel → Project Settings → Environment Variables**, add:
   - `GITHUB_TOKEN`
   - `GITHUB_REPO`
   - `ADMIN_SECRET`

   Redeploy after adding them.

## Using it

- Go to `yoursite.com/admin/products`, enter the `ADMIN_SECRET` you picked.
- Add a Fashion Find / Preset / Design Bundle — paste the image URL (from
  wherever you host images on Google), fill the rest, hit Add. This commits
  straight to `data/products.json` in the repo — no Sheet involved.
- Edit/Delete work the same way from the list below the form.
- Reads (`GET /api/products`) always fetch the current file straight from
  GitHub's API on every request, so changes show up immediately — no
  waiting on a redeploy to see your own edit reflected in the admin panel.

## Migrating existing Fashion Finds data

Not done automatically — the current 31 Fashion Finds rows live in the
`KEEMVERSE Product Database` Google Sheet, not in `data/products.json` yet.
Once the env vars above are set, tell me and I'll pull the current rows and
write them into `data/products.json` directly, so nothing has to be
re-typed by hand.

## Cutting a page over

`FashionFindsPage.tsx` still reads from the old Apps Script API
(`getProducts()` in `src/app/lib/products.ts`). Once Fashion Finds data is
migrated, swap that call to `getCatalogProducts("fashion_find")` — one line
— and the page reads from the new backend. Do this per page, not all three
at once, so nothing on the live site goes blank mid-migration.

## If this ever outgrows a flat file

`supabase/migrations/0001_products.sql` is kept as the migration target —
its `products` table matches `data/products.json`'s shape field-for-field
on purpose. Moving day is "bulk insert this JSON into Supabase," not a
schema redesign, if the catalog ever gets big enough (many hundreds of
products, or more than one person editing at once) that a committed JSON
file stops being the right fit.
