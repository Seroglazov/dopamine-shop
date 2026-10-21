import test from 'node:test';
import assert from 'node:assert/strict';
import { quote } from '../server/checkout.mjs';
import { createYooKassa, verifiedPaid } from '../server/yookassa.mjs';
const catalog = { products: [{ id: 'p', title: 'Товар', status: 'active', variants: [{ id: 'v', label: 'Основной', price: 12345, stock: 3 }] }] };
const line = { productId: 'p', variantId: 'v', quantity: 1 };
test('server calculates price and merges duplicate lines', () => {
  const result = quote(catalog, [{ ...line, price: 1, total: 1 }, line], 500);
  assert.equal(result.total, 25190); assert.equal(result.items.length, 1); assert.equal(result.items[0].quantity, 2);
});
test('duplicate lines cannot bypass inventory', () => assert.throws(() => quote(catalog, [{ ...line, quantity: 2 }, { ...line, quantity: 2 }], 0), /наличии/));
test('invalid quantities and unknown variants are rejected', () => {
  for (const quantity of [0, -1, 1.5, '1', NaN, Infinity, 101]) assert.throws(() => quote(catalog, [{ ...line, quantity }], 0));
  assert.throws(() => quote(catalog, [{ ...line, variantId: 'missing' }], 0));
  assert.throws(() => quote(catalog, [], 0));
});
test('preview, concepts and missing prices cannot be sold', () => {
  for (const patch of [{ status: 'preview' }, { visualization: true }, { variants: [{ id: 'v', price: null, stock: 3 }] }]) assert.throws(() => quote({ products: [{ ...catalog.products[0], ...patch }] }, [line], 0));
});
test('unknown shipping does not default to free shipping', () => assert.throws(() => quote(catalog, [line]), /доставки/));
test('payment transport uses server total, stable key, shop return URL and receipt', async () => {
  let sent;
  const api = createYooKassa({ shopId: 'test-shop', secretKey: 'test-secret', fetcher: async (url, options) => { sent = { url, ...options }; return { ok: true, json: async () => ({ id: 'payment' }) }; } });
  await api.createPayment({ orderId: 'order-1', total: 12345, idempotencyKey: '1234567890abcdef', receipt: { customer: { email: 'test@example.com' } } });
  const body = JSON.parse(sent.body);
  assert.equal(body.amount.value, '123.45'); assert.equal(body.amount.currency, 'RUB');
  assert.equal(sent.headers['Idempotence-Key'], '1234567890abcdef');
  assert.equal(body.confirmation.return_url, 'https://dopamine-shop.ru/orders/?order=order-1');
  assert.equal(body.receipt.customer.email, 'test@example.com');
  await assert.rejects(api.getPayment('../anything'));
});
test('paid requires matching verified amount, order, payment and live mode', () => {
  const order = { id: 'order-1', paymentId: 'payment', total: 12345 };
  const payment = { id: 'payment', status: 'succeeded', paid: true, test: false, metadata: { orderId: order.id }, amount: { currency: 'RUB', value: '123.45' } };
  assert.equal(verifiedPaid(payment, order), true);
  for (const patch of [{ test: true }, { paid: false }, { id: 'other' }, { status: 'pending' }, { amount: { currency: 'RUB', value: '1.00' } }, { metadata: { orderId: 'other' } }]) assert.equal(verifiedPaid({ ...payment, ...patch }, order), false);
});
test('payment transport does not expose provider errors or run without credentials', async () => {
  const input = { orderId: 'order-1', total: 100, idempotencyKey: '1234567890abcdef' };
  await assert.rejects(createYooKassa({}).createPayment(input), /не настроена/);
  await assert.rejects(createYooKassa({ shopId: 's', secretKey: 'k', fetcher: async () => ({ ok: false }) }).createPayment(input), /платёжного сервиса/);
});
