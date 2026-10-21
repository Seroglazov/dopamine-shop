import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { brotliCompress, gzip, constants } from 'node:zlib';
import { promisify } from 'node:util';
const brotli = promisify(brotliCompress), gz = promisify(gzip);
let sourceBytes = 0, compressedBytes = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!/\.(html|txt|xml|js|css|json|svg)$/.test(file)) continue;
    const bytes = await readFile(file);
    if (bytes.length < 1024) continue;
    const [br, gzipBytes] = await Promise.all([
      brotli(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 6 } }), gz(bytes, { level: 9 }),
    ]);
    await Promise.all([writeFile(file + '.br', br), writeFile(file + '.gz', gzipBytes)]);
    sourceBytes += bytes.length; compressedBytes += br.length;
  }
}
await walk('dist');
console.log(`Static compression: ${sourceBytes} → ${compressedBytes} bytes (Brotli).`);
