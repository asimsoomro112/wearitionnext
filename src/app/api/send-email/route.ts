import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { escapeHtml, isMailConfigured, sendMail } from '@/lib/mailer';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { isValidEmail, normalizeEmail } from '@/lib/validators';
import {
  orderPlacedEmail,
  orderStatusEmail,
  paymentProofEmail,
} from '@/lib/emailTemplates';
import { ADMIN_NOTIFY_EMAILS, paymentMethodLabel } from '@/lib/paymentConfig';

/**
 * WEARITION — Email Delivery API (typed, server-built).
 *
 * The old version accepted an arbitrary { to, subject, html } and sent it
 * via the store's Gmail — an open mail relay, live-verified 2026-11-23
 * (anyone could send any mail from WEARITION's Gmail). It now accepts
 * only a typed request; the server loads the order from Firestore with
 * the Admin SDK and builds the email from the fixed templates. The
 * recipient is always the address on file (or the fixed admin inbox) —
 * never a caller-supplied address. No "mock: true" success: when Gmail
 * is not configured the route answers 503.
 *
 * Types:
 *  - contact:           { name, email, message } → store inbox
 *  - order-confirmation:{ orderId } → orderPlacedEmail to the customer
 *  - order-status:      { orderId, status, trackingNumber?, courierName?,
 *                         estimatedDelivery? } → orderStatusEmail
 *  - payment-proof:     { orderId } → paymentProofEmail to the admins
 */

const CONTACT_INBOX = 'wearition.80@gmail.com';
const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

interface OrderDoc {
  orderId: string;
  email: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  items: {
    title: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    image?: string;
  }[];
  paymentMethod: string;
  paymentScreenshot?: string | null;
  shippingAddress: { name: string; address: string; city: string };
  shippingDetails?: { shippingAmount?: number; taxAmount?: number };
}

async function getOrderByOrderId(orderId: string): Promise<OrderDoc | null> {
  if (!adminDb) return null;
  const snap = await adminDb
    .collection('orders')
    .where('orderId', '==', orderId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as OrderDoc;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'Valued Customer';
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

function mailUnavailable() {
  return NextResponse.json(
    { error: 'Email service unavailable' },
    { status: 503 },
  );
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const record = (body ?? {}) as Record<string, unknown>;
    const type = record.type;
    const ip = clientIp(req);

    const byIp = rateLimit(`send-email:ip:${ip}`, 30, 60 * 60 * 1000);
    if (!byIp.allowed) return tooManyRequests(byIp.retryAfterMs);

    if (!isMailConfigured()) return mailUnavailable();

    // ── Contact form → fixed store inbox, fields HTML-escaped ──
    if (type === 'contact') {
      const name = typeof record.name === 'string' ? record.name.trim() : '';
      const emailRaw = typeof record.email === 'string' ? record.email : '';
      const message = typeof record.message === 'string' ? record.message : '';
      if (!name || name.length > 100 || !isValidEmail(emailRaw)) {
        return NextResponse.json(
          { error: 'Valid name and email are required' },
          { status: 400 },
        );
      }
      if (!message.trim() || message.length > 5000) {
        return NextResponse.json(
          { error: 'Message is required (max 5000 characters)' },
          { status: 400 },
        );
      }
      const email = normalizeEmail(emailRaw);
      const byEmail = rateLimit(`send-email:contact:${email}`, 3, 60 * 60 * 1000);
      if (!byEmail.allowed) return tooManyRequests(byEmail.retryAfterMs);

      const sent = await sendMail({
        to: CONTACT_INBOX,
        subject: `New Contact Message from ${name}`,
        html:
          `<h2>New Contact Form Submission</h2>` +
          `<p><strong>Name:</strong> ${escapeHtml(name)}</p>` +
          `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` +
          `<p><strong>Message:</strong></p>` +
          `<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
      });
      if (!sent) return mailUnavailable();
      return NextResponse.json({ success: true });
    }

    // ── Order emails: the order is loaded server-side; the recipient is
    // the address on file, never a caller-supplied address. ──
    if (
      type === 'order-confirmation' ||
      type === 'order-status' ||
      type === 'payment-proof'
    ) {
      const orderId =
        typeof record.orderId === 'string' ? record.orderId.trim() : '';
      if (!orderId || orderId.length > 100) {
        return NextResponse.json(
          { error: 'Valid orderId is required' },
          { status: 400 },
        );
      }
      const byOrder = rateLimit(`send-email:order:${orderId}`, 5, 60 * 60 * 1000);
      if (!byOrder.allowed) return tooManyRequests(byOrder.retryAfterMs);

      const order = await getOrderByOrderId(orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (type === 'order-confirmation') {
        const template = orderPlacedEmail({
          name: firstName(order.shippingAddress?.name || ''),
          email: order.email,
          orderId: order.orderId,
          items: order.items || [],
          subtotal: order.subtotal || 0,
          shipping: order.shippingDetails?.shippingAmount || 0,
          tax: order.tax || order.shippingDetails?.taxAmount || 0,
          total: order.total || 0,
          shippingAddress: {
            name: order.shippingAddress?.name || '',
            address: order.shippingAddress?.address || '',
            city: order.shippingAddress?.city || '',
          },
        });
        const sent = await sendMail({
          to: order.email,
          subject: template.subject,
          html: template.html,
        });
        if (!sent) return mailUnavailable();
        return NextResponse.json({ success: true });
      }

      if (type === 'order-status') {
        const status = record.status;
        if (
          typeof status !== 'string' ||
          !(ORDER_STATUSES as readonly string[]).includes(status)
        ) {
          return NextResponse.json(
            { error: 'Valid status is required' },
            { status: 400 },
          );
        }
        const text = (v: unknown) =>
          typeof v === 'string' ? v.slice(0, 200) : undefined;
        const template = orderStatusEmail({
          name: firstName(order.shippingAddress?.name || ''),
          email: order.email,
          orderId: order.orderId,
          status: status as OrderStatus,
          trackingNumber: text(record.trackingNumber),
          courierName: text(record.courierName),
          estimatedDelivery: text(record.estimatedDelivery),
        });
        const sent = await sendMail({
          to: order.email,
          subject: template.subject,
          html: template.html,
        });
        if (!sent) return mailUnavailable();
        return NextResponse.json({ success: true });
      }

      // payment-proof → the store admins, not the customer.
      const template = paymentProofEmail({
        orderId: order.orderId,
        customerName: order.shippingAddress?.name || order.email,
        customerEmail: order.email,
        methodLabel: paymentMethodLabel(order.paymentMethod),
        total: order.total || 0,
        screenshotUrl: order.paymentScreenshot || '',
      });
      const sent = await sendMail({
        to: [...ADMIN_NOTIFY_EMAILS],
        subject: template.subject,
        html: template.html,
      });
      if (!sent) return mailUnavailable();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown email type' }, { status: 400 });
  } catch (error) {
    console.error('[Email API] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
