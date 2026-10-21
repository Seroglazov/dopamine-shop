import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// The supplier photo is never resized, cropped, recoloured or regenerated.
// Only the original vector wordmark is rasterised and composited in a corner.
const root = path.resolve('source-assets/original-products');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'));
const output = path.resolve('public/assets/products');
const report = [];
await fs.mkdir(output, { recursive: true });
for (const photo of manifest) {
  const input = await fs.readFile(path.join(root, photo.file));
  const { data: before, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const logo = await sharp(`public/assets/${photo.logo === 'white' ? 'logo-original' : 'logo-wordmark'}.svg`)
    .resize({ width: Math.round(info.width * .22) }).png().toBuffer();
  const logoSize = await sharp(logo).metadata();
  const margin = Math.round(info.width * .035);
  const left = info.width - logoSize.width - margin;
  const top = photo.corner === 'top-right' ? margin : info.height - logoSize.height - margin;
  const destination = path.join(output, `original-${photo.id}.webp`);
  await sharp(before, { raw: info }).composite([{ input: logo, left, top }]).webp({ lossless: true, effort: 6 }).toFile(destination);
  const { data: after, info: afterInfo } = await sharp(destination).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (afterInfo.width !== info.width || afterInfo.height !== info.height) throw new Error(`Dimensions changed: ${photo.id}`);
  let changedOutsideLogo = 0;
  let changedInsideLogo = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const offset = (y * info.width + x) * 4;
    if (!before.subarray(offset, offset + 4).equals(after.subarray(offset, offset + 4))) {
      if (x >= left && x < left + logoSize.width && y >= top && y < top + logoSize.height) changedInsideLogo++;
      else changedOutsideLogo++;
    }
  }
  if (changedOutsideLogo || !changedInsideLogo) throw new Error(`Unexpected photo change: ${photo.id} (${changedOutsideLogo} pixels outside logo)`);
  report.push({ id: photo.id, original: photo.file, source: photo.url, sha256: createHash('sha256').update(input).digest('hex'),
    output: `/assets/products/original-${photo.id}.webp`, width: info.width, height: info.height,
    logoBounds: { left, top, width: logoSize.width, height: logoSize.height }, changedOutsideLogo, changedInsideLogo });
  console.log(`${photo.id}: ${info.width}×${info.height}, ${changedOutsideLogo} changed pixels outside logo`);
}
await fs.writeFile(path.join(root, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
