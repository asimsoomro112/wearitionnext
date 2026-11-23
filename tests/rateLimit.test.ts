// Tests for src/lib/rateLimit.ts — run with `npm test` (node --test).
import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from '../src/lib/rateLimit.ts';

test('allows requests up to the limit, then denies', () => {
  const key = `test-allow-${Date.now()}`;
  assert.equal(rateLimit(key, 3, 60_000).allowed, true);
  assert.equal(rateLimit(key, 3, 60_000).allowed, true);
  assert.equal(rateLimit(key, 3, 60_000).allowed, true);
  const denied = rateLimit(key, 3, 60_000);
  assert.equal(denied.allowed, false);
  assert.ok(denied.retryAfterMs > 0 && denied.retryAfterMs <= 60_000);
});

test('separate keys have separate buckets', () => {
  const stamp = Date.now();
  assert.equal(rateLimit(`test-a-${stamp}`, 1, 60_000).allowed, true);
  assert.equal(rateLimit(`test-a-${stamp}`, 1, 60_000).allowed, false);
  assert.equal(rateLimit(`test-b-${stamp}`, 1, 60_000).allowed, true);
});

test('allows again after the window expires', async () => {
  const key = `test-window-${Date.now()}`;
  assert.equal(rateLimit(key, 1, 50).allowed, true);
  assert.equal(rateLimit(key, 1, 50).allowed, false);
  await new Promise((resolve) => setTimeout(resolve, 70));
  assert.equal(rateLimit(key, 1, 50).allowed, true);
});
