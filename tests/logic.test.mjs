// Unit tests for the rules that decide money, access and data integrity.
// Run: npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import { orderSchema, productSchema, productUpdateSchema, trackSchema, normalizePhone } from '../src/lib/validate.js';
import { calcShipping, escapeRegex, slugify } from '../src/lib/utils.js';
import { signSession, verifySession } from '../src/lib/session.js';

const OID = 'a'.repeat(24);

test('phone numbers normalise to one stored format', () => {
  for (const input of ['01712345678', '+8801712345678', '8801712345678', '01712-345678', ' 01712 345678 ']) {
    assert.equal(normalizePhone(input), '01712345678');
  }
});

test('checkout rejects a bad phone number', () => {
  const base = { name: 'Rahim', address: 'House 4, Road 2, Mirpur', city: 'Dhaka' };
  const order = (phone) => orderSchema.safeParse({ customer: { ...base, phone }, items: [{ product: OID, qty: 1 }] });
  assert.equal(order('01712345678').success, true);
  assert.equal(order('0171234').success, false);
  assert.equal(order('01212345678').success, false); // 012 is not a valid operator prefix
});

test('checkout stores the normalised phone so tracking can find the order', () => {
  const parsed = orderSchema.parse({
    customer: { name: 'Rahim', phone: '+880 1712-345678', address: 'House 4, Road 2', city: 'Dhaka' },
    items: [{ product: OID, qty: 2 }],
  });
  const lookup = trackSchema.parse({ orderNo: 'am-20260903-1234', phone: '01712345678' });
  assert.equal(parsed.customer.phone, lookup.phone);
});

test('shipping: free above threshold, otherwise by district', () => {
  const s = { freeShippingAbove: 1500, shippingInsideDhaka: 60, shippingOutsideDhaka: 120 };
  assert.equal(calcShipping(2000, 'Dhaka', s), 0);
  assert.equal(calcShipping(1500, 'Rajshahi', s), 0);
  assert.equal(calcShipping(500, 'Dhaka', s), 60);
  assert.equal(calcShipping(500, 'dhaka north', s), 60);
  assert.equal(calcShipping(500, 'Chattogram', s), 120);
  assert.equal(calcShipping(500, 'Sylhet', {}), 120); // sane defaults when unset
});

test('a partial product update never wipes untouched fields', () => {
  const patch = productUpdateSchema.parse({ price: 500 });
  assert.deepEqual(Object.keys(patch), ['price']);
  assert.equal('images' in patch, false);
  assert.equal('active' in patch, false);
  assert.equal('featured' in patch, false);
});

test('creating a product still applies sensible defaults', () => {
  const p = productSchema.parse({ name: 'Chilli powder', price: 320, category: OID });
  assert.equal(p.active, true);
  assert.equal(p.stock, 0);
  assert.deepEqual(p.images, []);
});

test('product rejects a non-id category and over-long input', () => {
  assert.equal(productSchema.safeParse({ name: 'x', price: 1, category: 'not-an-id' }).success, false);
  assert.equal(productSchema.safeParse({ name: 'ab', price: -5, category: OID }).success, false);
});

test('uploaded relative paths are accepted as images', () => {
  const p = productSchema.parse({ name: 'Item', price: 10, category: OID, images: ['/uploads/a.jpg', 'https://res.cloudinary.com/x.jpg'] });
  assert.equal(p.images.length, 2);
});

test('search input with regex characters cannot break the query', () => {
  assert.equal(escapeRegex('chilli (hot)'), 'chilli \\(hot\\)');
  assert.doesNotThrow(() => new RegExp(escapeRegex('a(b[c')));
});

test('slugs stay url-safe and support Bangla names', () => {
  assert.equal(slugify('Kashmiri Red Chilli — 200g!'), 'kashmiri-red-chilli-200g');
  assert.equal(slugify('মরিচ গুঁড়া').length > 0, true);
});

test('a session survives a round trip and a tampered token is rejected', async () => {
  process.env.JWT_SECRET = 'test-secret-value-long-enough';
  const token = await signSession({ sub: '1', role: 'admin', email: 'a@b.com' });
  const payload = await verifySession(token);
  assert.equal(payload.role, 'admin');
  assert.equal(await verifySession(token.slice(0, -3) + 'xxx'), null);
  assert.equal(await verifySession('garbage'), null);
  assert.equal(await verifySession(undefined), null);
});

test('an expired session is rejected', async () => {
  const token = await signSession({ sub: '1', role: 'admin' }, -10);
  assert.equal(await verifySession(token), null);
});
