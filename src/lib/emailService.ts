/**
 * WEARITION — Email Service
 * 
 * Priority: Backend Gmail SMTP (unlimited free) → EmailJS fallback (200/month) → Console log
 * 
 * HOW IT WORKS:
 * 1. Frontend generates beautiful HTML email from templates
 * 2. Sends to /api/send-email on your server
 * 3. Server sends via YOUR Gmail SMTP — unlimited, free, professional
 * 4. Email arrives in customer's inbox FROM your Gmail address
 * 
 * SETUP:
 * Add to .env:
 *   GMAIL_USER=your-email@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
 * 
 * To get App Password:
 * 1. Go to myaccount.google.com → Security
 * 2. Enable 2-Step Verification (if not already)
 * 3. Search "App passwords" → Generate one for "Mail"
 * 4. Copy the 16-character password → paste in .env as GMAIL_APP_PASSWORD
 */

import { 
  welcomeEmail, 
  orderPlacedEmail, 
  orderStatusEmail, 
  verificationOTPEmail, 
  passwordResetOTPEmail,
  paymentProofEmail 
} from './emailTemplates';
import { ADMIN_NOTIFY_EMAILS, paymentMethodLabel } from './paymentConfig';

// ──────────────── CORE SEND FUNCTION ────────────────

async function sendEmail(toEmail: string, subject: string, htmlContent: string): Promise<boolean> {

  // ── METHOD 1: Backend Gmail SMTP (preferred — unlimited, free) ──
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toEmail,
        subject,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.mock) {
        console.log('[Email] Backend running but Gmail not configured, trying EmailJS...');
      } else {
        console.log(`[Email] ✓ Sent via Gmail SMTP to ${toEmail}`);
        return true;
      }
    }
  } catch {
    // Backend not available, fall through to EmailJS
    console.log('[Email] Backend not available, trying EmailJS fallback...');
  }

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: toEmail,
            subject: subject,
            html_content: htmlContent,
          },
        }),
      });

      if (response.ok) {
        console.log(`[Email] ✓ Sent via EmailJS to ${toEmail}`);
        return true;
      }
    } catch (error) {
      console.error('[Email] EmailJS failed:', error);
    }
  }

  // ── METHOD 3: Console log fallback (dev mode) ──
  console.warn('[Email] No email provider available. Email logged:');
  console.log(`  To: ${toEmail}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  HTML: ${htmlContent.length} chars`);
  return true; // Don't break the app flow
}

// ──────────────── PUBLIC API ────────────────

/**
 * Send welcome email when a user creates an account
 */
export async function sendWelcomeEmail(data: { name: string; email: string }): Promise<boolean> {
  const { subject, html } = welcomeEmail(data);
  return sendEmail(data.email, subject, html);
}

/**
 * Send OTP verification email for new signups
 */
export async function sendVerificationOTPEmail(data: { name: string; email: string; code: string }): Promise<boolean> {
  const { subject, html } = verificationOTPEmail(data);
  return sendEmail(data.email, subject, html);
}

/**
 * Send OTP for password reset
 */
export async function sendPasswordResetOTPEmail(data: { email: string; code: string }): Promise<boolean> {
  const { subject, html } = passwordResetOTPEmail(data);
  return sendEmail(data.email, subject, html);
}

/**
 * Send order confirmation email with full order details
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
  const { subject, html } = orderPlacedEmail(data);
  return sendEmail(data.email, subject, html);
}

/**
 * Send order status update email (processing, shipped, delivered)
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
  const { subject, html } = orderStatusEmail(data);
  return sendEmail(data.email, subject, html);
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
    const { subject, html } = paymentProofEmail({
      orderId: data.orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      methodLabel: paymentMethodLabel(data.paymentMethod),
      total: data.total,
      screenshotUrl: data.screenshotUrl,
    });
    await Promise.all(
      ADMIN_NOTIFY_EMAILS.map(to => sendEmail(to, subject, html).catch(() => false))
    );
  } catch (error) {
    console.error('[Email] Payment proof notification failed:', error);
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use sendOrderConfirmationEmail or sendOrderStatusEmail instead
 */
export async function sendEmailNotification(
  toEmail: string,
  type: 'confirmation' | 'processing' | 'shipped' | 'delivered',
  data: { orderId: string }
): Promise<any> {
  if (type === 'confirmation') {
    return sendOrderConfirmationEmail({
      email: toEmail,
      name: 'Valued Customer',
      orderId: data.orderId,
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      shippingAddress: { name: '', address: '', city: '' },
    });
  } else {
    return sendOrderStatusEmail({
      email: toEmail,
      name: 'Valued Customer',
      orderId: data.orderId,
      status: type,
    });
  }
}
