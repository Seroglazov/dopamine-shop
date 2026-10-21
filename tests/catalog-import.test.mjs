import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { validateCatalog } from '../src/js/commerce.js';

const catalog = JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url)));
const manifest = JSON.parse(await readFile(new URL('../docs/omi-import-manifest.json', import.meta.url)));

test('import preserves all source products and variant photos without enabling sales', () => {
  validateCatalog(catalog);
  const imported = catalog.products.filter(product => product.id.startsWith('omi-'));
  assert.equal(imported.length, manifest.importedProductCount);
  for (const source of manifest.products) {
    const product = imported.find(product => product.sourceProductId === source.sourceProductId);
    assert.ok(product, source.title);
    assert.equal(product.status, 'preview');
    assert.equal(product.variants.length, source.variants.length);
    for (const variant of product.variants) {
      assert.equal(variant.price, null);
      assert.equal(variant.stock, 0);
      assert.ok(product.images.some(image => image.src === variant.imageSrc));
    }
  }
});

test('variant photos must belong to the validated product gallery', () => {
  const invalid = structuredClone(catalog);
  invalid.products[0].variants[0].imageSrc = '/unrelated.jpg';
  assert.throws(() => validateCatalog(invalid), /Invalid variant image/);
});

test('downloaded originals retain their recorded bytes and checksums', async () => {
  assert.equal(manifest.images.length, manifest.uniqueOriginalImages);
  for (const image of manifest.images) {
    assert.ok(image.src.startsWith('/assets/products/omi/'));
    assert.ok(!image.sourceURL.includes('/-/'));
    const bytes = await readFile(new URL(`../public${image.src}`, import.meta.url));
    assert.equal(bytes.length, image.bytes, image.src);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256, image.src);
  }
});
