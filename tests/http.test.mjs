import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server/http.mjs';
import { once } from 'node:events';
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
const post = (value, origin = 'https://dopamine-shop.ru') => fetch(`${base}/api/checkout/quote`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(value) });
test('health explicitly reports checkout disabled', async () => assert.deepEqual(await (await fetch(`${base}/api/health`)).json(), { status: 'ok', checkoutEnabled: false }));
test('foreign origin cannot call checkout', async () => assert.equal((await post({}, 'https://other.example')).status, 403));
test('actual preview inventory cannot be purchased via API', async () => assert.equal((await post({ delivery: 'pickup', lines: [{ productId: 'mosaic-lamp-large-orange', variantId: 'mosaic-lamp-large-orange-pending', quantity: 1 }] })).status, 422));
test('oversized bodies and invalid JSON are rejected', async () => {
  assert.equal((await post({ text: 'a'.repeat(20000) })).status, 413);
  assert.equal((await fetch(`${base}/api/checkout/quote`, { method: 'POST', headers: { Origin: 'https://dopamine-shop.ru', 'Content-Type': 'application/json' }, body: '{' })).status, 400);
});
test('secrets, project metadata and order endpoints are inaccessible', async () => {
  for (const url of ['/.env', '/.openai/hosting.json', '/server/yookassa.mjs', '/api/orders']) assert.equal((await fetch(base + url)).status, 404);
});
