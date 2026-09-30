# Technical Requirements Document — Wearition Storefront Redesign

## 1. Architecture
- **App Router** (`src/app/`): one route dir per page (`shop`, `product/[id]`, `checkout`, `account`, `admin`, …), each rendering a view from `src/views/`. Keeps routing declarative and colocated with SEO metadata.
- **Views** (`src/views/*.tsx`): page-level client components holding data-fetching + composition. Client-side Firestore reads keep the static export simple; no server components were introduced by the redesign.
- **Components** (`src/components/`): `layout/` (Navbar, Footer, CartDrawer, ClientShell…), `home/` (new: HomeHero, Marquee, BrandsMarquee, Bestsellers, ParallaxBanner, Testimonials, Faq, Cta, SectionHeader), `shop/` (ProductCard).
- **State** (zustand): `cartStore` (persisted to localStorage), `authStore` (Firebase Auth session), `wishlistStore`, `uiStore` (cart/search/menu drawers, theme), `orderTrackingStore` (guest order lookup). Chosen over Context to avoid prop-drilling and re-render churn.
- **Data flow:** components → Firebase client SDK → Firestore; cart writes also decrement product `stock` via `increment(-qty)` at order time (per `src/views/Checkout.tsx`).

## 2. Tech stack
- **Next.js 16.2.6** (App Router, Turbopack dev) — the existing framework; kept.
- **TypeScript** — `tsc --noEmit` clean after redesign.
- **Tailwind CSS v4** — CSS-first config; design tokens live in `src/app/globals.css` (`--bg`, `--fg`, `--accent`, `--accent-hover`, `--accent-glow`, `--glass-bg/border`). No tailwind.config needed.
- **framer-motion** — hero reveals, marquees, accordions, drawer transitions, scroll parallax. Already a dependency; no alternative evaluated.
- **lucide-react** — icons throughout. Already a dependency.
- **Firebase JS SDK** (`src/lib/firebase.ts`) — Auth + Firestore client. No Admin SDK in client bundle (`firebase-admin.ts` exists for server-side/API routes only).
- **zustand + persist middleware** — client stores; cart survives reloads via localStorage.
- **sonner** — toast notifications (add-to-cart, order placed, errors).
- **next/font/google** — Syne (display) + Inter (body), self-hosted at build.
- **No new dependencies were added for the redesign.** (Bundle cost: zero new.)

## 3. API contract
No REST API was added. Client talks directly to Firestore via the SDK; the existing `src/app/api/` routes are unchanged. Order placement = Firestore `orders` doc write + `users/{uid}` merge + product `stock` decrement, all client-side inside `Checkout.tsx` (relies on Firestore security rules; unchanged by redesign).

## 4. Data layer
- **Firestore** (existing project, configured in Vercel env). Client SDK with `experimentalForceLongPolling` (per `src/lib/firebase.ts`).
- **Images:** Cloudinary is the connected host for new uploads; legacy product images still serve from `i.ibb.co` (remote patterns whitelisted in `next.config.ts`).
- **Indexing:** single-field `where("isPublished","==",true)` queries only; no composite indexes required. Client-side filtering/sorting on Shop avoids index needs.
- **Migration:** none — schemas untouched.

## 5. Security requirements
- Firebase API key is public-by-design (client SDK); real protection is Firestore security rules — not modified here.
- No secrets in the repo: `.env*` gitignored; local dev uses dummy `.env.local` (visual QA only, never committed).
- Admin-keyed operations stay in Vercel env vars; Ahmed runs sensitive ops from his own machine (standing convention).
- Checkout validates email format client-side; server-side validation deferred to Firestore rules.

## 6. Performance & SEO
- Images: `next/image` remote patterns for `i.ibb.co`, `ibb.co`, `images.unsplash.com`; hero/first images eager, rest lazy. ProductCard uses plain `<img>` with `loading="lazy"` + error fallback (kept from original).
- Fonts via `next/font` (no render-blocking Google Fonts link; `globals.css` also imports Google Fonts — dedupe noted as cleanup).
- SEO: `SEO` component per page (title/description/OG/Twitter), `src/app/sitemap.ts` includes all published products (lazy Firebase import), robots config in layout metadata.
- Budget: no formal budget set; redesign added no new JS weight.

## 7. Deployment
- **Current:** Vercel project in Ahmed's cousin's account; Firebase + Cloudinary env already configured there (confirmed by Ahmed). Deploy = Vercel git integration (push to trigger) — **no push/deploy without Ahmed's explicit approval.**
- **Pipeline (recommended):** lint → `tsc --noEmit` → `next build` → preview deploy → manual QA checklist → production.
- **Known local-only issue:** `next build` fails during page-data collection for `/product/[id]` with `auth/invalid-api-key` because local Firebase env is absent — not a production defect; production builds on Vercel with real env.
- **Rollback:** Vercel instant rollback to previous deployment; git revert on `main`.

## 8. Testing strategy
- **Unit:** none exist; business logic (cart math in `cartStore`, currency formatting) is small and manually verified.
- **Integration:** manual end-to-end pass per release: home → shop filter/sort → product variants → add-to-cart → drawer qty → checkout (COD test order) → track-order.
- **Manual checklist (per change):** responsive (375px/768px/1440px), keyboard focus visible, 44px touch targets, alt text present, sitemap includes new products, no console errors, teal/white contrast on buttons.
- **Debt:** add automated tests for cart totals + checkout validation before the next feature sprint.
