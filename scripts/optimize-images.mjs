import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Originals stay untouched; the browser downloads a size appropriate to its viewport.
const output = 'public/assets/optimized';
await mkdir(output, { recursive: true });
const manifest = {};
let originalBytes = 0, cardBytes = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === 'optimized' || entry.name === 'brand') continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!/\.(png|jpe?g|webp)$/i.test(file)) continue;
    const bytes = await readFile(file);
    const metadata = await sharp(bytes).metadata();
    if (metadata.animated || !metadata.width) continue;
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const widths = [...new Set([480, 960, 1600].map(width => Math.min(width, metadata.width)))];
    const variants = [];
    for (const width of widths) {
      const name = `${hash}-${width}.webp`;
      const target = path.join(output, name);
      try { await access(target); } catch {
        await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(target);
      }
      variants.push({ src: `/assets/optimized/${name}`, width });
    }
    const preferred = variants.find(image => image.width >= 960) || variants.at(-1);
    manifest['/' + path.relative('public', file).split(path.sep).join('/')] = {
      src: preferred.src,
      srcSet: variants.map(image => `${image.src} ${image.width}w`).join(', '),
    };
    originalBytes += bytes.length;
    cardBytes += (await readFile(path.join('public', preferred.src))).length;
  }
}
await walk('public/assets');
const brand = 'public/assets/brand/dopamine-preview-v2.png';
await sharp(brand).resize(64, 64).png().toFile('public/assets/brand/dopamine-icon-v3.png');
await sharp(brand).resize(180, 180).png().toFile('public/assets/brand/dopamine-apple-v3.png');
await writeFile('src/lib/image-variants.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Images: ${Object.keys(manifest).length} originals preserved; 960px versions ${originalBytes} → ${cardBytes} bytes.`);
