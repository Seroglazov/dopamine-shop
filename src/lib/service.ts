import type { Catalog, ShopSettings } from './models';
import { validateCatalog } from '../js/commerce';

// Replace this adapter when the API is ready; views never fetch their own product data.
export interface CatalogService { getCatalog(signal?: AbortSignal): Promise<Catalog>; getSettings(signal?: AbortSignal): Promise<ShopSettings> }
async function readJSON(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Не удалось загрузить данные. Попробуйте ещё раз.');
  return response.json();
}
export const catalogService: CatalogService = {
  async getCatalog(signal) { return validateCatalog(await readJSON('/data/catalog.json', signal)) as Catalog; },
  async getSettings(signal) { return readJSON('/data/settings.json', signal); },
};
export function readLocal<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
export function writeLocal(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
