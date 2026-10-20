'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { addItem, cartSummary, restoreCart, setQuantity } from '../js/commerce';
import { catalogService, readLocal, writeLocal } from '../lib/service';
import type { Catalog, CartLine, ShopSettings } from '../lib/models';

const empty: Catalog = { version: 1, products: [], categories: [], rooms: [] };
function useStoreState() {
  const [catalog, setCatalog] = useState<Catalog>(empty);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string) => {
    if (messageTimer.current) clearTimeout(messageTimer.current);
    setMessage(text);
    messageTimer.current = setTimeout(() => setMessage(''), 3800);
  }, []);
  useEffect(() => () => { if (messageTimer.current) clearTimeout(messageTimer.current); }, []);
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    Promise.all([catalogService.getCatalog(controller.signal), catalogService.getSettings(controller.signal)]).then(([data, config]) => {
      setCatalog(data); setSettings(config);
      setLines(restoreCart(readLocal('dopamine-cart-v1', null), data.products));
      const raw = readLocal<unknown>('dopamine-favorites-v1', []);
      const ids = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && 'ids' in raw ? (raw as { ids: unknown }).ids : []);
      setFavorites(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string' && data.products.some(p => p.id === id)) : []);
      setStatus('ready');
    }).catch(error => { if (error.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === 'dopamine-cart-v1') setLines(restoreCart(e.newValue, catalog.products));
      if (e.key === 'dopamine-favorites-v1') {
        const raw = readLocal<unknown>(e.key, []);
        setFavorites(Array.isArray(raw) ? raw.filter(id => typeof id === 'string' && catalog.products.some(p => p.id === id)) : []);
      }
    };
    window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync);
  }, [catalog]);
  const commit = (next: CartLine[]) => {
    setLines(next);
    if (!writeLocal('dopamine-cart-v1', { version: 1, lines: next })) notify('Корзина работает в этой вкладке. Сохранение в браузере недоступно.');
  };
  const add = (productId: string, variantId: string) => {
    try { commit(addItem(lines, catalog.products, productId, variantId)); notify('Добавлено в корзину'); }
    catch (e) { notify((e as Error).message); }
  };
  const quantity = (productId: string, variantId: string, value: number) => {
    try { commit(setQuantity(lines, catalog.products, productId, variantId, value)); }
    catch (e) { notify((e as Error).message); }
  };
  const favorite = (id: string) => {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    setFavorites(next);
    if (!writeLocal('dopamine-favorites-v1', next)) notify('Избранное сохранено только в этой вкладке.');
  };
  const summary = useMemo(() => cartSummary(lines, catalog.products), [lines, catalog]);
  return { catalog, settings, lines, favorites, status, message, notify, add, quantity, favorite, summary, retry: () => setRevision(r => r + 1) };
}
const Store = createContext<ReturnType<typeof useStoreState> | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreState();
  return <Store.Provider value={value}>{children}<div className={`toast ${value.message ? 'visible' : ''}`} role="status" aria-live="polite">{value.message}</div></Store.Provider>;
}
export function useStore() { const value = useContext(Store); if (!value) throw new Error('StoreProvider required'); return value; }
