'use client';
import { ResponsiveImage } from './responsive-image';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { collections } from '../lib/collections';
import { Icon } from './ui';

export function CollectionRibbon({ activeId }: { activeId?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ start: 0, left: 0, moving: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => { setCanPrev(element.scrollLeft > 3); setCanNext(element.scrollLeft < element.scrollWidth - element.clientWidth - 3); };
    const resize = new ResizeObserver(update);
    resize.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => { resize.disconnect(); element.removeEventListener('scroll', update); };
  }, []);
  const scroll = (direction: number) => {
    const element = track.current;
    if (element) element.scrollBy({ left: direction * ((element.querySelector('a')?.getBoundingClientRect().width || 300) + 22), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div className="collection-ribbon">
    <div className="collection-ribbon-track" ref={track} role="region" aria-label="Подборки товаров" tabIndex={0}
      onPointerDown={event => { if (event.pointerType !== 'mouse' || event.button !== 0) return; drag.current = { start: event.clientX, left: event.currentTarget.scrollLeft, moving: false }; }}
      onPointerMove={event => { if (event.pointerType !== 'mouse' || event.buttons !== 1) return; const distance = event.clientX - drag.current.start; if (Math.abs(distance) > 6) drag.current.moving = true; if (drag.current.moving) event.currentTarget.scrollLeft = drag.current.left - distance; }}
      onClickCapture={event => { if (drag.current.moving) { event.preventDefault(); drag.current.moving = false; } }}>
      {collections.map((collection, index) => <Link key={collection.id} className="collection-tile" data-collection={collection.id} href={`/catalog/?collection=${collection.id}`} aria-current={activeId === collection.id ? 'page' : undefined} draggable={false}>
        <ResponsiveImage src={collection.image} alt={`Подборка «${collection.title}»`} width="736" height="986" sizes="(max-width: 600px) 76vw, (max-width: 1100px) 38vw, 27vw" loading="lazy" draggable={false} style={{ objectPosition: collection.position }} />
        <div className="collection-tile-copy"><span>DOPAMINE / 0{index + 1}</span><h3>{collection.title}</h3><p>{collection.note}</p></div>
        <span className="collection-tile-arrow"><Icon name="diagonal" size={22} /></span>
      </Link>)}
    </div>
    <div className="collection-ribbon-tools"><span>Выбирай своё настроение</span><div>
      <button type="button" disabled={!canPrev} aria-label="Предыдущие подборки" onClick={() => scroll(-1)}>←</button>
      <button type="button" disabled={!canNext} aria-label="Следующие подборки" onClick={() => scroll(1)}>→</button>
    </div></div>
  </div>;
}
