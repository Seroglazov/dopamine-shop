import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/', disallow: ['/account/','/checkout/','/orders/'] }, sitemap: 'https://dopamine-shop.ru/sitemap.xml' }; }
export const dynamic = 'force-static';
