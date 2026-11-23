// Tests for src/lib/otpCheck.ts — run with `npm test` (node --test).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkOtp,
  isVerifiedOtpUsable,
  OTP_MAX_ATTEMPTS,
  type OtpRecord,
} from '../src/lib/otpCheck.ts';

function record(overrides: Partial<OtpRecord> = {}): OtpRecord {
  return {
    email: 'test@example.com',
    code: '123456',
    purpose: 'reset',
    expiresAtMs: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    verified: false,
    verifiedAtMs: null,
    ...overrides,
  };
}

test('correct code within expiry verifies', () => {
  assert.deepEqual(checkOtp(record(), '123456', Date.now()), { status: 'ok' });
});

test('wrong code counts an attempt and can still succeed after', () => {
  const first = checkOtp(record(), '000000', Date.now());
  assert.deepEqual(first, { status: 'wrong_code', attempts: 1 });
  const retry = checkOtp(record({ attempts: 1 }), '123456', Date.now());
  assert.deepEqual(retry, { status: 'ok' });
});

test('at the attempt cap the code is refused even when correct', () => {
  const result = checkOtp(
    record({ attempts: OTP_MAX_ATTEMPTS }),
    '123456',
    Date.now(),
  );
  assert.deepEqual(result, { status: 'too_many_attempts' });
});

test('expired code is refused', () => {
  const result = checkOtp(
    record({ expiresAtMs: Date.now() - 1000 }),
    '123456',
    Date.now(),
  );
  assert.deepEqual(result, { status: 'expired' });
});

test('missing record is not_found', () => {
  assert.deepEqual(checkOtp(null, '123456', Date.now()), {
    status: 'not_found',
  });
});

test('verified OTP is usable only while unexpired', () => {
  assert.equal(
    isVerifiedOtpUsable(record({ verified: true }), Date.now()),
    true,
  );
  assert.equal(
    isVerifiedOtpUsable(
      record({ verified: true, expiresAtMs: Date.now() - 1000 }),
      Date.now(),
    ),
    false,
  );
  assert.equal(
    isVerifiedOtpUsable(record({ verified: false }), Date.now()),
    false,
  );
  assert.equal(isVerifiedOtpUsable(null, Date.now()), false);
});
