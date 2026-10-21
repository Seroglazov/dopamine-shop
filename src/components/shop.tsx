'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { Product, Room } from '../lib/models';
import { filterProducts, money, parsePriceInput, startingVariant } from '../js/commerce';
import { useStore } from './store';
import { Breadcrumbs, ButtonLink, Empty, Icon, Modal, SkeletonGrid } from './ui';

function variantColorStyle(color?: string): CSSProperties {
  if (!color) return {};
  const channels = [1, 3, 5].map(start => parseInt(color.slice(start, start + 2), 16) / 255)
    .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  const luminance = .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
  const blackContrast = (luminance + .05) / .05518;
  const whiteContrast = 1.05 / (luminance + .05);
  return { '--variant-color': color, '--variant-ink': blackContrast >= whiteContrast ? '#101010' : '#FFFFFF' } as CSSProperties;
}

export function ProductCard({ product: p }: { product: Product }) {
  const { add, favorite, favorites } = useStore();
  const [image, setImage] = useState(0);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const variant = startingVariant(p);
  const selected = favorites.includes(p.id);
  const preview = p.status === 'preview';
  const href = `/product/?slug=${encodeURIComponent(p.slug)}`;
  return <article className={`product-card ${preview ? 'preview-product' : ''} ${p.photoSource ? 'original-photo-product' : ''}`}>
    <div className="product-media"><Link href={href} data-product-image aria-label={`Смотреть ${p.title}`}><img src={p.images[image].src} srcSet={p.images[image].srcSet} sizes="(max-width: 600px) 46vw, (max-width: 1100px) 28vw, 22vw" alt={p.images[image].alt} width={p.images[image].width} height={p.images[image].height} loading="lazy" decoding="async" />{p.images[1] && <img className="alternate-image" src={p.images[1].src} alt="" width={p.images[1].width} height={p.images[1].height} loading="lazy" />}</Link><button className="favorite-button" aria-label={`${selected ? 'Убрать из избранного' : 'В избранное'}: ${p.title}`} aria-pressed={selected} onClick={() => favorite(p.id)}><Icon name="heart" /></button>{preview ? <span className="product-badge">Скоро</span> : p.isNew ? <span className="product-badge">Новинка</span> : p.featured ? <span className="product-badge">Выбор Dopamine</span> : null}</div>
    
    <div className="image-dots">{p.images.length > 1 && p.images.slice(0, 6).map((_, i) => <button key={i} className={image === i ? 'active' : ''} aria-label={`${p.title}: фото ${i + 1}`} aria-pressed={image === i} onClick={() => setImage(i)} />)}</div>
    <div className="product-copy"><div className={`product-price ${preview ? 'preview-price' : ''}`}><strong>{preview ? 'Цена уточняется' : money(variant.price)}</strong>{variant.compareAtPrice && <del>{money(variant.compareAtPrice)}</del>}</div><Link href={href} className="product-title">{p.title}</Link>{p.rating !== undefined && <span className="product-rating">★ {p.rating}{p.reviewCount !== undefined && <span> · Отзывы: {p.reviewCount}</span>}</span>}<span className="delivery-label">{preview ? 'Скоро в продаже' : p.deliveryLabel || (variant.stock > 0 ? 'В наличии' : 'Пока нет в наличии')}</span>{preview ? <Link href={href} className="button card-buy outline">Подробнее<Icon name="diagonal" size={18} /></Link> : <button className={`button card-buy ${added ? 'is-added' : ''}`} disabled={variant.stock < 1} onClick={() => { add(p.id, variant.id); setAdded(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setAdded(false), 1600); }}>{variant.stock < 1 ? 'Нет в наличии' : added ? 'В корзине' : 'В корзину'}<Icon name={added ? 'check' : 'plus'} size={18} /></button>}</div>
  </article>;
}

export function CatalogPage({ mode = 'catalog' }: { mode?: 'catalog' | 'favorites' | 'category' }) {
  const store = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || params.get('id') || 'all');
  const [sort, setSort] = useState('featured');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [inStock, setInStock] = useState(false);
  const [onlyNew, setOnlyNew] = useState(params.get('new') === '1');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(false);
  const [suggest, setSuggest] = useState(false);
  const filterClose = useRef<HTMLButtonElement>(null);
  const filterToggle = useRef<HTMLButtonElement>(null);
  const searchBox = useRef<HTMLDivElement>(null);
  useEffect(() => { setQuery(params.get('q') || ''); setCategory(params.get('category') || params.get('id') || 'all'); setOnlyNew(params.get('new') === '1'); }, [params]);
  useEffect(() => { setPage(1); }, [query, category, sort, min, max, inStock, onlyNew, mode === 'favorites' ? store.favorites : null]);
  useEffect(() => { if (filters) filterClose.current?.focus(); }, [filters]);
  let priceError = ''; let minPrice: number | null = null; let maxPrice: number | null = null;
  try { minPrice = parsePriceInput(min); maxPrice = parsePriceInput(max); if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) priceError = 'Цена «от» не должна превышать цену «до».'; } catch (e) { priceError = (e as Error).message; }
  const categoryIds = new Set([category, ...store.catalog.categories.filter(c => c.parentId === category).map(c => c.id)]);
  const products = filterProducts(store.catalog.products.filter(p => (category === 'all' || categoryIds.has(p.categoryId)) && (!onlyNew || p.isNew)), { query, sort, minPrice: priceError ? null : minPrice, maxPrice: priceError ? null : maxPrice, inStock, favoritesOnly: mode === 'favorites', favoriteIds: new Set(store.favorites) }) as Product[];
  const pages = Math.ceil(products.length / 12);
  const currentPage = Math.min(page, Math.max(1, pages));
  const categoryTitle = store.catalog.categories.find(c => c.id === category)?.title;
  const title = mode === 'favorites' ? 'Избранное' : mode === 'category' && categoryTitle ? categoryTitle : 'Каталог';
  const suggestions = query.trim() ? store.catalog.products.filter(p => p.title.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))).slice(0, 5) : [];
  const active = Number(category !== 'all') + Number(!!min || !!max) + Number(inStock) + Number(onlyNew);
  const reset = () => { setQuery(''); setCategory('all'); setMin(''); setMax(''); setInStock(false); setOnlyNew(false); setSort('featured'); router.replace(mode === 'favorites' ? '/favorites/' : '/catalog/', { scroll: false }); };
  const closeFilters = () => { setFilters(false); filterToggle.current?.focus(); };
  const selectCategory = (id: string) => { setCategory(id); const next = new URLSearchParams(params.toString()); next.delete('id'); if (id === 'all') next.delete('category'); else next.set('category', id); if (query) next.set('q', query); else next.delete('q'); if (onlyNew) next.set('new', '1'); else next.delete('new'); const queryString = next.toString(); router.replace(`${mode === 'favorites' ? '/favorites/' : '/catalog/'}${queryString ? '?' + queryString : ''}`, { scroll: false }); };
  return <div className="page-wrap catalog-page"><Breadcrumbs items={[{ label: title }]} /><div className="page-heading"><div><span className="eyebrow">ДЕКОР ДЛЯ ДОМА</span><h1>{title}</h1></div></div>
    <div className="catalog-search" ref={searchBox} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setSuggest(false); }}><Icon name="search" /><input value={query} onChange={e => { setQuery(e.target.value); setSuggest(true); }} onFocus={() => setSuggest(true)} onKeyDown={e => { if (e.key === 'Escape') setSuggest(false); }} placeholder="Название или бренд" aria-label="Поиск товаров" aria-controls="catalog-suggestions" aria-expanded={suggest && suggestions.length > 0} />{query && <button className="icon-button" aria-label="Очистить поиск" onClick={() => setQuery('')}><Icon name="close" size={18} /></button>}{suggest && suggestions.length > 0 && <div className="catalog-suggestions" id="catalog-suggestions">{suggestions.map(p => <Link href={`/product/?slug=${p.slug}`} key={p.id}>{p.title}<Icon name="arrow" size={17} /></Link>)}</div>}</div>
    <div className="catalog-layout"><aside className={`catalog-filters ${filters ? 'filters-visible' : ''}`} aria-label="Фильтры товаров"><div className="filter-heading"><b>Фильтры {active > 0 && `· ${active}`}</b><button className="icon-button mobile-only" ref={filterClose} onClick={closeFilters} aria-label="Закрыть фильтры"><Icon name="close" /></button></div><fieldset><legend>Категории</legend><button className={`category-option ${category === 'all' ? 'selected' : ''}`} onClick={() => selectCategory('all')} aria-pressed={category === 'all'}>Все товары <span>{store.catalog.products.length}</span></button>{store.catalog.categories.map(c => <button className={`category-option ${category === c.id ? 'selected' : ''} ${c.parentId ? 'subcategory' : ''}`} key={c.id} onClick={() => selectCategory(c.id)} aria-pressed={category === c.id}>{c.title}</button>)}</fieldset><fieldset><legend>Цена, ₽</legend><div className="price-inputs"><label><span className="sr-only">Цена от</span><input inputMode="decimal" value={min} onChange={e => setMin(e.target.value)} placeholder="От" aria-invalid={!!priceError} aria-describedby={priceError ? 'price-error' : undefined} /></label><span>—</span><label><span className="sr-only">Цена до</span><input inputMode="decimal" value={max} onChange={e => setMax(e.target.value)} placeholder="До" aria-invalid={!!priceError} /></label></div>{priceError && <p className="field-error" id="price-error" role="alert">{priceError}</p>}</fieldset><label className="check-label"><input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} />В наличии</label><label className="check-label"><input type="checkbox" checked={onlyNew} onChange={e => setOnlyNew(e.target.checked)} />Новинки</label>{active > 0 && <button className="text-link reset-filter" onClick={reset}>Сбросить фильтры</button>}<div className="filter-note"><span>✳</span> Используй фильтры,<br />чтобы сузить поиск.</div><button className="button dark mobile-only" onClick={closeFilters}>Показать товары · {products.length}</button></aside>
      <div className="catalog-results"><div className="catalog-toolbar"><button className="filter-toggle button outline" ref={filterToggle} aria-expanded={filters} onClick={() => setFilters(!filters)}><Icon name="filter" size={18} />Фильтры {active > 0 && active}</button><span className="results-count" role="status">Найдено: {products.length}</span><label className="sort-label"><span className="sr-only">Сортировка</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Выбор Dopamine</option><option value="price-asc">Сначала дешевле</option><option value="price-desc">Сначала дороже</option><option value="name">По названию</option></select></label></div>
        {store.status === 'loading' ? <SkeletonGrid /> : store.status === 'error' ? <div className="empty-state"><h2>Не удалось загрузить каталог</h2><p>Проверь подключение и попробуй ещё раз.</p><button className="button dark" onClick={store.retry}>Повторить</button></div> : products.length > 0 ? <><div className="product-grid">{products.slice((currentPage - 1) * 12, currentPage * 12).map(p => <ProductCard product={p} key={p.id} />)}</div>{pages > 1 && <nav className="pagination" aria-label="Страницы каталога">{Array.from({ length: pages }, (_, i) => <button key={i} onClick={() => { setPage(i + 1); document.querySelector('.catalog-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} aria-current={currentPage === i + 1 ? 'page' : undefined}>{i + 1}</button>)}</nav>}</> : category !== 'all' && store.catalog.categories.some(c=>c.id===category) && !store.catalog.products.some(p=>p.categoryId===category) ? <Empty icon="box" title="Собираем коллекцию" href="/catalog/" action="Весь каталог">Товары в категории «{store.catalog.categories.find(c=>c.id===category)?.title}» появятся здесь позже.</Empty> : mode === 'favorites' && !store.favorites.length ? <Empty icon="heart" title="В избранном пока пусто">Нажми на сердечко в карточке товара, чтобы сохранить его здесь.</Empty> : store.catalog.products.length === 0 ? <Empty title="Каталог скоро появится" href="/about/" action="О магазине">Сейчас мы готовим каталог. Здесь появятся фотографии, цены и описание каждого товара.</Empty> : <div className="empty-state"><Icon name="search" size={42} /><h2>Пока ничего не нашлось</h2><p>Попробуй другое название или убери пару фильтров.</p><button className="button dark" onClick={reset}>Сбросить поиск и фильтры</button></div>}
      </div></div></div>;
}

export function ProductPage() {
  const params = useSearchParams();
  const store = useStore();
  const product = store.catalog.products.find(p => p.slug === params.get('slug'));
  if (store.status === 'loading') return <div className="page-wrap"><SkeletonGrid /></div>;
  if (store.status === 'error') return <div className="page-wrap empty-state"><h1>Не удалось загрузить товар</h1><button className="button dark" onClick={store.retry}>Повторить</button></div>;
  if (!product) return <div className="page-wrap"><Breadcrumbs items={[{ label: 'Каталог', href: '/catalog/' }, { label: 'Товар' }]} /><Empty title="Товар пока недоступен">Вернись в каталог, чтобы посмотреть другие товары.</Empty></div>;
  return <ProductDetail key={product.id} product={product} />;
}
function ProductDetail({ product: p }: { product: Product }) {
  const store = useStore();
  const [selected, setSelected] = useState(startingVariant(p).id);
  const [image, setImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const v = p.variants.find(v => v.id === selected)!;
  const category = store.catalog.categories.find(c => c.id === p.categoryId);
  const related = store.catalog.products.filter(other => other.id !== p.id && other.categoryId === p.categoryId).slice(0, 4);
  const isFavorite = store.favorites.includes(p.id);
  const preview = p.status === 'preview';
  return <div className={`page-wrap product-page ${p.photoSource ? 'original-photo-product' : ''}`}><Breadcrumbs items={[{ label: 'Каталог', href: '/catalog/' }, ...(category ? [{ label: category.title, href: `/category/?id=${category.id}` }] : []), { label: p.title }]} /><div className="product-detail"><div className="product-gallery"><button className="gallery-main" style={p.photoSource ? { aspectRatio: `${p.images[image].width} / ${p.images[image].height}` } : undefined} onClick={() => setZoom(true)} aria-label="Увеличить изображение"><img key={image} src={p.images[image].src} srcSet={p.images[image].srcSet} alt={p.images[image].alt} width={p.images[image].width} height={p.images[image].height} fetchPriority="high" /><span><Icon name="plus" /> Увеличить</span></button>{p.images.length > 1 && <div className="gallery-thumbs">{p.images.map((photo, i) => <button key={i} aria-label={`Изображение ${i + 1}`} aria-pressed={image === i} onClick={() => setImage(i)}><img src={photo.src} alt="" width="88" height="88" loading="lazy" /></button>)}</div>}</div><div className="product-info"><span className="eyebrow">{p.brand || 'DOPAMINE'}</span><h1>{p.title}</h1>{p.rating !== undefined && <p className="product-rating">★ {p.rating} {p.reviewCount !== undefined && `· Отзывы: ${p.reviewCount}`}</p>}<div className={`detail-price ${preview ? 'preview-price' : ''}`}><strong>{preview ? 'Цена уточняется' : money(v.price)}</strong>{v.compareAtPrice && <del>{money(v.compareAtPrice)}</del>}</div><p className={`stock-label ${v.stock ? '' : 'sold-out'}`}><i />{preview ? 'Скоро в продаже' : v.stock > 0 ? 'В наличии' : 'Пока нет в наличии'}</p><fieldset className="variant-fieldset"><legend>Размер и цвет</legend><div>{p.variants.map(variant => <button key={variant.id} className="variant-button" style={variantColorStyle(variant.color)} aria-pressed={selected === variant.id} onClick={() => setSelected(variant.id)}><span className="variant-color-dot" aria-hidden="true" /><span className="variant-label">{variant.label}</span><span className="variant-check" aria-hidden="true"><Icon name="check" size={15} /></span>{!preview && variant.stock === 0 && <small>нет в наличии</small>}</button>)}</div></fieldset><div className="buy-row"><button className="button pink" disabled={preview || v.stock < 1} onClick={() => store.add(p.id, v.id)}>{preview ? 'Скоро в продаже' : 'Добавить в корзину'}<Icon name="bag" /></button><button className="icon-button favorite-detail" aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'} aria-pressed={isFavorite} onClick={() => store.favorite(p.id)}><Icon name="heart" /></button></div>{p.deliveryLabel && <p className="delivery-line"><Icon name="box" />{p.deliveryLabel}</p>}<p className="detail-description">{p.description}</p><details open><summary>Подробности<Icon name="plus" /></summary>{p.specifications && Object.keys(p.specifications).length > 0 ? <dl className="specifications">{Object.entries(p.specifications).map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl> : <p>Дополнительные характеристики пока не добавлены.</p>}</details><details><summary>Доставка и возврат<Icon name="plus" /></summary><p>{store.settings?.deliveryText || 'Условия доставки будут опубликованы перед запуском продаж.'}</p>{store.settings?.returnsText && <p>{store.settings.returnsText}</p>}<Link href="/delivery/" className="text-link">Подробнее ↗</Link></details></div></div>{related.length > 0 && <section className="related-section"><div className="section-heading"><h2>Похожие <em>товары</em></h2><Link href="/catalog/" className="text-link">В каталог ↗</Link></div><div className="product-grid home-products">{related.map(p => <ProductCard product={p} key={p.id} />)}</div></section>}<Modal open={zoom} close={() => setZoom(false)} title={`Изображение: ${p.title}`} className="zoom-modal"><img src={p.images[image].src} alt={p.images[image].alt} width={p.images[image].width} height={p.images[image].height} />{p.images.length > 1 && <div className="zoom-controls"><button className="icon-button" aria-label="Предыдущее фото" onClick={() => setImage((image + p.images.length - 1) % p.images.length)}>←</button><span>{image + 1} / {p.images.length}</span><button className="icon-button" aria-label="Следующее фото" onClick={() => setImage((image + 1) % p.images.length)}>→</button></div>}</Modal></div>;
}

export function RoomView({ room }: { room: Room }) {
  const { catalog } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  return <div className="shoppable-room"><img src={room.image.src} alt={room.image.alt} width={room.image.width} height={room.image.height} loading="lazy" />{room.markers.map((marker, i) => { const p = catalog.products.find(p => p.id === marker.productId); return p && <div className="room-hotspot" style={{ left: `${marker.x}%`, top: `${marker.y}%` }} key={i}><button className="hotspot-button" onClick={() => setSelected(selected === p.id ? null : p.id)} aria-label={`Показать ${p.title}`} aria-expanded={selected === p.id}><Icon name="plus" size={18} /></button>{selected === p.id && <Link className="hotspot-label" href={`/product/?slug=${p.slug}`}>{p.title}<b>{money(startingVariant(p).price)}</b><Icon name="arrow" size={18} /></Link>}</div>; })}</div>;
}
