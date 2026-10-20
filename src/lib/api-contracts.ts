import type { CartLine, CheckoutDraft, Profile, ProductImage } from './models';

// Contracts only. No fake authentication, order creation, payment or network POST.
export interface Seller { id: string; name: string; logo?: ProductImage; description?: string }
export interface AuthChallenge { id: string; expiresAt: string; destination: string }
export interface Session { userId: string; profile: Profile; expiresAt: string }
export interface AuthService {
  requestCode(input: { email?: string; phone?: string }): Promise<AuthChallenge>;
  verifyCode(challengeId: string, code: string): Promise<Session>;
  signOut(): Promise<void>;
}
export interface OrderLine extends CartLine { title: string; unitPrice: number; sellerId: string }
export interface Order { id: string; createdAt: string; status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; lines: OrderLine[]; total: number; currency: 'RUB' }
export interface CheckoutService {
  // The future server must recalculate prices, delivery and current stock.
  quote(lines: CartLine[], delivery: Pick<CheckoutDraft, 'city' | 'address' | 'delivery'>): Promise<{ itemsTotal: number; shippingTotal: number; total: number; expiresAt: string }>;
  createOrder(lines: CartLine[], customer: CheckoutDraft, idempotencyKey: string): Promise<Order>;
}
export interface OrdersService { list(): Promise<Order[]>; get(id: string): Promise<Order> }
