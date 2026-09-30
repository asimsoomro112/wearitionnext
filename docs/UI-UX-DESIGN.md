# UI/UX Design Document — Wearition Storefront Redesign

## 1. Design intent
**ONE mood: dark, cinematic luxury.** The reference is a motion-studio portfolio; its visual language is adapted to a working Pakistani menswear shop. The feeling: walking into a high-end fashion house at night — near-black rooms, one teal spotlight, oversized typography. Built for Ahmed's customer: a young Pakistani man who should feel he's buying premium, while every trust signal (reviews, COD, easy exchange, tracking) stays one tap away.

## 2. Design system
- **Palette:** `--bg: #030303` (near-black) · `--fg: #fafafa` (text) · `--accent: #339e9b` (teal) · `--accent-hover` (deeper teal) · `--accent-glow: rgba(51,158,155,0.35)` (restrained glow, never neon). Light theme exists via `data-theme="light"` but dark is default and canonical.
- **Typography:** **Syne** (display, `font-display`) — extrabold uppercase, tight tracking, used for hero, section titles, prices-as-statements. **Inter** (body, `font-sans`) — everything else. The reference template's licensed faces (Bvllet/ZT Nature) were **not** copied.
- **Signature motifs (repeated everywhere):** giant bleeding typography (hero WEARITION, footer wordmark, CTA backdrop) · infinite marquees (hero product strip, brands) · glass cards/pills (`--glass-bg` + `--glass-border` + backdrop blur) · bracketed section numbers (`[01]`, `[02]`, …) as eyebrows · small uppercase tracked labels (`eyebrow` utility).
- **Spacing/radius/shadow:** generous vertical rhythm (`py-24 md:py-36` sections); cards `rounded-xl/2xl`; buttons `rounded-xl` pill-ish; shadows are teal glows on primary CTAs, soft black on cards. White contrast cards (`bg-[#fafafa] text-black`) punctuate the dark, per the reference.

## 3. Information architecture
Routes (all under `src/app/`): `/` home · `/shop` (filters/sort/search) · `/product/[id]` · `/checkout` · `/order-success` · `/track-order` · `/account` · `/wishlist` · `/brands` · `/about` · `/contact` · `/shipping` · `/returns` · `/privacy` · `/careers` · `/editorial` · `/sustainability` · `/admin/*` (portal). Navigation: fixed `mix-blend-difference` navbar (logo left, search/account/wishlist/cart icons right, hamburger opens full-screen animated menu overlay); mobile bottom bar on small screens; footer with link columns + socials + giant wordmark.

## 4. Key screens & interactions
- **Navbar** (`Navbar.tsx`): fixed, difference-blend so it inverts over any content; full-screen menu overlay with staggered link reveals; theme toggle moved inside the overlay; search opens `SearchOverlay`.
- **HomeHero**: giant `WEARITION` display type, product-image marquee beneath, huge outline `STYLE` backdrop, glass badge, primary (teal) + secondary (ghost) CTAs, scroll indicator. Falls back to curated Unsplash images when no featured products exist.
- **BrandsMarquee**: brand names in large display type scrolling infinitely, teal dot separators, edge fade mask.
- **Bestsellers**: `[01]` eyebrow + display title + first 8 published products in the new `ProductCard` grid.
- **ParallaxBanner**: full-bleed rounded image with scroll-driven scale/translate and centered display headline.
- **Testimonials**: 4.9/5 stat card (white) + auto-rotating review slider (white card, teal stars/quote), dot navigation.
- **Faq**: two-column accordion, plus-icon rotates 45° when open, teal active state.
- **Cta**: giant outline `Wearition` backdrop + centered headline + white pill CTA (turns teal on hover).
- **Footer**: dark gradient, link columns, socials, newsletter-less (kept simple), giant bleeding `Wearition` wordmark.
- **ProductCard**: 3:4 image, teal sale badge, wishlist heart, glass bottom bar (name/category/price), hover reveals blurred overlay + arrow; image error fallback.
- **Shop**: bracketed header, category pills (active = teal + glow), sort bar, 2-col mobile / 4-col desktop grid, skeleton loaders, empty state.
- **ProductDetails**: breadcrumb, left gallery (parallax first image, lightbox zoom), right sticky info column (brand eyebrow, viewers badge, display title, rating, price block, size/color selectors, size-guide modal, teal add-to-cart + buy-now, trust icons, accordions, reviews, related). Sticky mobile CTA preserved.
- **CartDrawer**: glass drawer (`bg-[#0a0a0a]/85 backdrop-blur-2xl`), bracketed title, qty steppers, teal checkout CTA.
- **Motion signature:** framer-motion reveals (`whileInView`, ease `[0.16,1,0.3,1]`), marquees via CSS keyframes, parallax via `useScroll`/`useTransform`. No page-load spinners beyond the initial `WearitionSpinner`.

## 5. Accessibility
Semantic landmarks (`header`/`main`/`footer`, real `<button>`s); focus-visible states on interactive elements; icon buttons carry `aria-label`s; form inputs labeled; contrast: white on `#030303`, white on teal `#339e9b` (large/bold UI text — body copy on teal avoided); touch targets ≥44px (pills, steppers, nav icons).

## 6. Responsive behavior
- `<640px`: 2-col product grids, hamburger menu overlay, mobile bottom bar, stacked hero type (clamp), sticky mobile buy CTA on product page.
- `640–1024px`: grids widen, FAQ stays 1-col until md.
- `>1024px`: 4-col grids, side-by-side product gallery/info, full footer columns.
- Hero type uses `clamp()` so it bleeds correctly at every width; no horizontal scroll.

## 7. UX principles applied
- **Progressive disclosure:** product accordions, FAQ accordion, size-guide modal, menu overlay.
- **Empty states that teach:** empty cart → "Continue Shopping" CTA; no products → "Coming Soon" + clear-filters.
- **Forgiving inputs:** image error fallbacks everywhere; search tolerates partial matches.
- **Trust before transaction:** viewers badge, verified reviews, COD/EasyPaisa options, 7-day exchange copy, track-order link — all above the fold on product/checkout.
- **Consistency over decoration:** one accent, two fonts, one card language, one motion ease — applied identically on every route.
