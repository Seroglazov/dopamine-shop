'use client';

import { useEffect, useRef, useState } from 'react';
import { mountHeroDecor } from '../js/hero-decor';

export function HeroDecor() {
  const surface = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    if (!surface.current) return;
    mountHeroDecor(surface.current, () => {
        if (!disposed) setReady(true);
    }).then(destroy => {
      if (disposed) destroy();
      else cleanup = destroy;
    }).catch(() => { /* The full-detail first frame remains visible without WebGL. */ });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={surface} className={`hero-decor${ready ? ' hero-decor-ready' : ''}`} aria-hidden="true">
    <picture className="hero-decor-poster">
      <source media="(max-width: 900px)" srcSet="/assets/brand/hero-first-frame-mobile-v1.webp" />
      <img src="/assets/brand/hero-first-frame-v1.webp" alt="" width="610" height="610" loading="eager" fetchPriority="high" decoding="sync" />
    </picture>
  </div>;
}
