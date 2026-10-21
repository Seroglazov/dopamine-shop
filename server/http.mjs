import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { quote, CheckoutError } from './checkout.mjs';
import { validateCatalog } from '../src/js/commerce.js';
const project = fileURLToPath(new URL('../', import.meta.url));
const root = path.join(project, 'dist');
const origin = process.env.SHOP_ORIGIN || 'https://dopamine-shop.ru';
const types = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
function json(res, status, value) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(JSON.stringify(value)); }
async function body(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16384) throw new CheckoutError('Слишком большой запрос', 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new CheckoutError('Некорректный JSON', 400); }
}
export const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  try {
    const pathname = decodeURIComponent(new URL(req.url, origin).pathname);
    if (pathname === '/api/health' && req.method === 'GET') return json(res, 200, { status: 'ok', checkoutEnabled: false });
    if (pathname === '/api/checkout/quote' && req.method === 'POST') {
      if (req.headers.origin !== origin) throw new CheckoutError('Недопустимый источник запроса', 403);
      if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) throw new CheckoutError('Ожидается JSON', 415);
      const input = await body(req);
      if (!['courier', 'pickup'].includes(input?.delivery)) throw new CheckoutError('Выбери способ доставки');
      const catalog = validateCatalog(JSON.parse(await readFile(path.join(project, 'src/data/catalog.json'), 'utf8')));
      const raw = process.env[input.delivery === 'courier' ? 'SHIPPING_COURIER_KOPEKS' : 'SHIPPING_PICKUP_KOPEKS'];
      const shipping = raw && /^\d+$/.test(raw) ? Number(raw) : undefined;
      return json(res, 200, quote(catalog, input.lines, shipping));
    }
    if (pathname.startsWith('/api/')) return json(res, 404, { error: 'Маршрут не подключён' });
    if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Метод не поддерживается' });
    if (pathname.includes('\\') || pathname.split('/').some(segment => segment.startsWith('.'))) return json(res, 404, { error: 'Страница не найдена' });
    let target = path.resolve(root, `.${pathname}`);
    if (!target.startsWith(root + path.sep) && target !== root) return json(res, 404, { error: 'Страница не найдена' });
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    const extension = path.extname(target);
    const compressible = /\.(html|txt|xml|js|css|json|svg)$/.test(target);
    const encodings = String(req.headers['accept-encoding'] || '').split(',').map(value => {
      const [name, ...parameters] = value.trim().split(';');
      const quality = parameters.find(parameter => parameter.trim().startsWith('q='));
      const q = quality ? Number(quality.trim().slice(2)) : 1;
      return { name: name.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    });
    let encoding;
    if (compressible) {
      res.setHeader('Vary', 'Accept-Encoding');
      const candidates = ['br', 'gzip'].map(name => ({ name, q: (encodings.find(item => item.name === name) || encodings.find(item => item.name === '*'))?.q || 0 }))
        .filter(item => item.q > 0).sort((a, b) => b.q - a.q);
      for (const candidate of candidates) {
        const compressed = target + (candidate.name === 'br' ? '.br' : '.gz');
        try { await stat(compressed); target = compressed; encoding = candidate.name; break; }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
    }
    const file = await stat(target);
    const etag = `"${file.size.toString(16)}-${Math.trunc(file.mtimeMs).toString(16)}-${encoding || 'identity'}"`;
    const immutable = pathname.startsWith('/_next/static/') || /^\/assets\/optimized\/[a-f0-9]{16}-\d+\.webp$/.test(pathname);
    const cache = immutable ? 'public, max-age=31536000, immutable' : pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache';
    res.setHeader('Cache-Control', cache);
    res.setHeader('ETag', etag);
    res.setHeader('Content-Type', types[extension] || 'application/octet-stream');
    if (encoding) res.setHeader('Content-Encoding', encoding);
    if (String(req.headers['if-none-match'] || '').split(',').some(value => value.trim().replace(/^W\//, '') === etag || value.trim() === '*')) {
      res.writeHead(304).end(); return;
    }
    res.setHeader('Content-Length', file.size);
    res.writeHead(200).end(req.method === 'HEAD' ? undefined : await readFile(target));
  } catch (error) {
    if (error instanceof CheckoutError) return json(res, error.status, { error: error.message });
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return json(res, 404, { error: 'Страница не найдена' });
    if (error instanceof URIError) return json(res, 400, { error: 'Некорректный адрес' });
    return json(res, 500, { error: 'Не удалось обработать запрос' });
  }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
