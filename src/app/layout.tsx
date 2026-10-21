import type { Metadata, Viewport } from 'next';
import { StoreProvider } from '../components/store';
import { Shell } from '../components/shell';
import './globals.css';
import './floating.css';
import './figma-shapes.css';
import './brand-refinement.css';
import './collections.css';
import './catalog-refinement.css';
import './home-collections.css';
import './hero-decor.css';
import './marketplace-hero.css';
import './legal.css';
import './buyers.css';
import './performance.css';
import 'lenis/dist/lenis.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://dopamine-shop.ru'),
  title: { default: 'Dopamine — необычный декор для дома', template: '%s · Dopamine' },
  description: 'Декор для дома: яркие цвета и необычные формы. Выбирай вещи, которые нравятся тебе, в каталоге Dopamine.',
  icons: {
    icon: [{ url: '/assets/brand/dopamine-icon-v3.png', type: 'image/png', sizes: '64x64' }],
    shortcut: '/assets/brand/dopamine-icon-v3.png',
    apple: '/assets/brand/dopamine-apple-v3.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Dopamine',
    title: 'Dopamine — необычный декор для дома',
    description: 'Декор для дома: яркие цвета и необычные формы. Выбирай вещи, которые нравятся тебе, в каталоге Dopamine.',
    images: [{ url: '/assets/brand/dopamine-preview-v2.png', width: 1254, height: 1254, alt: 'Dopamine — розовый и лаймовый узор' }],
  },
  twitter: {
    card: 'summary',
    images: ['/assets/brand/dopamine-preview-v2.png'],
  },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8f7f2' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><StoreProvider><Shell>{children}</Shell></StoreProvider></body></html>;
}
