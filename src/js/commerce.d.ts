import type { Catalog, CartLine, Product, Variant } from '../lib/models';
export function assetURL(value: unknown): string | null;
export function validateCatalog(data: unknown): Catalog;
export function startingVariant(product: Product): Variant;
export function parsePriceInput(value: string | number | null): number | null;
export function filterProducts(products: Product[], filters?: { category?: string; query?: string; sort?: string; minPrice?: number | null; maxPrice?: number | null; inStock?: boolean; favoritesOnly?: boolean; favoriteIds?: Set<string> }): Product[];
export function restoreCart(raw: unknown, products: Product[]): CartLine[];
export function setQuantity(lines: CartLine[], products: Product[], productId: string, variantId: string, quantity: number): CartLine[];
export function addItem(lines: CartLine[], products: Product[], productId: string, variantId: string, quantity?: number): CartLine[];
export interface CartItem extends CartLine { product: Product; variant: Variant; total: number }
export function cartSummary(lines: CartLine[], products: Product[]): { items: CartItem[]; total: number; count: number };
export function money(amount: number | null): string;
