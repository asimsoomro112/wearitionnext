# Backend Schema — Wearition (Firestore)

> The redesign changed **zero** backend schemas. This document records the collections and fields as observed in the client code (`src/`). No migration is needed or planned.

## 1. `products`
Per `src/views/Home.tsx`, `Shop.tsx`, `ProductDetails.tsx`, `src/app/sitemap.ts`, `Checkout.tsx` (stock decrement).
- `title` (string, required) — product name, used in cards/SEO/alt text.
- `description` (string, optional) — long description, product page + SEO.
- `price` (number, required) — current selling price (PKR, formatted via `src/lib/currency.ts`).
- `salePrice` (number, optional) — strikethrough original price when on sale; drives the teal sale badge.
- `images` (string[], required-ish) — image URLs; may be Cloudinary URLs (new) or legacy `i.ibb.co` URLs (old).
- `category` (string, required) — e.g. "Men", "Shirts"; drives Shop category pills (also sourced from `settings/store.collections`).
- `brand` (string, optional) — drives `?brand=` Shop filter.
- `sizes` (string[], optional) — variant selector options on product page.
- `colors` (string[], optional) — variant selector options on product page.
- `isPublished` (boolean, required) — **the** visibility gate; every storefront query filters `where("isPublished","==",true)`.
- `isFeatured` (boolean, optional) — feeds the home hero marquee; falls back to all published products.
- `stock` (number, optional) — decremented with `increment(-qty)` at order time in `Checkout.tsx`; gates out-of-stock state.
- `createdAt` (timestamp, optional) — drives "Newest" sort.
- Indexes: single-field `isPublished` only; no composite indexes observed/needed.

## 2. `users`
Per `Checkout.tsx` (email check, address save), `authStore.ts`, admin views.
- Doc ID = Firebase Auth `uid`.
- `email` (string) — used for the "is this email registered?" checkout check.
- Profile/address fields (per code in `src/views/Checkout.tsx` and `Account.tsx`; exact field names not exhaustively audited — read those files before writing admin tooling).

## 3. `orders`
Per `Checkout.tsx` (write path), `orderTrackingStore.ts`, admin order views.
- Written client-side at checkout: items snapshot, totals, shipping address, payment method (`cod` | easypaisa | jazzcash | bank transfer), status.
- `status` field updated by admin (per `AdminOrders.tsx` patterns: `updateDoc(..., { status: newStatus })`).
- Guest orders are lookable via the tracking store (orderId-based).

## 4. `settings/store`
Per `src/views/Shop.tsx` (`doc(db, 'settings', 'store')`).
- `collections` (string[]) — category pill labels; Shop falls back to defaults if the doc/field is missing.

## 5. `settings/homepage` (probable)
`doc(db, ...)` references to a `homepage` doc exist in admin storefront code (per grep of `src/`); treat as the admin-editable homepage content doc. Exact fields not audited — see `src/views/AdminStorefront.tsx`.

## 6. `messages`
`collection(db, 'messages')` is referenced in code (contact/chat surface); fields not audited — see `src/components/AIAssistant*` / contact flows before use.

## 7. Data-layer notes
- **Client cart persistence:** the cart lives in `cartStore.ts` with zustand `persist` middleware → `localStorage`. Firestore is only touched at order placement (order write + stock decrement). No server-side cart.
- **Images:** Cloudinary is the connected host for new uploads (per owner confirmation); legacy `i.ibb.co` URLs still serve some products. `getOptimizedImage()` in `src/lib/images.ts` is currently a pass-through; `onImgError` swaps a placeholder SVG.
- **Email:** order confirmation emails via `src/lib/emailService.ts` (Gmail SMTP / EmailJS config in `.env.example`); templates in `src/lib/emailTemplates.ts`.
- **Query pattern:** storefront reads are simple `where("isPublished","==",true)` + client-side filter/sort — deliberate, avoids composite index management.
- **Rules:** Firestore security rules are the real access control (API key is public by design); rules were not changed by the redesign.
- **Do not "normalize" product docs** (e.g. splitting variants into subcollections) without a reason: the whole storefront, sitemap, admin, and checkout assume this flat shape.
