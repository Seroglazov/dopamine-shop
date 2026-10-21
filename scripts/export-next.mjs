import { cp, rm } from 'node:fs/promises';
import path from 'node:path';
const target = path.resolve('dist');
if (target !== path.join(process.cwd(), 'dist')) throw new Error('Unexpected output target');
await rm(target, {recursive:true, force:true});
await cp('out', target, {recursive:true});
console.log('Static Next.js frontend exported to dist/');
await import('./compress-static.mjs');
