import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap { return ['','catalog/','about/','blog/','cooperation/','contacts/','delivery/','faq/','privacy/'].map(path => ({ url: `https://dopamine-shop.ru/${path}` })); }
