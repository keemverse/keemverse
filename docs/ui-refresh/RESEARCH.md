# Research notes (15 Oct 2026)

Method: three web searches plus a read of the brand guide and a visual audit of every main page. Most sources are
agency and vendor blogs, so figures such as "micro-interactions lift add-to-cart 8 to 14 percent" are claims, not
independent evidence. I used the research for direction only, and the scorecard avoids borrowing those numbers.

## 1. Brand guide (Identity System v4)

- Traits: cinematic, minimal, editorial, soft-tech, crafted.
- Typeface: **Satoshi Medium** primary, **Satoshi Light** secondary. Alternatives: General Sans, Neue Montreal,
  Helvetica Neue, Inter.
- The site used Georgia everywhere, which is the single biggest "old school" signal and a brand-guide miss.

## 2. Ecommerce and fashion design direction (2026)

Themes that repeat across sources, and what I did with them:

| Pattern | Source type | Applied as |
|---|---|---|
| Product images that zoom or reveal on hover, with feedback on every action | Theme vendors, agencies | Card lift, image push-in, press feedback |
| Mobile first: full-width cards, big tap targets, clear price, thumb-zone controls | Theme guides | 40px round shop button, chips that scroll sideways, sticky category bar |
| Sticky navigation and sticky key actions | Theme guides | Sticky frosted nav and sticky category bar |
| Scroll storytelling, used sparingly | Agencies (some caution against overuse) | Scroll reveal only; no scroll-jacking |
| Performance treated as part of design | Guides | About +3 KB gzip JS and +1.4 KB CSS in total; skeletons shaped like content |

Open question the sources do not answer: whether bottom navigation beats a top menu for a small catalogue like this.
See decision 2 in the README.

## 3. Browser support for motion features (disputed across sources)

- Scroll-driven animations (`animation-timeline: view()`): Chrome and Edge 115+, Safari recent; Firefox unclear. Used
  only as progressive enhancement inside `@supports`, so unsupported browsers just show content.
- Same-document View Transitions are broadly supported; cross-document is uneven. Not used: the site is a
  single-page app and route changes use a plain opacity fade.
- Check MDN or caniuse before leaning on either feature further.

## 4. Preset sales pages

- Buyers cannot try a preset before paying, so previews carry the sale (seller guides).
- Guidance: same-framed before/after pairs, touch-friendly handle, labelled sides, 5 to 12 pairs across scenarios,
  match the niche, an install guide, labelled platform variants.
- Applied: a drag and keyboard accessible before/after slider in the preset popup. Needs your real photo pairs.
- Not applied: pricing anchors and bundles (a pricing decision, yours).

## 5. What the audit found on the old site

- Georgia headings against a Satoshi brand guide.
- Most internal links were plain anchors, so every click reloaded the page.
- Category filter was a 110px dropdown; "no results" used an emoji; skeletons were grey blocks.
- Tag text on cards was 7px.
- The menu did not close on outside tap; the nav was not sticky; pages could open mid-scroll after navigation.
- Home ended after two cards, so there was no hook for scrolling.

## Sources

- [9 stand-out ecommerce design trends of 2026](https://www.designstudiouiux.com/blog/ecommerce-web-design-trends/)
- [7 ecommerce design trends in 2026](https://halothemes.net/blogs/shopify/7-ecommerce-design-trends-in-2026-that-will-dominate-online-shopping)
- [Ecommerce web design trends 2026 that drive DTC conversions](https://redefineweb.com/blog/ecommerce-web-design-trends-2026-that-drive-conversions/)
- [CSS scroll-driven animations without JavaScript](https://ics.media/en/entry/230718/)
- [CSS view transitions: the complete guide for 2026](https://devtoolbox.dedyn.io/blog/css-view-transitions-complete-guide)
- [How to sell Lightroom presets online](https://www.sendowl.com/blog/tips-and-advice/how-to-sell-lightroom-presets)
- [Selling Lightroom presets: a step-by-step guide](https://www.photoworkout.com/selling-lightroom-presets)
