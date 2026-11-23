// WEARITION — Server-side OTP store (Admin SDK).
// OTP codes live ONLY here, in the `otps` collection, which the Firestore
// rules deny to all clients — the old client-side otpService wrote the
// codes from the browser and the rules denied it, so signup/reset OTPs
// were broken live. The code is generated with crypto.randomInt, stored
// with a 10-minute expiry and a 5-attempt cap, marked verified by
// verify-otp, and consumed (deleted) exactly once by reset-password.

import { randomInt } from 'node:crypto';
import { adminDb } from '@/lib/firebase-admin';
import {
  checkOtp,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  type OtpPurpose,
  type OtpRecord,
} from './otpCheck';

function docId(email: string, purpose: OtpPurpose): string {
  return `${email.toLowerCase()}_${purpose}`;
}

export async function createOtp(
  email: string,
  purpose: OtpPurpose,
): Promise<string | null> {
  if (!adminDb) return null;
  const code = String(randomInt(100000, 1000000));
  const now = Date.now();
  const record: OtpRecord = {
    email: email.toLowerCase(),
    code,
    purpose,
    expiresAtMs: now + OTP_TTL_MS,
    attempts: 0,
    verified: false,
    verifiedAtMs: null,
  };
  await adminDb.collection('otps').doc(docId(email, purpose)).set(record);
  return code;
}

export async function verifyOtp(
  email: string,
  purpose: OtpPurpose,
  code: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (!adminDb) return { ok: false, reason: 'unavailable' };
  const ref = adminDb.collection('otps').doc(docId(email, purpose));
  const snap = await ref.get();
  const record = snap.exists ? (snap.data() as OtpRecord) : null;
  const result = checkOtp(record, code, Date.now());

  if (result.status === 'ok') {
    await ref.update({ verified: true, verifiedAtMs: Date.now(), attempts: 0 });
    return { ok: true };
  }
  if (result.status === 'wrong_code') {
    await ref.update({ attempts: result.attempts });
    return { ok: false, reason: 'incorrect' };
  }
  if (result.status === 'expired' || result.status === 'too_many_attempts') {
    // Dead code — delete it so it can never be retried or replayed.
    await ref.delete().catch(() => {});
    return {
      ok: false,
      reason: result.status === 'expired' ? 'expired' : 'too_many_attempts',
    };
  }
  return { ok: false, reason: 'not_found' };
}

/**
 * Consume a verified OTP (one-time use). Returns true only when the record
 * exists, was verified, and has not expired; deletes the record on success.
 */
export async function consumeVerifiedOtp(
  email: string,
  purpose: OtpPurpose,
): Promise<boolean> {
  if (!adminDb) return false;
  const ref = adminDb.collection('otps').doc(docId(email, purpose));
  const snap = await ref.get();
  const record = snap.exists ? (snap.data() as OtpRecord) : null;
  if (!record || !record.verified || record.expiresAtMs <= Date.now()) {
    return false;
  }
  await ref.delete().catch(() => {});
  return true;
}

export { OTP_MAX_ATTEMPTS, OTP_TTL_MS };
