# Product Requirements Document — Wearition Storefront Redesign

## 1. Overview
Full visual redesign of **wearition.store**, Ahmed's Pakistani men's-fashion dropshipping store, recreating the *design language* (not code, content, or licensed assets) of the reference template `https://xodexdesign.webflow.io/` in original code. One-line value prop: a dark, cinematic, agency-grade storefront that makes a Rs. 500-margin COD business look like a luxury fashion house.

## 2. Target users
- **Primary:** Pakistani men (18–40) shopping suits/eastern wear online, paying by COD/EasyPaisa/JazzCash/bank transfer. They need trust signals, clear sizing, easy exchange, and fast WhatsApp support.
- **Secondary:** Ahmed (owner/admin) managing products, orders, and storefront content via the admin portal; organic traffic from Instagram/TikTok/WhatsApp funnels.

## 3. Goals
1. Ship the new dark cinematic look across every customer-facing route without breaking any existing functionality.
2. Keep domain (`wearition.store`) and the existing logo byte-for-byte unchanged.
3. Preserve all business logic: product catalog, variants, cart, guest + account checkout, COD/EasyPaisa/JazzCash/bank transfer, order tracking, wishlist.
4. Lift perceived trust (reviews, FAQ, policies, order tracking) to support organic conversion — no paid ads.

## 4. Functional requirements
- **FR-1** Home: hero with giant WEARITION typography + product marquee, brands marquee, bestsellers grid, parallax editorial banner, testimonials, FAQ accordion, CTA, oversized footer wordmark — all fed by real Firestore product data.
- **FR-2** Shop: category/brand/search filtering and client-side sorting (recommended, price asc/desc, newest) must keep working; product cards use the new 3:4 glass-bar design.
- **FR-3** Product detail: image gallery with lightbox/zoom, title/meta, price + sale price, size/color selectors, size guide modal, teal add-to-cart + buy-now, details/shipping/returns accordions, reviews, related products, sticky mobile CTA.
- **FR-4** Cart: dark glass slide-in drawer with quantity steppers, remove, subtotal, checkout CTA.
- **FR-5** Checkout: guest + logged-in flows, email-registered check, address form, payment method selection (COD/EasyPaisa/JazzCash/bank transfer), order placement with confirmation email and stock decrement.
- **FR-6** Account: profile, order history, wishlist, saved addresses.
- **FR-7** Order tracking: public track-by-ID page plus in-account order status.
- **FR-8** Static pages: about, contact, shipping, returns, privacy, brands, careers, editorial, sustainability — same content, unified new appearance.
- **FR-9** Admin portal (`/admin`): products, orders, users, analytics, storefront settings — functionality fully retained; visual restyle is lighter/lower-priority.
- **FR-10** SEO: per-page titles/meta/OG, sitemap including published products, product alt text, structured product data.

## 5. Non-functional requirements
- Performance: hero + first product images eager, rest lazy; no new heavy dependencies.
- Accessibility: semantic HTML, visible focus states, ≥44px touch targets, sufficient contrast on teal-on-black and white-on-teal.
- Browsers/devices: modern Chrome/Safari/Firefox; mobile-first responsive (bottom nav bar on small screens).
- Security: Firebase security rules unchanged; no secrets in client code; admin-keyed ops stay in Vercel env vars.

## 6. Out of scope
- Copying the reference template's code, text content, or licensed fonts (Bvllet/ZT Nature) — Syne/Inter are used instead.
- Changing the domain, logo, Firebase schemas, pricing, or payment providers.
- Product photo restoration from the pending Google Drive folder (separate task, blocked on the Drive link).
- Vercel project/domain transfer (separate, parked until Ahmed resumes).
- Paid ads or any publishing without Ahmed's approval.

## 7. Acceptance criteria
- Every route renders in the new theme with zero console-breaking errors; `tsc --noEmit` clean.
- Add-to-cart → checkout → order placement works end-to-end on staging data (COD test order).
- Filters/sort/search on Shop return correct results; product pages show correct variants and pricing.
- Sitemap contains all published products; product images carry descriptive alt text.
- Lighthouse: no new accessibility contrast failures vs. baseline.

## 8. Success metrics
- Bounce rate on home/product pages trends down; add-to-cart rate holds or improves vs. pre-redesign.
- Zero functionality regressions reported in the first 2 weeks post-deploy.
- Organic sessions from product SEO grow (products now in sitemap).
