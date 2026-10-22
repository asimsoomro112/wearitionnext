// Shipping pricing — the single source of truth, matching the published
// policy on the Shipping page (owner's rule, set 2026-10-22):
//   - Rs. 250 for the first suit in an order
//   - + Rs. 50 for each additional suit
//   - FREE when the suits' total (subtotal) reaches Rs. 12,500
// No tax. Checkout and the cart both price through here so they can
// never contradict each other — or the policy page — again.
export const FREE_SHIPPING_THRESHOLD = 12500;
export const BASE_SHIPPING = 250;
export const EXTRA_ITEM_SHIPPING = 50;

export function calculateShipping(subtotal: number, itemCount: number): number {
  if (itemCount <= 0 || subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return BASE_SHIPPING + EXTRA_ITEM_SHIPPING * (itemCount - 1);
}
