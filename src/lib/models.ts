export interface ProductImage { src: string; alt: string; width: number; height: number; srcSet?: string }
export interface Variant { id: string; label: string; price: number | null; stock: number; compareAtPrice?: number }
export interface Product {
  id: string; slug: string; title: string; categoryId: string; description: string;
  images: ProductImage[]; variants: Variant[]; featured?: boolean; isNew?: boolean;
  rating?: number; reviewCount?: number; brand?: string; deliveryLabel?: string;
  specifications?: Record<string, string>; sellerId?: string;
  status?: 'active' | 'preview'; visualization?: boolean;
  photoSource?: { name: string; url?: string };
}
export interface Category { id: string; title: string; parentId?: string; description?: string }
export interface Room {
  id: string; title: string; image: ProductImage;
  markers: { productId: string; x: number; y: number }[];
}
export interface Catalog { version: 1; products: Product[]; categories: Category[]; rooms: Room[] }
export interface CartLine { productId: string; variantId: string; quantity: number }
export interface Profile { name: string; email: string; phone: string }
export interface CheckoutDraft extends Profile { city: string; address: string; comment: string; delivery: 'courier' | 'pickup' }
export interface ShopSettings { brand: string; checkoutEndpoint: string | null; contacts: { label: string; href: string }[]; deliveryText: string | null; returnsText: string | null }
