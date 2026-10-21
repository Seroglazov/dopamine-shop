export class CheckoutError extends Error {
  constructor(message, status = 422) { super(message); this.status = status; }
}

// Never accept prices, totals, titles or stock supplied by a browser.
export function quote(catalog, lines, shippingTotal) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 100) throw new CheckoutError('Некорректная корзина');
  const quantities = new Map();
  for (const line of lines) {
    if (!line || typeof line.productId !== 'string' || typeof line.variantId !== 'string' || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 100) throw new CheckoutError('Некорректное количество');
    const key = JSON.stringify([line.productId, line.variantId]);
    const previous = quantities.get(key);
    quantities.set(key, { ...line, quantity: (previous?.quantity || 0) + line.quantity });
  }
  let itemsTotal = 0;
  const items = [...quantities.values()].map(line => {
    const product = catalog.products.find(p => p.id === line.productId);
    const variant = product?.variants.find(v => v.id === line.variantId);
    if (!product || product.status === 'preview' || product.visualization || !variant || !Number.isSafeInteger(variant.price) || variant.price <= 0) throw new CheckoutError('Товар пока недоступен для покупки');
    if (line.quantity > 100 || line.quantity > variant.stock) throw new CheckoutError('Недостаточно товара в наличии', 409);
    const total = variant.price * line.quantity;
    itemsTotal += total;
    if (!Number.isSafeInteger(total) || !Number.isSafeInteger(itemsTotal)) throw new CheckoutError('Сумма заказа слишком велика');
    return { productId: product.id, variantId: variant.id, title: product.title, label: variant.label, quantity: line.quantity, unitPrice: variant.price, total };
  });
  // Delivery must be explicitly configured; unknown delivery must never become free.
  if (!Number.isSafeInteger(shippingTotal) || shippingTotal < 0) throw new CheckoutError('Стоимость доставки ещё не настроена', 503);
  if (!Number.isSafeInteger(itemsTotal + shippingTotal)) throw new CheckoutError('Сумма заказа слишком велика');
  return { items, itemsTotal, shippingTotal, total: itemsTotal + shippingTotal, currency: 'RUB' };
}
