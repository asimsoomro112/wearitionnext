import { randomInt } from 'node:crypto';
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { verifyIdToken } from '@/lib/adminAuth';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { isValidEmail, normalizeEmail } from '@/lib/validators';
import { calculateShipping } from '@/lib/shipping';
import { calculateCustomerTax, calculateStoreAbsorbedTax } from '@/lib/tax';

/**
 * WEARITION — Create Order API (server-side).
 *
 * The old flow created the order from the browser with client-computed
 * prices/totals and decremented stock through an anonymous Firestore
 * rule — anyone could place an order with arbitrary prices (a Rs. 5,000
 * suit at a Rs. 100 total, paid COD) and anyone could set any product's
 * stock to any value. Now the server loads each product from the
 * catalogue, re-verifies it is published and in stock, recomputes
 * subtotal/shipping/tax/total from the catalogue prices, and creates
 * the order + decrements stock atomically in a transaction. The client
 * only sends product IDs, quantities, size/colour, the shipping address
 * and the payment method. Rate-limited 10/hour per IP and per email.
 * Max 20 lines, max 10 units per line (the cart enforces the same).
 */

const PAYMENT_METHODS = ['cod', 'easypaisa', 'jazzcash', 'bank'] as const;
const MAX_LINES = 20;
const MAX_QTY = 10;

interface OrderLine {
  id: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
}

function isLine(value: unknown): value is OrderLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as Record<string, unknown>;
  if (typeof line.id !== 'string' || !line.id.trim() || line.id.length > 100) {
    return false;
  }
  if (
    typeof line.quantity !== 'number' ||
    !Number.isInteger(line.quantity) ||
    line.quantity < 1 ||
    line.quantity > MAX_QTY
  ) {
    return false;
  }
  for (const key of ['size', 'color'] as const) {
    const v = line[key];
    if (v !== undefined && v !== null && (typeof v !== 'string' || v.length > 100)) {
      return false;
    }
  }
  return true;
}

function textField(value: unknown, max: number, required: boolean): string | null {
  if (value === undefined || value === null || value === '') {
    return required ? null : '';
  }
  if (typeof value !== 'string' || value.length > max) return null;
  const trimmed = value.trim();
  if (required && !trimmed) return null;
  return trimmed;
}

function tooManyRequests(retryAfterMs: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    },
  );
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const record = (body ?? {}) as Record<string, unknown>;

    const emailRaw = typeof record.email === 'string' ? record.email : '';
    const paymentMethod =
      typeof record.paymentMethod === 'string' ? record.paymentMethod : '';
    const itemsRaw = record.items;
    const addressRaw = record.shippingAddress;
    const screenshotRaw = record.paymentScreenshot;

    if (!isValidEmail(emailRaw)) {
      return NextResponse.json(
        { error: 'A valid email address is required' },
        { status: 400 },
      );
    }
    const email = normalizeEmail(emailRaw);

    if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'A valid payment method is required' },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(itemsRaw) ||
      itemsRaw.length === 0 ||
      itemsRaw.length > MAX_LINES ||
      !itemsRaw.every(isLine)
    ) {
      return NextResponse.json(
        { error: 'A valid order needs 1–20 items, max 10 units each' },
        { status: 400 },
      );
    }
    const items = itemsRaw as OrderLine[];

    if (!addressRaw || typeof addressRaw !== 'object') {
      return NextResponse.json(
        { error: 'A valid shipping address is required' },
        { status: 400 },
      );
    }
    const address = addressRaw as Record<string, unknown>;
    const firstName = textField(address.firstName, 200, true);
    const lastName = textField(address.lastName, 200, false);
    const street = textField(address.address, 500, true);
    const city = textField(address.city, 200, true);
    const zip = textField(address.zip, 30, false);
    const phone = textField(address.phone, 30, false);
    if (firstName === null || street === null || city === null) {
      return NextResponse.json(
        { error: 'Name, address and city are required' },
        { status: 400 },
      );
    }

    let paymentScreenshot: string | null = null;
    if (screenshotRaw !== undefined && screenshotRaw !== null && screenshotRaw !== '') {
      if (
        typeof screenshotRaw !== 'string' ||
        screenshotRaw.length > 500 ||
        !screenshotRaw.startsWith('https://res.cloudinary.com/')
      ) {
        return NextResponse.json(
          { error: 'Invalid payment screenshot' },
          { status: 400 },
        );
      }
      paymentScreenshot = screenshotRaw;
    }

    const ip = clientIp(req);
    const byIp = rateLimit(`orders:ip:${ip}`, 10, 60 * 60 * 1000);
    if (!byIp.allowed) return tooManyRequests(byIp.retryAfterMs);
    const byEmail = rateLimit(`orders:email:${email}`, 10, 60 * 60 * 1000);
    if (!byEmail.allowed) return tooManyRequests(byEmail.retryAfterMs);

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Order service unavailable' },
        { status: 503 },
      );
    }

    // Signed-in customers keep their uid on the order (My Orders); guests
    // get 'guest'. A bad/missing token only affects that link, never the
    // pricing — the money-critical parts are all server-verified.
    let userId = 'guest';
    if (adminAuth) {
      const user = await verifyIdToken(req);
      if (user) userId = user.uid;
    }

    // Aggregate quantities per product (the same suit can appear on two
    // lines, e.g. two sizes) so stock is checked and decremented once.
    const qtyByProduct = new Map<string, number>();
    for (const line of items) {
      qtyByProduct.set(line.id, (qtyByProduct.get(line.id) || 0) + line.quantity);
    }

    const orderId =
      'WR-' +
      Date.now().toString(36).toUpperCase() +
      '-' +
      randomInt(0, 36 ** 4)
        .toString(36)
        .toUpperCase()
        .padStart(4, '0');

    const result = await adminDb.runTransaction(async (tx) => {
      // Load every product inside the transaction and price from the
      // catalogue — never from the client's numbers.
      const catalogue = new Map<
        string,
        { title: string; price: number; image: string }
      >();
      for (const [productId, qty] of qtyByProduct) {
        const ref = adminDb!.collection('products').doc(productId);
        const snap = await tx.get(ref);
        if (!snap.exists) {
          throw new Error('A product in your order is no longer available.');
        }
        const data = snap.data() as {
          title?: string;
          price?: number;
          stock?: number;
          isPublished?: boolean;
          images?: string[];
        };
        if (data.isPublished !== true) {
          throw new Error(
            `“${data.title || 'A product'}” is no longer available.`,
          );
        }
        const stock = typeof data.stock === 'number' ? data.stock : 0;
        if (stock < qty) {
          throw new Error(
            `“${data.title || 'A product'}” is out of stock (only ${stock} left).`,
          );
        }
        if (typeof data.price !== 'number' || !(data.price > 0)) {
          throw new Error('A product in your order has no valid price.');
        }
        catalogue.set(productId, {
          title: data.title || 'WEARITION suit',
          price: data.price,
          image: data.images?.[0] || '',
        });
      }

      const orderItems = items.map((line) => {
        const product = catalogue.get(line.id)!;
        return {
          id: line.id,
          title: product.title,
          price: product.price,
          quantity: line.quantity,
          size: line.size || null,
          color: line.color || null,
          image: product.image,
        };
      });
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);
      const shippingCost = calculateShipping(subtotal, itemCount);
      const taxAmount = calculateCustomerTax(subtotal, paymentMethod);
      const taxAbsorbedByStore = calculateStoreAbsorbedTax(subtotal, paymentMethod);
      const total = subtotal + shippingCost + taxAmount;

      const orderData = {
        orderId,
        email,
        userId,
        status: 'pending' as const,
        date: new Date().toISOString(),
        subtotal,
        tax: taxAmount,
        total,
        items: orderItems,
        paymentMethod,
        paymentScreenshot,
        paymentStatus:
          paymentMethod === 'cod'
            ? 'cod'
            : paymentScreenshot
              ? 'proof_received'
              : 'awaiting_proof',
        shippingAddress: {
          name: `${firstName} ${lastName || ''}`.trim(),
          address: street,
          city,
          zip: zip || '',
          phone: phone || '',
        },
        shippingDetails: {
          shippingAmount: shippingCost,
          taxAmount,
          taxAbsorbedByStore,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Create the order and decrement stock atomically. Doc ID == orderId,
      // matching the old client convention (AdminOrders uses doc.id).
      tx.set(adminDb!.collection('orders').doc(orderId), orderData);
      for (const [productId, qty] of qtyByProduct) {
        tx.update(adminDb!.collection('products').doc(productId), {
          stock: admin.firestore.FieldValue.increment(-qty),
        });
      }

      return { subtotal, shipping: shippingCost, tax: taxAmount, total };
    });

    return NextResponse.json({
      success: true,
      orderId,
      subtotal: result.subtotal,
      shipping: result.shipping,
      tax: result.tax,
      total: result.total,
    });
  } catch (error: any) {
    console.error('[orders] Error:', error);
    // User-facing stock/availability errors are thrown with a clear
    // message; everything else is a generic failure.
    if (error?.message && typeof error.message === 'string') {
      const msg: string = error.message;
      if (
        msg.includes('no longer available') ||
        msg.includes('out of stock') ||
        msg.includes('no valid price')
      ) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }
    return NextResponse.json(
      { error: 'Failed to place order. Please try again.' },
      { status: 500 },
    );
  }
}
