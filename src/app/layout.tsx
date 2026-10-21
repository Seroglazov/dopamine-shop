import type { Metadata, Viewport } from 'next';
import { StoreProvider } from '../components/store';
import { Shell } from '../components/shell';
import './globals.css';
import './floating.css';
import './figma-shapes.css';
import './brand-refinement.css';
import './collections.css';
import './catalog-refinement.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://dopamine-decor-studio.sagebun.chatgpt.site'),
  title: { default: 'Dopamine — необычный декор для дома', template: '%s · Dopamine' },
  description: 'Декор для дома: яркие цвета и необычные формы. Выбирай вещи, которые нравятся тебе, в каталоге Dopamine.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8f7f2' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><StoreProvider><Shell>{children}</Shell></StoreProvider></body></html>;
}
