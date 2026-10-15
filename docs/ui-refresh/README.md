# UI refresh (branch `ui-refresh`)

Goal from Akeem, 15 Oct 2026: make the site feel modern instead of old school, with research, hooks, visuals and
motion, using generic placeholder assets that Akeem redesigns before anything goes live.

**Status: local branch, not pushed, not live.** Nothing here changes payments, verification, prices or data.

## How to review

1. Run the site locally and open `/ui-kit` for every new component on one page (it only exists in development and
   on `*.vercel.app` preview URLs, never on keemverse.com).
2. Walk the pages: `/`, `/fashion`, `/fashion/finds`, `/fashion/presets`, `/contact`. Check a phone width and a
   desktop width, light and dark.
3. Read `SCORECARD.md` for the before/after rubric and `ASSETS.md` for everything that is a placeholder.

## What changed

| Area | Before | After |
|---|---|---|
| Typeface | Georgia everywhere, no sans | **Satoshi** for body and interface (Identity System v4); headlines keep the serif you prefer, now with fluid sizes |
| Navigation | Page reloads on most links; menu stayed open; nav scrolled away | In-app navigation for every internal link, menu closes on outside tap or Escape, sticky frosted bar |
| Browsing finds and presets | Small dropdown, hairline dividers | Scrollable category chips with counts, sticky category bar, result counts, "Results" mode |
| Product cards | 7px tags, full-width button, flat | Portrait cards, readable tags, quick view, round shop button, lift and zoom on hover |
| Loading and empty | Grey pulse blocks, emoji | Shimmer skeletons shaped like the cards, drawn empty state |
| Home | Two cards and a footer | Bigger headline, drifting brand colour, fresh finds rail, presets rail, closing call to action |
| Fashion hub | Static carousel, text columns | Slow push-in on photos, clickable slide dots, numbered service cards |
| Motion | Scattered one-offs | One kit: reveal, press feedback, card lift, shimmer, page fade; all off for reduced motion |
| Surfaces | Flat solid cards | Soft blurred cream and peach backdrop; **every card is frosted glass by default** (`.bg-card`), plus frosted bars and chips and a whisper of film grain. Menus and modal panels stay solid for legibility; opt out any element with `no-glass` |
| Presets popup | Static banner only | Optional drag-to-compare before/after slider when a preset has both photos |

## Editing without code: the admin console

- **Admin > Site content** (`/admin/content`): headlines, supporting lines, section titles and button labels for the
  home, Craft, Finds, Presets, Fashion and Contact pages. Group switcher, live preview of coloured words, unsaved
  count, reset-to-default per field, one Save. Live about 30 seconds after saving.
- **Admin > Products**: presets now have **Before photo** and **After photo** fields that switch on the drag-to-compare
  slider on that preset's popup.
- Coloured words in headlines: `*amber*`, `~teal~`, `**bold**`.
- Data lives in `data/site-content.json` (only values you changed are stored); the shipped wording is the fallback, so
  the site can never go blank if the content API is unavailable.

## What did NOT change (on purpose)

- The hero pair geometry, the light/dark behaviour and the 2.5s day-to-night fade you approved.
- The "Where to?" bio chooser, the checkout, Flutterwave, geo pricing and the Apps Script contract.
- Product and preset data (`data/products.json`) and the admin tools.
- Copy claims: no invented numbers, reviews or "as seen in".

## Decisions for Akeem

1. **Satoshi source: done.** Self-hosted (one 42 KB variable file) with the ITF Free Font License saved beside it.
   The licence explicitly allows commercial use and self-hosting on your own site.
2. **Mobile bottom tab bar: done** (Finds, Presets, Craft, Contact), phones only, hidden in admin and checkout.
3. **Before/after photos.** The slider is ready; it needs one same-framed pair per preset. Add `before_image` and
   `after_image` to a preset in `data/products.json` (the admin tool does not have those fields yet).
4. **Product popup and checkout** still use the old layout (they only picked up the new font). Next pass if wanted.
5. **Dark-mode hero cards** are still the white cards, as you chose.

## Known limits

- The rubric in `SCORECARD.md` is my assessment, not a measurement of visitors. The real test is analytics
  (bounce rate, pages per visit, clicks on the shop arrow) before and after going live.
- I could not test on a physical phone or on Safari or Firefox. Scroll-driven CSS reveals fall back to showing content.
