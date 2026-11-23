// Tests for src/lib/validators.ts — run with `npm test` (node --test).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidOtpCode,
  isValidPassword,
  normalizeEmail,
} from '../src/lib/validators.ts';

test('email validation', () => {
  assert.equal(isValidEmail('ahmed@example.com'), true);
  assert.equal(isValidEmail('Ahmed@Example.COM'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidEmail('missing@domain'), false);
  assert.equal(isValidEmail('a@b.c'), false);
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail('a'.repeat(250) + '@x.com'), false);
});

test('email normalization lowercases and trims', () => {
  assert.equal(normalizeEmail('  Ahmed@Example.COM '), 'ahmed@example.com');
});

test('OTP code must be exactly 6 digits', () => {
  assert.equal(isValidOtpCode('123456'), true);
  assert.equal(isValidOtpCode('12345'), false);
  assert.equal(isValidOtpCode('1234567'), false);
  assert.equal(isValidOtpCode('12345a'), false);
  assert.equal(isValidOtpCode(''), false);
  assert.equal(isValidOtpCode(123456), false);
  assert.equal(isValidOtpCode(null), false);
});

test('password must be at least 8 characters', () => {
  assert.equal(isValidPassword('12345678'), true);
  assert.equal(isValidPassword('1234567'), false);
  assert.equal(isValidPassword(''), false);
  assert.equal(isValidPassword(null), false);
  assert.equal(isValidPassword(12345678), false);
});
