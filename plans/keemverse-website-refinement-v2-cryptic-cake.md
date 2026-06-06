# KEEMVERSE Website Refinement V2 — Plan

## Context

The current KEEMVERSE site is a single-page app using an internal `mode` state toggle to switch between Fashion and Digital Craft content. The goal is to split this into **two dedicated pages** at `/fashion` and `/digital-craft`, convert the toggle pills into real navigation links, remove the email signup section, and apply a full content and design refresh to both pages. `react-router` 7.13.0 is already installed but not yet wired up.

---

## Architecture

### Router Setup
- **`src/app/App.tsx`** becomes the router root.
  - Wraps everything in `<BrowserRouter>` (from `react-router`)
  - Defines routes: `/` → redirect to `/fashion`, `/fashion` → `<FashionPage>`, `/digital-craft` → `<DigitalCraftPage>`
  - Renders shared `<NavBar>` above the `<Routes>` outlet

### New Files to Create
| File | Purpose |
|------|---------|
| `src/app/components/NavBar.tsx` | Sticky top nav with FASHION / DIGITAL CRAFT pills using `<NavLink>` |
| `src/app/components/SocialFooter.tsx` | Shared FOLLOW KEEMVERSE section (TikTok, Instagram, Pinterest, Behance) |
| `src/app/pages/FashionPage.tsx` | Full Fashion landing page |
| `src/app/pages/DigitalCraftPage.tsx` | Full Digital Craft landing page |

### Existing Assets (all in `src/imports/`)
- `log.png` — main KEEMVERSE logo
- `flog.png` — Fashion logo
- `tlog.png` — Digital Craft logo
- `image-1.png` — editorial landscape hero photo (fashion hero)
- `image.png` — portrait crop (no longer used for portrait card; removed per new brief)

---

## Global Design Tokens
- Background: `#F5F2EA` (warm beige/cream)
- Text: `stone-900`
- Cards: `bg-white/60 backdrop-blur-sm`, `border-stone-200`, `rounded-3xl`
- Section dividers: thin `h-px bg-stone-300` with centered uppercase label
- Spacing: generous `mt-24` / `mt-32` between sections
- No dark mode

---

## NavBar (`NavBar.tsx`)

- Fixed top, centered pill switcher
- Background: `bg-white/90 backdrop-blur-md`, `rounded-full`, `shadow-lg`
- `<NavLink to="/fashion">` and `<NavLink to="/digital-craft">`
- Active pill: sliding `bg-stone-900` indicator (same CSS trick as current toggle)
- Inactive: `text-stone-500`, active: `text-white`
- Also shows `log.png` logo at far left (or centered above pills on mobile)

---

## Fashion Page (`/fashion`)

### Hero
- Full-width `image-1.png` with `aspect-ratio: 16/9` max `600px` tall, `rounded-3xl`
- Strong bottom gradient overlay (`from-stone-900/70 via-stone-900/30 to-transparent`)
- Text over image:
  - `SOFT KEEM` — small caps label, `tracking-widest`, white/60
  - `Fashion Storyteller` — large serif, white
  - `Visual Identity Explorer` — medium weight, white/80
  - `Helping people express identity, emotion, and atmosphere through style.` — body, white/70
  - `BOOK ME` button → `https://instagram.com` (opens new tab), `bg-white text-stone-900 rounded-full px-8 py-3 font-bold`

### About
- Section label: `— ABOUT —`
- H2: `Where identity meets style` (serif)
- Body (multi-line, line-break-preserved):
  ```
  I believe style is visual storytelling.
  Not trends. Not labels.
  Identity, atmosphere, and expression.
  I help people build wardrobes, campaigns, and creative worlds
  that feel unmistakably theirs.
  ```

### Stats (3 columns)
| Value | Label |
|-------|-------|
| 4+ | Years Styling |
| 500+ | Looks Curated |
| 100+ | Creative Projects |

### Work With Me (2×2 grid)
Each card: `bg-white/60 border border-stone-200 rounded-3xl p-8`

| Card | Title | Body | CTA |
|------|-------|------|-----|
| 1 | Brand Modeling & Campaign Features | Available for select fashion, lifestyle and creative campaigns. | BOOK ME → Instagram |
| 2 | Creator Collaborations & Brand Promotion | Authentic content creation and brand integration for aligned brands. | BOOK ME → Instagram |
| 3 | Wardrobe Styling & Consultation | Build a wardrobe that reflects your identity and lifestyle. | BOOK ME → Instagram |
| 4 | Creative Direction | Visual concepts, moodboards, campaigns and aesthetic systems. | BOOK ME → Instagram |

### Shop (2 products, side-by-side)
| Product | Desc | CTA |
|---------|------|-----|
| Fashion Finds | Curated discoveries, accessories and lifestyle inspirations. | SHOP NOW |
| Photo Editing Presets | Editing tools inspired by the Soft Keem aesthetic. | SHOP NOW |

Cards: centered layout, `Live` / `Soon` badges.

### Footer
`<SocialFooter />` — shared component

---

## Digital Craft Page (`/digital-craft`)

### Hero
- Dark panel: `bg-stone-900 rounded-3xl p-12 md:p-20`
- Background SVG grid (white lines, 10% opacity) — reuse existing pattern
- Accent glow: `radial-gradient` top-right
- Content:
  - Label: `DIGITAL CRAFT SPECIALIST` — mono, `tracking-[0.2em]`, stone-400
  - H1: `Bringing creative ideas to life.` — large, white, serif-mono mix
  - Subheadline: `Transforming messy graphics, low-quality artwork and production files into clean assets ready for print.`
  - `Print. Optimize. Deliver.` — spaced pills or inline bold
- Stats row (3 columns, white cards at 10% opacity):
  | Value | Label |
  |-------|-------|
  | 4+ | Years Experience |
  | 3,000+ | Assets Optimized |
  | 100% | Production Focus |
- Supporting line (small, stone-400): `Powered by Pro digital craft team, modern production workflows, AI-assisted optimization, and quality-control systems.`

### Who I Am
- Section label: `— WHO I AM —`
- Body (multi-line, preserved line breaks):
  ```
  I help creators, apparel brands, and print businesses
  solve graphics and production problems.
  From low-quality artwork and broken print files
  to complete production-ready assets.
  My focus is simple:
  Clean files. Better prints. Fewer headaches.
  ```
- Layout: centered text, max-width `2xl`

### Work With Me (3-column grid)
| Service | Title | Body |
|---------|-------|------|
| 1 | Graphics & Print Asset Creation | Custom graphics, vectors and production-ready artwork. |
| 2 | Print File Cleanup & Optimization | Fix low-quality artwork, prepare files and improve print results. |
| 3 | Creative Consultation & Support | Guidance for creators, print shops and apparel brands. |

Below grid, centered CTA buttons:
- `Hire on Upwork` → `#` (green `#14A800`)
- `View Behance` → `#` (blue `#1769FF`)

### Shop (2 products)
| Product | Desc | CTA |
|---------|------|-----|
| Printable Graphics | Ready-to-use designs for shirts, decals, stickers, cups and creative products. | SHOP NOW |
| DTF Design Packs | Specialized collections built for direct-to-film production. | SHOP NOW |

### Footer
`<SocialFooter />` — shared component

---

## SocialFooter (`SocialFooter.tsx`)
- Heading: `FOLLOW KEEMVERSE`
- 4 icon links in a row: TikTok, Instagram, Pinterest, Behance (reuse existing SVG icon components)
- Style: `w-14 h-14 rounded-2xl border border-stone-200 bg-white`
- Below icons: copyright line + `log.png` centered

---

## Custom Icon Components
Move `BehanceIcon`, `UpworkIcon`, `TikTokIcon`, `PinterestIcon` SVG components from App.tsx into a shared `src/app/components/Icons.tsx` file to avoid duplication across pages.

---

## Verification
1. `/fashion` loads the Fashion page hero with `image-1.png` and BOOK ME button
2. `/digital-craft` loads the dark hero panel with correct stats
3. Clicking FASHION / DIGITAL CRAFT nav pills routes between pages without full reload
4. `/` redirects to `/fashion`
5. No "Join the List" email field appears on either page
6. Social footer appears on both pages
7. BOOK ME buttons on Fashion page link to Instagram (new tab)
8. Upwork / Behance buttons appear on Digital Craft Work With Me section
9. Mobile layout is responsive (stacked sections, nav pills wrap cleanly)
