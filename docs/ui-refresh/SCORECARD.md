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

## Measured facts (Lighthouse, mobile profile, same machine, three runs each)

Baseline = the current `main` build. After = the final branch build (aea76e4 plus shop pages in the first download).
Both served with `vite preview` against the live API. Medians shown, individual runs in brackets.

| Page | Measure | Before | After |
|---|---|---|---|
| Home | Performance | 74 (74, 74, 74) | 74 (74, 74, 73) |
| Home | Largest paint | 9.4 s | 9.6 s (stayed near 10 s in the final batch; an earlier batch showed 4.7 s) |
| Home | Accessibility | 94 | 96 |
| Fashion Finds | Performance | 63 (63, 63, 63) | 88 (92, 88, 86) |
| Fashion Finds | Largest paint | 10.0 s | 3.6 s (64% faster) |
| Fashion Finds | Layout shift (CLS) | 0.207 | 0.002 |
| Fashion Finds | Accessibility | 100 | 100 |
| Presets | Performance | 59 (59, 59, 59) | 74 (74, 70, 81) |
| Presets | Largest paint | 11.5 s | 10.9 s (runs 10.9, 11.6, 4.8: unstable) |
| Presets | Layout shift (CLS) | 0.285 | 0.001 |
| Presets | Accessibility | 98 | 100 |
| All three | Best practices, SEO | 100, 100 | 100, 100 |

What clearly worked: Finds is far faster and steadier; layout jumping is gone on both shop pages; accessibility is up.

What did not: **home and Presets largest-paint time is unstable.** Runs split between roughly 5 s and 10 to 12 s, so I
cannot honestly claim a gain there. The home hero photo (large, unchanged by your choice) is the likely cause, and
the page is discovered late because it renders in the browser. A fix needs real hosting changes (preloading the hero,
self-hosting the font), not more styling.

Home accessibility is 96, not 100, because the amber and teal quick links keep their approved white text (white on
those colours is about 2.7 to 1 and 3.1 to 1). Darker pills or dark text would fix it; that is your design call.

Other facts: entry JS about 159 KB gzip (baseline 184 KB), CSS about 25 KB gzip (baseline 22.7 KB); type checker clean.

### Second lens: applied throttling (real network and CPU slowdown, no simulation)

Run after the simulated numbers looked unstable on home and Presets. Three runs each, medians.

| Page | Performance | Largest paint | Layout shift | Main-thread blocking |
|---|---|---|---|---|
| Home, before | 76 | 5.0 s | 0 | about 3 ms |
| Home, after (first build) | 57 | 5.5 s | 0 | about 900 ms (regression) |
| Home, after (blur and blend layers removed) | 71 | 6.2 s | 0 | about 11 ms |
| Presets, before | 55 | 8.9 s | 0.285 | about 0 ms |
| Presets, after | 60 | 8.5 s | 0.001 | about 540 ms |

What this showed: the first version of the soft glass look (a full-screen blended grain layer and large blurred
colour layers) cost real main-thread time on a throttled phone. I removed those layers; home blocking time is back to
baseline. Home is still a few performance points below baseline under this lens (largest paint 6.2 s vs 5.0 s), so I
am not claiming a home speed gain. Presets blocking time (about 540 ms) is the next thing to look at.

**Reading it honestly:** two of the three key pages improved clearly; home did not move on speed. Lighthouse measures
speed and accessibility, not whether the design feels modern, so the rubric above is still my judgement.

## What would actually prove "60% better"

Compare before and after on the live site over two weeks of comparable traffic: pages per visit, scroll depth on the
finds and presets pages, clicks on the shop arrow, and presets page to checkout rate. Vercel Web Analytics is already
installed, so the numbers will be there once this goes live.
