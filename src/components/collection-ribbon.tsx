'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { collections } from '../lib/collections';
import { useStore } from './store';
import { Icon } from './ui';

export function CollectionRibbon({ activeId }: { activeId?: string }) {
  const { catalog } = useStore();
  const track = useRef<HTMLDivElement>(null);
  return <div className="collection-ribbon">
    <div className="collection-ribbon-tools"><span>Найди своё настроение</span><div>
      <button type="button" aria-label="Предыдущие подборки" onClick={() => track.current?.scrollBy({ left: -320, behavior: 'smooth' })}>←</button>
      <button type="button" aria-label="Следующие подборки" onClick={() => track.current?.scrollBy({ left: 320, behavior: 'smooth' })}>→</button>
    </div></div>
    <div className="collection-ribbon-track" ref={track} role="region" aria-label="Подборки товаров" tabIndex={0}>
      {collections.map(collection => {
        const cover = catalog.products.find(product => product.id === collection.coverId)?.images[0];
        return <Link key={collection.id} className="collection-tile" href={`/catalog/?collection=${collection.id}`} aria-current={activeId === collection.id ? 'page' : undefined}>
          <div className="collection-tile-art" style={{ backgroundColor: collection.color }}>
            <span className="collection-tile-index">DOPAMINE / 0{collections.indexOf(collection) + 1}</span>
            {cover && <img src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} loading="lazy" />}
            <span className="collection-tile-arrow"><Icon name="diagonal" size={22} /></span>
          </div><h3>{collection.title}</h3><p>{collection.note}</p>
        </Link>;
      })}
    </div>
  </div>;
}
