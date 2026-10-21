'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroDecor() {
  const surface = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import('../js/hero-decor').then(async ({ mountHeroDecor }) => {
      if (disposed || !surface.current) return;
      const destroy = await mountHeroDecor(surface.current, () => {
        if (!disposed) setReady(true);
      });
      if (disposed) destroy();
      else cleanup = destroy;
    }).catch(() => { /* The decorative fallback remains visible without WebGL. */ });
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div ref={surface} className={`hero-decor${ready ? ' hero-decor-ready' : ''}`} aria-hidden="true">
    <div className="hero-decor-fallback">
      <i className="hero-decor-fallback-lamp" />
      <i className="hero-decor-fallback-flower">✿</i>
      <i className="hero-decor-fallback-vase" />
      <i className="hero-decor-fallback-mirror" />
    </div>
  </div>;
}
