import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../server/http.mjs';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
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

test('static pages negotiate compression without changing their content', async () => {
  const expected = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const encoding of ['br', 'gzip', 'br;q=0, gzip;q=0']) {
    const response = await fetch(base + '/', { headers: { 'Accept-Encoding': encoding } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-encoding'), encoding.startsWith('br;q=0') ? null : encoding);
    assert.equal(response.headers.get('vary'), 'Accept-Encoding');
    assert.equal(await response.text(), expected);
  }
});

test('ETags allow body-free revalidation, while HTML stays fresh', async () => {
  const head = await fetch(base + '/', { method: 'HEAD', headers: { 'Accept-Encoding': 'br' } });
  assert.equal(head.headers.get('cache-control'), 'no-cache');
  assert.ok(head.headers.get('etag'));
  assert.equal(await head.text(), '');
  const response = await fetch(base + '/', { headers: { 'Accept-Encoding': 'br', 'If-None-Match': head.headers.get('etag') } });
  assert.equal(response.status, 304);
  assert.equal(await response.text(), '');
});

test('only versioned assets get immutable long-term caching', async () => {
  const manifest = JSON.parse(await readFile(new URL('../src/lib/image-variants.json', import.meta.url), 'utf8'));
  const image = Object.values(manifest)[0];
  const response = await fetch(base + image.src);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /max-age=31536000, immutable/);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  assert.equal((await fetch(base + '/data/catalog.json')).headers.get('cache-control'), 'no-cache');
});
