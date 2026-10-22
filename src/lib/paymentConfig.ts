// WEARITION — Manual online payment configuration.
//
// Ahmed receives online payments manually on his NayaPay account (confirmed
// by him 2026-10-22: NayaPay is on his main number). Customers paying by
// EasyPaisa / JazzCash / bank transfer send to this number from their own
// app and share a screenshot as proof; Ahmed verifies in the admin portal
// and confirms. A real payment gateway replaces this flow later, once he
// opens a merchant account.
export const PAYMENT_RECEIVING = {
  accountTitle: 'Ahmed Iqbal',
  accountNumber: '0333 3744318',
  walletName: 'NayaPay',
} as const;

// Where "payment screenshot received" notifications go: the store admin
// inbox and Ahmed's own email (his instruction, 2026-10-22).
export const ADMIN_NOTIFY_EMAILS = [
  'admin@wearition.com',
  'ahmediqbal2003f9@gmail.com',
] as const;

// Store WhatsApp (same number the site-wide WhatsApp button uses) — the
// fallback channel for screenshots when an upload fails, so a customer is
// never stuck.
export const STORE_WHATSAPP_NUMBER = '923333744318';

export function paymentMethodLabel(method?: string): string {
  switch (method) {
    case 'easypaisa': return 'EasyPaisa';
    case 'jazzcash': return 'JazzCash';
    case 'bank': return 'Bank Transfer';
    case 'cod': return 'Cash on Delivery';
    default: return method || '—';
  }
}
