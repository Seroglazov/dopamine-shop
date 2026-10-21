// Server-only transport. Order persistence and stock reservation must precede its use.
export function createYooKassa({ shopId, secretKey, origin = 'https://dopamine-shop.ru', fetcher = fetch }) {
  const base = new URL(origin);
  if (base.protocol !== 'https:' || base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw new Error('Invalid shop origin');
  async function request(path, method, body, key) {
    if (!shopId || !secretKey) throw new Error('ЮKassa не настроена');
    const response = await fetcher(`https://api.yookassa.ru/v3/${path}`, {
      method,
      headers: { Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`, 'Content-Type': 'application/json', ...(key ? { 'Idempotence-Key': key } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('Не удалось получить ответ платёжного сервиса');
    return response.json();
  }
  return {
    async createPayment({ orderId, total, idempotencyKey, receipt }) {
      if (typeof orderId !== 'string' || !/^[a-zA-Z0-9-]{1,64}$/.test(orderId) || !Number.isSafeInteger(total) || total <= 0 || typeof idempotencyKey !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(idempotencyKey)) throw new Error('Invalid payment input');
      return request('payments', 'POST', {
        amount: { value: (total / 100).toFixed(2), currency: 'RUB' }, capture: true,
        confirmation: { type: 'redirect', return_url: `${base.origin}/orders/?order=${encodeURIComponent(orderId)}` },
        description: `Заказ Dopamine ${orderId}`, metadata: { orderId }, ...(receipt ? { receipt } : {}),
      }, idempotencyKey);
    },
    async getPayment(paymentId) {
      if (typeof paymentId !== 'string' || !/^[a-zA-Z0-9-]{1,64}$/.test(paymentId)) throw new Error('Invalid payment ID');
      return request(`payments/${paymentId}`, 'GET');
    },
  };
}

// Use only with a payment freshly fetched from YooKassa, never a webhook body.
export function verifiedPaid(payment, order, { allowTest = false } = {}) {
  return Boolean(payment?.id === order.paymentId && payment.status === 'succeeded' && payment.paid === true &&
    (payment.test === false || (allowTest && payment.test === true)) && payment.metadata?.orderId === order.id &&
    payment.amount?.currency === 'RUB' && payment.amount?.value === (order.total / 100).toFixed(2));
}
