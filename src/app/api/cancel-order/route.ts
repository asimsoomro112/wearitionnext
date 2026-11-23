import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase-admin';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { isValidEmail, normalizeEmail } from '@/lib/validators';

/**
 * WEARITION — Cancel Order API (server-side, email-verified).
 *
 * The old flow let anyone with an order ID cancel it (the track page
 * called updateOrderStatus with no email check), and the Firestore rule
 * denied guest cancels outright — so the button was broken for guests
 * and open to abuse for signed-in owners. Now the server verifies the
 * email against the order, requires status 'pending', and cancels +
 * restores stock atomically in a transaction. Rate-limited 10/hour per
 * IP, 5/hour per order ID.
 */
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const record = (body ?? {}) as Record<string, unknown>;
    const orderId =
      typeof record.orderId === 'string' ? record.orderId.trim() : '';
    const emailRaw = typeof record.email === 'string' ? record.email : '';

    if (!orderId || orderId.length > 100 || !isValidEmail(emailRaw)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const email = normalizeEmail(emailRaw);

    const ip = clientIp(req);
    const byIp = rateLimit(`cancel:ip:${ip}`, 10, 60 * 60 * 1000);
    if (!byIp.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byIp.retryAfterMs / 1000)) },
        },
      );
    }
    const byOrder = rateLimit(`cancel:order:${orderId}`, 5, 60 * 60 * 1000);
    if (!byOrder.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byOrder.retryAfterMs / 1000)) },
        },
      );
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Order service unavailable' }, { status: 503 });
    }

    const snap = await adminDb
      .collection('orders')
      .where('orderId', '==', orderId)
      .limit(1)
      .get();
    if (snap.empty) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const doc = snap.docs[0];
    const order = doc.data() as {
      email?: string;
      status?: string;
      items?: { id?: string; quantity?: number }[];
    };
    if (!order.email || normalizeEmail(order.email) !== email) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending orders can be cancelled' },
        { status: 400 },
      );
    }

    await adminDb.runTransaction(async (tx) => {
      const orderRef = doc.ref;
      const fresh = await tx.get(orderRef);
      if (!fresh.exists || fresh.data()?.status !== 'pending') {
        throw new Error('Order is no longer pending.');
      }
      tx.update(orderRef, { status: 'cancelled' });
      const qtyByProduct = new Map<string, number>();
      for (const item of order.items || []) {
        if (item.id && typeof item.quantity === 'number' && item.quantity > 0) {
          qtyByProduct.set(
            item.id,
            (qtyByProduct.get(item.id) || 0) + item.quantity,
          );
        }
      }
      for (const [productId, qty] of qtyByProduct) {
        tx.update(adminDb!.collection('products').doc(productId), {
          stock: admin.firestore.FieldValue.increment(qty),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[cancel-order] Error:', error);
    if (error?.message === 'Order is no longer pending.') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
