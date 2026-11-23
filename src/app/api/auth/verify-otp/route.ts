import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { isValidEmail, isValidOtpCode, normalizeEmail } from '@/lib/validators';

/**
 * WEARITION — Verify OTP API (server-side).
 * Checks the code against the server-stored record (10-minute expiry,
 * 5-attempt cap — the record is deleted on expiry or too many attempts).
 * On success the record is marked verified; reset-password consumes that
 * flag exactly once. Rate limits: 10/10min per email, 30/10min per IP.
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
    const code = record.code;

    if (!purpose || !isValidEmail(emailRaw) || !isValidOtpCode(code)) {
      return NextResponse.json(
        { success: false, error: 'not_found' },
        { status: 400 },
      );
    }
    const email = normalizeEmail(emailRaw);
    const ip = clientIp(req);

    const byEmail = rateLimit(`otp-verify:email:${email}`, 10, 10 * 60 * 1000);
    if (!byEmail.allowed) {
      return NextResponse.json(
        { success: false, error: 'too_many_attempts' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byEmail.retryAfterMs / 1000)) },
        },
      );
    }
    const byIp = rateLimit(`otp-verify:ip:${ip}`, 30, 10 * 60 * 1000);
    if (!byIp.allowed) {
      return NextResponse.json(
        { success: false, error: 'too_many_attempts' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byIp.retryAfterMs / 1000)) },
        },
      );
    }

    const result = await verifyOtp(email, purpose, code);
    if (result.ok) return NextResponse.json({ success: true });
    const status = result.reason === 'unavailable' ? 503 : 400;
    return NextResponse.json(
      { success: false, error: result.reason || 'not_found' },
      { status },
    );
  } catch (error) {
    console.error('[verify-otp] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
