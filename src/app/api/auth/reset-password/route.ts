import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { consumeVerifiedOtp } from '@/lib/otpStore';
import { clientIp, rateLimit } from '@/lib/rateLimit';
import { isValidEmail, isValidPassword, normalizeEmail } from '@/lib/validators';

/**
 * WEARITION — Reset Password API (server-side OTP required).
 * The old version reset ANY user's password with no check at all — the
 * client verified the OTP, but the route never did, so a direct POST
 * took over any account (including admin@wearition.com).
 *
 * Now: the OTP must have been verified server-side first (verify-otp
 * marks the record verified) and this route consumes that flag exactly
 * once. No verified OTP → 401. New passwords must be at least 8 chars.
 * Rate limits: 5/hour per email, 20/hour per IP.
 */
export async function POST(req: Request) {
  try {
    if (!adminAuth) {
      console.error('Firebase Admin Auth not initialized. Check environment variables.');
      return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
    }

    const body: unknown = await req.json().catch(() => null);
    const record = (body ?? {}) as Record<string, unknown>;
    const emailRaw = typeof record.email === 'string' ? record.email : '';
    const newPassword = record.newPassword;

    if (!isValidEmail(emailRaw) || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Valid email and new password are required' },
        { status: 400 },
      );
    }
    const email = normalizeEmail(emailRaw);
    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    const ip = clientIp(req);
    const byEmail = rateLimit(`reset:email:${email}`, 5, 60 * 60 * 1000);
    if (!byEmail.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byEmail.retryAfterMs / 1000)) },
        },
      );
    }
    const byIp = rateLimit(`reset:ip:${ip}`, 20, 60 * 60 * 1000);
    if (!byIp.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(byIp.retryAfterMs / 1000)) },
        },
      );
    }

    // One-time use: the verified flag is consumed here, so a replayed
    // request (or a second reset with the same code) fails.
    const verified = await consumeVerifiedOtp(email, 'reset');
    if (!verified) {
      return NextResponse.json(
        { error: 'OTP verification required. Please request a new code.' },
        { status: 401 },
      );
    }

    // 1. Get user by email
    const userRecord = await adminAuth.getUserByEmail(email);

    // 2. Update password
    await adminAuth.updateUser(userRecord.uid, {
      password: newPassword,
    });

    // 3. Revoke all refresh tokens
    await adminAuth.revokeRefreshTokens(userRecord.uid);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({
      error: error.code === 'auth/user-not-found' ? 'User not found' : 'Failed to update password'
    }, { status: 500 });
  }
}
