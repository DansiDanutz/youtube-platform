import test from 'node:test';
import assert from 'node:assert/strict';

import {
  isAllowedImageFile,
  isBoundedJsonValue,
  isBoundedText,
  isFiniteNumberInRange,
  isSafeImageSource,
  isSafeIdentifier,
} from '../src/lib/api-guards.mjs';

test('bounds text inputs by type, content, and length', () => {
  assert.equal(isBoundedText('hello', 10), true);
  assert.equal(isBoundedText('   ', 10), false);
  assert.equal(isBoundedText('x'.repeat(11), 10), false);
  assert.equal(isBoundedText({ toString: () => 'hello' }, 10), false);
});

test('bounds structured prompt inputs before serialization', () => {
  assert.equal(isBoundedJsonValue({ name: 'template' }, 100), true);
  assert.equal(isBoundedJsonValue({ payload: 'x'.repeat(200) }, 100), false);
  assert.equal(isBoundedJsonValue(null, 100), false);
});

test('accepts only finite numeric values in the allowed range', () => {
  assert.equal(isFiniteNumberInRange(10, 1, 30), true);
  assert.equal(isFiniteNumberInRange(Number.NaN, 1, 30), false);
  assert.equal(isFiniteNumberInRange(Number.POSITIVE_INFINITY, 1, 30), false);
  assert.equal(isFiniteNumberInRange(31, 1, 30), false);
});

test('rejects oversized or unsupported thumbnail uploads', () => {
  assert.equal(isAllowedImageFile({ type: 'image/png', size: 5 * 1024 * 1024 }), true);
  assert.equal(isAllowedImageFile({ type: 'image/svg+xml', size: 100 }), false);
  assert.equal(isAllowedImageFile({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }), false);
});

test('allows bounded HTTPS and raster data image sources only', () => {
  assert.equal(isSafeImageSource('https://example.com/image.png'), true);
  assert.equal(isSafeImageSource('javascript:alert(1)'), false);
  assert.equal(isSafeImageSource('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(isSafeImageSource(`data:image/png;base64,${'a'.repeat(7 * 1024 * 1024)}`), false);
});

test('rejects provider identifiers that can alter an upstream URL path', () => {
  assert.equal(isSafeIdentifier('request_abc-123'), true);
  assert.equal(isSafeIdentifier('../../models'), false);
  assert.equal(isSafeIdentifier('request/other'), false);
  assert.equal(isSafeIdentifier('x'.repeat(129)), false);
});
