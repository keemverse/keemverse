KEEMVERSE Roadmap

# Supabase: accounts and orders (PARKED, planned 15 Oct 2026)

**Status:** parked on purpose. Nothing here should be started until a trigger below is true.

## Why it is parked

Buyers do not log in today. They pay, receive a tokenised download link by email, and can restore a lost link by email lookup. Payments are proven end to end. Moving verification and delivery is a multi-day rebuild where a mistake means a buyer pays and gets nothing.

## Triggers (start when any one is true)

1. Buyers ask for accounts or a "my purchases" library.
2. A membership or subscription product is being launched.
3. The Google Sheet is hitting limits or slowing checkout, or Apps Script quotas get in the way.

## Decisions already made

- **Never store passwords ourselves.** The repo is public and the Sheet has no rate limiting. Use managed auth. Prefer passwordless (email magic link) first.
- **Supabase, not Clerk.** The real weakness is orders and downloads living in a Sheet, so a database is needed anyway; Supabase gives database and auth in one account. Clerk is login-only and would add a second vendor. Clerk is the shortcut only if we want polished login screens and keep the Sheet.
- **Do not use Supabase Storage at first.** Master files stay in the private Google Drive folder and delivery stays in Apps Script. Revisit only if packs outgrow the 20 MB `MAX_PACK_BYTES` limit (then consider Cloudflare R2 or Vercel Blob).
- **Use the Pro plan (about $25/month) before relying on it.** Free projects pause after 7 days of inactivity.
- **The schema is ready:** `supabase/migrations/0001_products.sql` matches `data/products.json` field for field.

## Phases (each one shippable and reversible)

1. **Add, don't replace.** Create the Supabase project. Add magic-link auth and an `orders` table. The Apps Script verifier writes each order to Supabase in addition to the Sheet (one HTTP call). Run both in parallel.
2. **My purchases page.** Logged-in buyers see their orders. A Vercel function checks the session and asks the Apps Script for a fresh tokenised link. Never expose Drive file IDs.
3. **Move products.** Bulk-insert `data/products.json` into the `products` table and point the site at it.
4. **Retire the Sheet as the order store** only after Sheet and Supabase have matched for a few weeks.
5. **Files last, and only if needed.**

## Things to keep true while this is parked

- `NGN_PER_USD` in `src/app/lib/currency.ts` equals `USD_PER_NGN_RATE` in the Apps Script `handleVerify`.
- The Price column in the Sheet equals the price in `data/products.json`.
- No user data in this repo, ever.

## Open questions

- Confirm Supabase's current free-tier limits and Pro pricing on their pricing page before committing.
- Ask Flutterwave support, in writing, which FX rate applies to USD charges and whether a USD balance can be held.
- Decide whether buyers need a profile at all, or only a purchases list.
