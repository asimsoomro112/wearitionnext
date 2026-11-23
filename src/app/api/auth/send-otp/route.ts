import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { isMailConfigured, sendMail } from '@/lib/mailer';
import { createOtp } from '@/lib/otpStore';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { isValidEmail, normalizeEmail } from '@/lib/validators';
import { passwordResetOTPEmail, verificationOTPEmail } from '@/lib/emailTemplates';

/**
 * WEARITION — Send OTP API (server-side).
 * Generates the 6-digit code, stores it server-side only (Admin SDK —
 * the `otps` collection denies all client access), and emails it.
 * Rate limits: 5/hour per email, 20/hour per IP.
 *
 * Password resets must not reveal whether an email has an account: for
 * purpose=reset with an unknown email, this still answers success
 * without sending anything.
 */
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);
    const record = (body ?? {}) as Record<string, unknown>;
    const emailRaw = typeof record.email === 'string' ? record.email : '';
    const purpose =
      record.purpose === 'reset'
        ? 'reset'
        : record.purpose === 'signup'
          ? 'signup'
          : null;
    const name =
      typeof record.name === 'string' ? record.name.slice(0, 100) : '';

    if (!purpose || !isValidEmail(emailRaw)) {
      return NextResponse.json(
        { error: 'Valid email and purpose are required' },
        { status: 400 },
      );
    }
    const email = normalizeEmail(emailRaw);
    const ip = clientIp(req);

    const byEmail = rateLimit(`otp:email:${email}`, 5, 60 * 60 * 1000);
    if (!byEmail.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byEmail.retryAfterMs / 1000)) },
        },
      );
    }
    const byIp = rateLimit(`otp:ip:${ip}`, 20, 60 * 60 * 1000);
    if (!byIp.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byIp.retryAfterMs / 1000)) },
        },
      );
    }

    if (purpose === 'reset' && adminAuth) {
      try {
        await adminAuth.getUserByEmail(email);
      } catch {
        // Unknown email: answer success, send nothing (no enumeration).
        return NextResponse.json({ success: true });
      }
    }

    const code = await createOtp(email, purpose);
    if (!code) {
      return NextResponse.json(
        { error: 'Auth service unavailable' },
        { status: 503 },
      );
    }
    if (!isMailConfigured()) {
      console.error('[send-otp] Gmail credentials not configured.');
      return NextResponse.json(
        { error: 'Email service unavailable' },
        { status: 503 },
      );
    }

    const template =
      purpose === 'signup'
        ? verificationOTPEmail({ name: name || 'there', code })
        : passwordResetOTPEmail({ code });
    const sent = await sendMail({
      to: email,
      subject: template.subject,
      html: template.html,
    });
    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 503 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[send-otp] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
