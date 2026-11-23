import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { isValidEmail, normalizeEmail } from '@/lib/validators';

/**
 * WEARITION — Track Order API (server-side, email-verified).
 *
 * The old flow read the order straight from Firestore with the
 * `allow get: if true` rule — anyone with an order ID (WR- + timestamp +
 * 4 random chars, enumerable) could read the full order: name, email,
 * phone, address, items, totals, payment screenshot. The track page
 * read an `email` URL param but never checked it.
 *
 * Now the server loads the order with the Admin SDK and only returns it
 * when the supplied email matches the address on the order (the same
 * 404 either way, so existence is not revealed). Rate-limited 20/hour
 * per IP, 10/hour per order ID.
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
    const byIp = rateLimit(`track:ip:${ip}`, 20, 60 * 60 * 1000);
    if (!byIp.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byIp.retryAfterMs / 1000)) },
        },
      );
    }
    const byOrder = rateLimit(`track:order:${orderId}`, 10, 60 * 60 * 1000);
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
    const order = doc.data() as { email?: string };
    if (!order.email || normalizeEmail(order.email) !== email) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: { id: doc.id, ...doc.data() },
    });
  } catch (error) {
    console.error('[track-order] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
