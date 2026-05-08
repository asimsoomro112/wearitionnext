# WEARITION - Complete Production Instructions & Continuation Prompts

The foundational core of WEARITION is successfully deployed. To continue building out the remaining modules without losing context or architectural integrity, use the following detailed implementation prompts in your future requests.

### 1. Product Detail Page (PDP) & 3D Interactive UI
**Prompt for next turn:**
> "Build the Product Detail Page (PDP) for WEARITION at `/product/:id`. Include a split-screen layout where the left side is a sticky, smooth-scrolling image gallery using Lenis, and the right side contains the product details: title, price, luxury-styled Accordions for description/shipping, size selector, and color selector. Add GSAP trigger animations when the user scrolls the page. For the 'Add to Cart' button, make it a full-width dark styled button with a hover-physics effect using Framer Motion."

### 2. Wishlist & Firebase Interactive Subcollections
**Prompt:**
> "Implement the Wishlist system. Create a `Wishlist` page at `/wishlist`. Users should authenticate via Google using Firebase. In Firestore, create a structure where Wishlist items are stored as documents under the user's document inside `/users/{userId}/wishlist/{wishlistId}`. Build a reusable `ProductCard` component that has a heart icon in the corner which toggles the Firebase write. Ensure optimistic UI updates using Zustand before the Firebase call finishes."

### 3. Shopping Cart Drawer & Checkout Flow
**Prompt:**
> "Design a sliding Cart Drawer component (`src/components/layout/CartDrawer.tsx`). Use Framer Motion for the slide-in animation from the right. It should pull the global state of the cart from Zustand. Build cart line items with quantity increment/decrement functionality, and a subtotal calculator. Add a 'Checkout securely' button that integrates a placeholder flow for Stripe."

### 4. Advanced Admin Control Portal
**Prompt:**
> "Create an Admin Dashboard at `/admin`. This should be a protected route checking for `role === 'admin'` from Firestore. The dashboard should have an Apple/Vercel-like sleek UI with a sidebar. Build an 'Orders' tab reading all orders in real-time using `onSnapshot` from Firestore, and an 'Inventory' tab where the admin can toggle `isPublished` on products and live-edit prices. Use Recharts for a small revenue line graph."

### 5. Advanced Telegram Webhook Media Upload
**Prompt:**
> "Expand the Express.js Telegram Webhook in `server.ts`. Parse Telegram messages containing a photo payload. Use axios to fetch the image from Telegram's servers `getFile` API, then POST that buffer directly to the ImgBB API to get a permanent URL. Once ImgBB returns the URL, insert it into the new Firestore product document. Include error handling for when the payload doesn't follow the format."
