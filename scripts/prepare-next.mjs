import { mkdir, cp, readFile } from 'node:fs/promises';
import { validateCatalog } from '../src/js/commerce.js';
const catalog = JSON.parse(await readFile('src/data/catalog.json', 'utf8'));
validateCatalog(catalog);
await mkdir('public/data', {recursive:true});
await mkdir('public/assets/fonts', {recursive:true});
await cp('src/data', 'public/data', {recursive:true});
await cp('src/assets/fonts', 'public/assets/fonts', {recursive:true});
console.log(`Validated ${catalog.products.length} catalog entries (${catalog.products.filter(p=>p.status==='preview').length} previews). No test fixtures published.`);
