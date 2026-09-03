import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from '../src/lib/rateLimit.js';

test('login attempts are capped per IP inside the window', () => {
  const key = 'test-ip-' + Math.random();
  for (let i = 0; i < 8; i++) assert.equal(rateLimit(key, { limit: 8, windowMs: 60000 }).allowed, true);
  assert.equal(rateLimit(key, { limit: 8, windowMs: 60000 }).allowed, false);
});

test('the window resets so a legitimate user is not locked out forever', async () => {
  const key = 'test-window-' + Math.random();
  assert.equal(rateLimit(key, { limit: 1, windowMs: 20 }).allowed, true);
  assert.equal(rateLimit(key, { limit: 1, windowMs: 20 }).allowed, false);
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(rateLimit(key, { limit: 1, windowMs: 20 }).allowed, true);
});

test('separate IPs get separate buckets', () => {
  const a = 'ip-a-' + Math.random(), b = 'ip-b-' + Math.random();
  rateLimit(a, { limit: 1 }); rateLimit(a, { limit: 1 });
  assert.equal(rateLimit(b, { limit: 1 }).allowed, true);
});
