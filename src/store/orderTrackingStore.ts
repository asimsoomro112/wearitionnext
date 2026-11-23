import { create } from 'zustand';

// WEARITION — Order tracking store (API-backed, no local persistence).
//
// SECURITY (2026-11-23): the old store persisted full orders — including
// customer name, email, phone and address — in localStorage
// ('wearition-orders-v2') indefinitely, and it wrote orders + stock
// straight from the browser (client-computed prices, anonymous stock
// updates, order reads with no ownership check). All three now go
// through server routes with the Admin SDK:
//  - createOrder → POST /api/orders (catalogue prices re-verified,
//    stock decremented atomically in a transaction)
//  - getOrder    → POST /api/track-order (orderId + email, verified)
//  - cancelOrder → POST /api/cancel-order (pending-only, stock restored)
// Nothing in this store reads or writes Firestore directly, and nothing
// is persisted to browser storage (every view fetches by orderId).

export interface Order {
  id?: string;
  orderId: string;
  email: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  subtotal?: number;
  tax?: number;
  total: number;
  items: any[];
  shippingDetails?: any;
  shippingAddress?: { name: string; address: string; city: string; zip?: string; phone?: string };
  paymentMethod?: string;
  paymentScreenshot?: string | null;
  paymentStatus?: 'cod' | 'awaiting_proof' | 'proof_received' | 'confirmed';
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  createdAt?: any;
}

export interface CreateOrderInput {
  items: { id: string; quantity: number; size?: string | null; color?: string | null }[];
  email: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zip?: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentScreenshot?: string | null;
}

export interface CreateOrderResult {
  orderId: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface OrderTrackingState {
  createOrder: (input: CreateOrderInput) => Promise<CreateOrderResult>;
  getOrder: (orderId: string, email: string) => Promise<Order | undefined>;
  cancelOrder: (orderId: string, email: string) => Promise<void>;
}

async function postJson(path: string, payload: unknown): Promise<{ ok: boolean; data: any }> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  return { ok: response.ok, data };
}

export const useOrderTrackingStore = create<OrderTrackingState>()(() => ({
  createOrder: async (input) => {
    const { ok, data } = await postJson('/api/orders', input);
    if (!ok || !data?.success || !data?.orderId) {
      throw new Error(data?.error || 'Failed to place order. Please try again.');
    }
    return {
      orderId: data.orderId,
      subtotal: data.subtotal,
      shipping: data.shipping,
      tax: data.tax,
      total: data.total,
    };
  },
  getOrder: async (orderId, email) => {
    if (!orderId || !email) return undefined;
    const { ok, data } = await postJson('/api/track-order', { orderId, email });
    if (!ok || !data?.order) return undefined;
    return data.order as Order;
  },
  cancelOrder: async (orderId, email) => {
    const { ok, data } = await postJson('/api/cancel-order', { orderId, email });
    if (!ok || !data?.success) {
      throw new Error(data?.error || 'Failed to cancel order. Please try again or contact support.');
    }
  },
}));
