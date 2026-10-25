// Government tax on Wearition orders (owner's rule, set 2026-10-25):
// The government rate is 4% of the suits' total (subtotal — never on
// delivery). The CUSTOMER pays 3% of that total, and only on Cash on
// Delivery. Advance payment (bank transfer, EasyPaisa, JazzCash) waives
// the tax entirely (0%). The remaining 1% is absorbed by the store and
// is never charged to the customer, so it never enters an order total.
export const GOV_TAX_RATE = 0.04;
export const CUSTOMER_TAX_RATE = 0.03;
export const STORE_ABSORBED_TAX_RATE = 0.01;

// What the customer pays as tax on this order, rounded to the rupee.
export function calculateCustomerTax(subtotal: number, paymentMethod: string): number {
  if (paymentMethod === 'cod' && subtotal > 0) return Math.round(subtotal * CUSTOMER_TAX_RATE);
  return 0;
}

// The store's share of the government tax — bookkeeping only, never charged.
export function calculateStoreAbsorbedTax(subtotal: number, paymentMethod: string): number {
  if (paymentMethod === 'cod' && subtotal > 0) return Math.round(subtotal * STORE_ABSORBED_TAX_RATE);
  return 0;
}
