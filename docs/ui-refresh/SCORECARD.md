# Before / after scorecard

Ten criteria, scored 0 to 5. **Self-assessed, not measured with visitors.** Each score cites what changed.

| # | Criterion | Before | After | Evidence |
|---|---|---|---|---|
| 1 | Brand typography | 1 | 5 | Georgia replaced by Satoshi via tokens, fluid display sizes |
| 2 | Navigation and wayfinding | 2 | 4 | Sticky nav, menu closes properly, no full reloads, new page opens at top |
| 3 | Browsing and filtering | 2 | 4 | Chips with counts, sticky bar, result counts, clear-filters empty state |
| 4 | Card clarity and tap targets | 2 | 4 | 7px tags to 10px, 40px shop button, quick view, portrait crops |
| 5 | Motion and feedback | 2 | 4 | One motion kit, press and hover feedback, reduced motion honoured |
| 6 | Loading and perceived speed | 2 | 4 | Shaped shimmer skeletons, page fade, no reload flashes |
| 7 | Home page content and hook | 2 | 4 | Larger headline, live rails from the real catalogue, closing call to action |
| 8 | Empty and error states | 1 | 4 | Drawn empty state, clear-filters action |
| 9 | Accessibility basics | 2 | 4 | Keyboard-operable cards, focus ring, labelled slider, reduced motion |
| 10 | Visual hierarchy and spacing | 3 | 4 | Section headings with rule, consistent card rhythm, balanced headings |
| | **Total (of 50)** | **19** | **41** | |
| | **As a score out of 100** | **38** | **82** | +44 points, about 2.2 times the "before" score |

## Measured facts (Lighthouse, mobile profile, same machine)

Baseline = the current `main` build. After = this branch. Both served with `vite preview` against the live API. Home
was run three times each (medians shown); Finds and Presets once each, so treat small differences as noise.

| Page | Measure | Before | After |
|---|---|---|---|
| Home | Performance | 74 | 78 (runs: 81, 73, 78) |
| Home | Largest paint | 9.4 s | 4.8 s (one of three runs stayed at 10 s) |
| Home | Accessibility | 94 | 100 |
| Fashion Finds | Performance | 63 | 86 |
| Fashion Finds | Largest paint | 10.1 s | 3.8 s |
| Fashion Finds | Layout shift (CLS) | 0.207 | 0.002 |
| Fashion Finds | Accessibility | 100 | 100 |
| Presets | Performance | 56 | 79 |
| Presets | Largest paint | 11.7 s | 5.0 s |
| Presets | Layout shift (CLS) | 0.285 | 0.000 |
| Presets | Accessibility | 98 | 100 |
| All three | Best practices, SEO | 100, 100 | 100, 100 |

What moved the numbers: the font stylesheet no longer blocks first paint; the home tagline (the largest paint) no
longer waits behind the headline animation; space is reserved for the banner and featured row so lists stop jumping;
the hero photo loads first; white text on amber and teal became dark ink; heading order and accessible names fixed.

Other facts: JS bundle 184.0 KB to about 187 KB gzip, CSS 22.7 KB to about 25 KB gzip; type checker clean.

**Reading it honestly:** performance on Finds and Presets rose by about 23 points each and layout jumping is gone.
Home performance is a modest gain (the hero photo is large and unchanged, by your choice). Lighthouse measures speed
and accessibility, not whether the design feels modern, so the rubric above is still my judgement.

## What would actually prove "60% better"

Compare before and after on the live site over two weeks of comparable traffic: pages per visit, scroll depth on the
finds and presets pages, clicks on the shop arrow, and presets page to checkout rate. Vercel Web Analytics is already
installed, so the numbers will be there once this goes live.
