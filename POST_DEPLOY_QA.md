# Post-deploy QA checklist — wearition.store (after Ahmed's deploy)

Run AFTER Ahmed confirms his friend's fix is deployed live. Read-only live
checks first, then functional. Report exact results, never claim pass without
evidence.

## 0. Confirm the deploy
- Fetch https://www.wearition.store/ and check the build marker / hero pill
  text to confirm the new code is actually live (cousin deploys outside git —
  never assume).

## 1. Homepage
- [ ] Preloader finishes (~800ms), no stuck loader, no console errors.
- [ ] Hero: giant WEARITION wordmark fully visible, NOT clipped — desktop
      (1440px) AND mobile (390px).
- [ ] Hero roller: product cards render with real images, curved 3D loop
      animates, cards approach then continue (no flat/jerky motion).
- [ ] "Most loved right now": section header + 8 product cards visible, each
      with image, name, category, price. No empty black space.
- [ ] No fake content: no testimonials, no "X people viewing", no purchase
      popups, no "100% Authentic" badge, no "Delivers by {date}" promise.
- [ ] "Easy Returns · 3 days policy" badge — only if Ahmed confirmed it is
      his real policy.

## 2. Shop page (/shop)
- [ ] Grid loads with skeletons then products; filters/search work.
- [ ] Moving WEARITION outline backdrop present, no horizontal overflow on
      desktop or mobile.

## 3. Product page (/product/[id])
- [ ] Title is an h1; images load; price/stock correct.
- [ ] Add to bag + wishlist work; no fake reviews tab, no rating stars.

## 4. Cart + checkout
- [ ] Guest checkout completes to order-success; COD / EasyPaisa / JazzCash /
      bank transfer options present; no console errors.

## 5. SEO (every run — standing requirement)
- [ ] Root title + meta description + OG/Twitter tags server-rendered.
- [ ] /sitemap.xml includes /product/{id} URLs (not just 7 static routes).
- [ ] Product images have real alt text (never "undefined").
- [ ] /checkout, /order-success, /account, /admin not indexable.
- [ ] PDP generateMetadata sets per-product title/description/OG.

## 6. Mobile pass (390px)
- [ ] No horizontal scroll anywhere; wordmark fits; tap targets reachable.

## Method
- Live-browser inspection (read-only) + curl for sitemap/robots/meta.
- Local: npx tsc --noEmit, npm run build, eslint on changed files.
- Screenshots of hero + bestsellers attached as evidence.
