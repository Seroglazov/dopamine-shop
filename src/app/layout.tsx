import type { Metadata, Viewport } from 'next';
import { StoreProvider } from '../components/store';
import { Shell } from '../components/shell';
import './globals.css';
import './floating.css';
import './figma-shapes.css';
import './brand-refinement.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://dopamine-decor-studio.sagebun.chatgpt.site'),
  title: { default: 'Dopamine — дом, который радует', template: '%s · Dopamine' },
  description: 'Необычный декор для ярких эмоций и интерьеров с характером. Больше цвета. Больше тебя.',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f8f7f2' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body><StoreProvider><Shell>{children}</Shell></StoreProvider></body></html>;
}
