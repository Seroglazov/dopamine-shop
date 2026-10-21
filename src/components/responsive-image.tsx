import type { ImgHTMLAttributes } from 'react';
import variants from '../lib/image-variants.json';

const images = variants as Record<string, { src: string; srcSet: string }>;
export function ResponsiveImage({ src, srcSet, sizes, loading = 'lazy', decoding = 'async', original = false, ...props }: ImgHTMLAttributes<HTMLImageElement> & { original?: boolean }) {
  const image = !original && typeof src === 'string' ? images[src] : undefined;
  return <img {...props} src={image?.src || src} srcSet={image?.srcSet || srcSet} sizes={sizes || (image ? '(max-width: 600px) 92vw, (max-width: 1100px) 48vw, 33vw' : undefined)} loading={loading} decoding={decoding} />;
}
