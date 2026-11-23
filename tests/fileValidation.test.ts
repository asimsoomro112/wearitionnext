// Tests for src/lib/fileValidation.ts — run with `npm test` (node --test).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectImageMime,
  isAllowedImageMime,
  MAX_UPLOAD_BYTES,
} from '../src/lib/fileValidation.ts';

test('max upload is 10MB', () => {
  assert.equal(MAX_UPLOAD_BYTES, 10 * 1024 * 1024);
});

test('MIME allowlist', () => {
  assert.equal(isAllowedImageMime('image/jpeg'), true);
  assert.equal(isAllowedImageMime('IMAGE/PNG'), true);
  assert.equal(isAllowedImageMime('image/webp'), true);
  assert.equal(isAllowedImageMime('image/gif'), true);
  assert.equal(isAllowedImageMime('image/avif'), true);
  assert.equal(isAllowedImageMime('image/svg+xml'), false);
  assert.equal(isAllowedImageMime('application/pdf'), false);
  assert.equal(isAllowedImageMime('application/octet-stream'), false);
  assert.equal(isAllowedImageMime(''), false);
});

test('magic bytes detect each format', () => {
  assert.equal(
    detectImageMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])),
    'image/jpeg',
  );
  assert.equal(
    detectImageMime(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    'image/png',
  );
  assert.equal(
    detectImageMime(new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])),
    'image/gif',
  );
  assert.equal(
    detectImageMime(
      new Uint8Array([
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42,
        0x50,
      ]),
    ),
    'image/webp',
  );
  assert.equal(
    detectImageMime(
      new Uint8Array([
        0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69,
        0x66,
      ]),
    ),
    'image/avif',
  );
});

test('magic bytes reject non-images', () => {
  assert.equal(detectImageMime(new Uint8Array([])), null);
  // "%PDF-" header
  assert.equal(
    detectImageMime(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])),
    null,
  );
  // "<html" text
  assert.equal(
    detectImageMime(new Uint8Array([0x3c, 0x68, 0x74, 0x6d, 0x6c])),
    null,
  );
  // Truncated PNG header
  assert.equal(detectImageMime(new Uint8Array([0x89, 0x50, 0x4e])), null);
});
