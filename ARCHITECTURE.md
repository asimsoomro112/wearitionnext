# WEARITION - Luxury Women's Fashion Master Architecture

This document serves as the master blueprint and generated system plan for WEARITION, the premium 2026-level ecommerce platform.

## 1. System Ecosystem & Tech Stack
- **Frontend Stack**: React 19, Next.js patterns (via React Router), Tailwind CSS (v4), Zustand (state management).
- **Animation & Visuals**: `framer-motion` (interactive physics), `gsap` (scroll triggering), `lenis` (smooth scrolling), `lucide-react` (icons).
- **Backend Infrastructure**: Express.js + Vite Server, Firebase Authentication, Firestore Database.
- **Automation/Integrations**: Telegram Bot API for inventory management.

## 2. UI/UX Direction (Apple / Balenciaga Aesthetic)
The app utilizes **Recipe 12: Luxury / Prestige** & **Recipe 4: Dark Luxury** from the AI Studio design guidelines.
- **Colors**: Monochromatic scheme (Black (`#050505`), White (`#FFFFFF`), Off-White (`#f5f2ed`)).
- **Typography**: `Cormorant Garamond` (Serif for headings/display) + `Inter` (Sans-serif for UI/Utility).
- **Layout**: Split-pane layouts, full-bleed images, visible minimal grid borders, oversized typography.
- **Interactions**: Glassmorphism (`backdrop-filter: blur`), hover-physics via Framer Motion, slow parallax via GSAP.

## 3. Database Schema (Firestore)
**`users` Collection**
- `uid` (Doc ID)
- `email`, `displayName`, `role` (user|admin), `createdAt`, `shippingAddress`

**`products` Collection**
- `id` (Doc ID)
- `title`, `description`, `price` (number), `compareAtPrice` (number)
- `images` (Array of URLs)
- `variants`: `[{ size: string, color: string, stock: number }]`
- `category` (string), `tags` (Array), `brand` (string)
- `createdAt`, `updatedAt`, `isPublished`

**`orders` Collection**
- `id` (Doc ID)
- `userId` (ref)
- `totalAmount`, `status` (pending|processing|shipped|delivered)
- `items`: `[{ productId, size, color, quantity, price }]`
- `shippingDetails`

## 4. Telegram Bot Inventory System Workflow
1. **Admin to Bot**: You upload photos of the dress to the bot via Telegram.
2. **Bot Prompt**: Bot replies asking for Title, Price, Description, Sizes.
3. **Admin Reply**: "Red Velvet Gown | 299 | Luxury winter gown | S, M, L"
4. **Backend Webhook**: Express.js `/api/telegram-webhook` processes the payload.
5. **Image Hosting**: Sends images to ImgBB and receives CDN URLs.
6. **Firestore Write**: Uses `firebase-admin` to create a new document in the `products` collection.
7. **Frontend Update**: Zustand/React query automatically synchronizes the new product instantly on the live site.

## 5. Folder Architecture
```
/src
  /components
    /ui        # Shared primitive components (Buttons, Inputs, Modals)
    /layout    # NavBar, Footer, CartDrawer
    /canvas    # Three.js 3D models (future iteration)
  /pages       # Route-level components (Home, Shop, Admin, Product Details)
  /store       # Zustand state (useCart, useAuth, useProducts)
  /lib         # Utils (cn, gsap registers)
  /services    # Firebase, Telegram APIs
```

## Next Steps
1. Firebase must be initialized in this project via the user accepting the integration terms.
2. Building the cinematic landing page with Lenis and GSAP.
3. Implementing the Express Telegram Webhook.
