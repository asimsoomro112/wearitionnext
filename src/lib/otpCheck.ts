// WEARITION — Pure OTP decision logic (no Firestore access, tested).
// The persistence layer (src/lib/otpStore.ts) loads the record and applies
// the outcome; this module decides what the outcome is.

export type OtpPurpose = 'signup' | 'reset';

export interface OtpRecord {
  email: string;
  code: string;
  purpose: OtpPurpose;
  expiresAtMs: number;
  attempts: number;
  verified: boolean;
  verifiedAtMs?: number | null;
}

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export type OtpCheckResult =
  | { status: 'ok' }
  | { status: 'not_found' }
  | { status: 'expired' }
  | { status: 'too_many_attempts' }
  | { status: 'wrong_code'; attempts: number };

export function checkOtp(
  record: OtpRecord | null,
  code: string,
  nowMs: number,
): OtpCheckResult {
  if (!record) return { status: 'not_found' };
  if (record.attempts >= OTP_MAX_ATTEMPTS) return { status: 'too_many_attempts' };
  if (record.expiresAtMs <= nowMs) return { status: 'expired' };
  if (record.code !== code) {
    return { status: 'wrong_code', attempts: record.attempts + 1 };
  }
  return { status: 'ok' };
}

/** A verified OTP stays usable for the reset only until its original expiry. */
export function isVerifiedOtpUsable(
  record: OtpRecord | null,
  nowMs: number,
): boolean {
  if (!record || !record.verified) return false;
  return record.expiresAtMs > nowMs;
}
