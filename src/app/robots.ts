import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: '/', disallow: ['/account/','/checkout/','/orders/'] }, sitemap: 'https://dopamine-decor-studio.sagebun.chatgpt.site/sitemap.xml' }; }
export const dynamic = 'force-static';
