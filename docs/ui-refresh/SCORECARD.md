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

## Measured facts (not opinion)

| Measure | Before (live) | After (branch) |
|---|---|---|
| JS bundle, gzip | 184.0 KB | 187.3 KB (+3.2 KB) |
| CSS bundle, gzip | 22.7 KB | 24.1 KB (+1.4 KB) |
| Type checker | clean | clean |
| Horizontal overflow at 375px (home, finds, fashion) | none | none |

## What would actually prove "60% better"

Compare before and after on the live site over two weeks of comparable traffic: pages per visit, scroll depth on the
finds and presets pages, clicks on the shop arrow, and presets page to checkout rate. Vercel Web Analytics is already
installed, so the numbers will be there once this goes live.
