/**
 * WEARITION — Email Service (typed, server-built)
 *
 * The client no longer builds or addresses emails: it only tells the
 * server WHICH email to send (by orderId) and the server loads the order
 * from Firestore and builds the message from the fixed templates. The
 * recipient is always the address on file.
 *
 * The old core — client-built { to, subject, html } posted to
 * /api/send-email — was an open mail relay (live-verified 2026-11-23).
 * The EmailJS fallback carried the same arbitrary content through its
 * template params, and the console.log fallback logged the recipient
 * and subject (PII in logs). All three are gone. A failed send returns
 * false and never affects the order flow (all callers are fire-and-forget).
 */

async function postEmail(
  type: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, ...payload }),
    });
    if (!response.ok) return false;
    const data = await response.json().catch(() => null);
    return data?.success === true;
  } catch {
    return false;
  }
}

/**
 * Send order confirmation email with full order details.
 * The server loads the order by orderId and builds the email from the
 * record — the totals/items passed here are kept for caller compatibility
 * and are not trusted by the server.
 */
export async function sendOrderConfirmationEmail(data: {
  email: string;
  name: string;
  orderId: string;
  items: { title: string; quantity: number; price: number; size?: string; color?: string; image?: string }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: { name: string; address: string; city: string };
}): Promise<boolean> {
  return postEmail('order-confirmation', { orderId: data.orderId });
}

/**
 * Send order status update email (processing, shipped, delivered, cancelled).
 */
export async function sendOrderStatusEmail(data: {
  email: string;
  name: string;
  orderId: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
}): Promise<boolean> {
  return postEmail('order-status', {
    orderId: data.orderId,
    status: data.status,
    trackingNumber: data.trackingNumber,
    courierName: data.courierName,
    estimatedDelivery: data.estimatedDelivery,
  });
}

/**
 * Notify the store admin + owner that a customer shared a payment
 * screenshot for a manual online-payment order (verify + confirm from the
 * admin portal). Fire-and-forget by design — a mail failure must never
 * affect the customer's order.
 */
export async function sendPaymentProofNotification(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  total: number;
  screenshotUrl: string;
}): Promise<void> {
  try {
    // The server rebuilds the notification from the order record, so only
    // the orderId is sent (the rest is kept in the signature for the caller).
    await postEmail('payment-proof', { orderId: data.orderId });
  } catch (error) {
    console.error('[Email] Payment proof notification failed:', error);
  }
}
