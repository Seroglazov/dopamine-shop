'use client';

import { useEffect, useRef, useState } from 'react';

export function HeroDecor() {
  const surface = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

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

  function toggleMotion() {
    const nextPaused = !paused;
    setPaused(nextPaused);
    surface.current?.dispatchEvent(new CustomEvent('hero-decor-pause', { detail: { paused: nextPaused } }));
  }

  return <div ref={surface} className={`hero-decor${ready ? ' hero-decor-ready' : ''}`} data-motion-paused={paused ? 'true' : 'false'}>
    <div className="hero-decor-fallback" aria-hidden="true">
      <i className="hero-decor-fallback-lamp" />
      <i className="hero-decor-fallback-flower">✿</i>
      <i className="hero-decor-fallback-vase" />
      <i className="hero-decor-fallback-ring" />
    </div>
    {ready && <button className="hero-decor-motion" type="button" onClick={toggleMotion}
      aria-pressed={paused || reducedMotion} disabled={reducedMotion}
      aria-label={paused || reducedMotion ? 'Включить движение декора' : 'Приостановить движение декора'}
      title={reducedMotion ? 'Движение отключено в настройках устройства' : undefined}>
      <span aria-hidden="true">{paused || reducedMotion ? '▷' : 'Ⅱ'}</span>
      {paused || reducedMotion ? 'Движение' : 'Пауза'}
    </button>}
  </div>;
}
