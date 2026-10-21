'use client';
import { ResponsiveImage } from './responsive-image';

import Link from 'next/link';
import { useStore } from './store';
import { ButtonLink, Icon, Star } from './ui';
import { ProductCard, RoomView } from './shop';
import { money, startingVariant } from '../js/commerce';
import { CollectionRibbon } from './collection-ribbon';
import { HeroDecor } from './hero-decor';
import { BuyersSection } from './buyers';
import { FigmaShape } from './figma-shape';
import { journalArticles } from '../lib/journal';

export function Home() {
  const { catalog } = useStore();
  const featured = catalog.products.filter(p => p.featured && p.status !== 'preview').slice(0, 8);
  const newProducts = catalog.products.filter(p => p.isNew).slice(0, 4);
  return <>
    <section className="hero marketplace-home">
      <div className="marketplace-hero" aria-labelledby="marketplace-heading">
        <div className="marketplace-copy"><span className="eyebrow">НАХОДКИ ДЛЯ ДОМА И ДЛЯ ТЕБЯ</span><h1 id="marketplace-heading">Dopamine —<br />твой дофаминовый<br />маркетплейс</h1><p>Яркий декор, необычные формы и вещи,<br className="marketplace-break" /> которые делают каждый день приятнее.</p><ButtonLink href="/catalog/" variant="dark">Смотреть каталог</ButtonLink></div>
        <HeroDecor />
        <span className="marketplace-signature" aria-hidden="true">ЦВЕТ. ФОРМА. ТВОЁ НАСТРОЕНИЕ.</span>
      </div>
      <section className="home-curation" aria-labelledby="home-curation-title"><span className="eyebrow">ПОДБОРКИ ДЛЯ ТВОЕГО ДОМА</span><h2 id="home-curation-title">Твоя реальность —<br /><em>ярче, чем ты думаешь!</em></h2><CollectionRibbon /></section>
    </section>
    <Marquee />
    {catalog.products.some(p => p.visualization) && <section className="section first-collection" data-reveal><div className="section-heading"><div><span className="eyebrow">КОЛЛЕКЦИЯ DOPAMINE</span><h2>Уже обретают <em>форму.</em></h2></div><ButtonLink href="/catalog/" variant="outline">В каталог</ButtonLink></div><p className="first-collection-note">Цветные детали для дома и вещей, которые рядом.</p><div className="product-grid home-products">{catalog.products.filter(p=>p.visualization).slice(0,4).map(p=><ProductCard key={p.id} product={p} />)}</div></section>}
    {featured.length > 0 && <section className="section floating-showcase" data-reveal><div className="floating-heading"><span className="eyebrow">ИЗ НАШЕЙ КОЛЛЕКЦИИ</span><h2>Декор, который<br /><em>хочется рассмотреть.</em></h2><p>Фотографии, цены и подробности —<br />в карточке каждого товара.</p></div><div className="floating-objects">{featured.slice(0,3).map((p,i) => <Link className={`floating-product floating-${i}`} href={`/product/?slug=${p.slug}`} key={p.id} data-product-image><ResponsiveImage src={p.images[0].src} alt={p.images[0].alt} width={p.images[0].width} height={p.images[0].height} loading="lazy" /><span><b>{p.title}</b><small>{money(startingVariant(p).price)}</small><Icon name="diagonal" size={19} /></span></Link>)}</div><Star className="floating-star" /></section>}
    <section className="section explore-section" data-reveal><div className="section-heading"><div><span className="eyebrow">КАТЕГОРИИ</span><h2>Что <em>ищешь?</em></h2></div><Link href="/catalog/" className="text-link">Смотреть весь каталог <Icon name="arrow" size={17} /></Link></div>
      {catalog.categories.length > 0 ? <div className="category-list">{catalog.categories.filter(c => !c.parentId).map((c, i) => { const image = catalog.products.find(p => p.categoryId === c.id)?.images[0]; return <Link href={`/category/?id=${encodeURIComponent(c.id)}`} key={c.id} className="category-row"><span>0{i + 1}</span><h3>{c.title}</h3>{image && <ResponsiveImage src={image.src} alt={image.alt} width="150" height="150" loading="lazy" />}<Icon name="diagonal" size={34} /></Link>; })}</div> : <div className="catalog-teaser"><div className="teaser-graphic teaser-cool-shapes" aria-hidden="true"><i /><FigmaShape kind="clover" className="teaser-clover shape-drift" /><FigmaShape kind="pillow" className="teaser-pillow" /></div><div><span className="eyebrow">ГОТОВИМ КАТАЛОГ</span><h3>Собираем<br />первую коллекцию.</h3><p>Скоро добавим товары: с фотографиями, описанием и ценами.</p><ButtonLink href="/catalog/" variant="outline">Перейти в каталог</ButtonLink></div><span className="sticker">скоро<br />здесь ✳</span></div>}
    </section>
    {featured.length > 0 && <section className="section horizontal-section"><div className="section-heading"><div><span className="eyebrow">ВЫБОР DOPAMINE</span><h2>Посмотри,<br /><em>что мы выбрали.</em></h2></div><ButtonLink href="/catalog/" variant="outline">Все товары</ButtonLink></div><div className="horizontal-viewport"><div className="horizontal-track">{featured.map(p => <ProductCard product={p} key={p.id} />)}</div></div></section>}
    <section className="story" aria-label="Как декор меняет комнату"><div className="story-stage"><FigmaShape kind="petal" className="story-petal" /><div className="story-text"><span className="eyebrow">КАК ДЕКОР МЕНЯЕТ КОМНАТУ · 01—03</span><div className="story-titles"><h2 className="story-copy-1">Хочется<br /><em>перемен?</em></h2><h2 className="story-copy-2">Начни<br /><em>с цвета.</em></h2><h2 className="story-copy-3">Уже<br /><em>по-другому.</em></h2></div><p>Посмотри, как цвет и несколько деталей<br />меняют вид комнаты.</p><ButtonLink href="/about/" variant="dark">О магазине</ButtonLink></div><div className="room-illustration" aria-label="Комната до и после добавления цвета"><div className="room-wall" /><div className="room-floor" /><div className="room-window" /><div className="room-plinth" /><div className="room-extra room-circle" /><div className="room-extra room-poster"><Star /></div><div className="room-extra room-squiggle" /><span className="room-caption">НАСТРОЕНИЕ ДОМА</span></div></div></section>
    {newProducts.length > 0 && <section className="section"><div className="section-heading"><div><span className="eyebrow">ТОЛЬКО ПОЯВИЛИСЬ</span><h2>Новинки <em>магазина</em></h2></div><Link href="/catalog/?new=1" className="text-link">Все новинки ↗</Link></div><div className="product-grid home-products">{newProducts.map(p => <ProductCard product={p} key={p.id} />)}</div></section>}
    {catalog.rooms.map(room => <section className="section" key={room.id}><div className="section-heading"><div><span className="eyebrow">ДЕКОР В ИНТЕРЬЕРЕ</span><h2>{room.title}</h2></div><p>Нажми на отметку,<br />чтобы посмотреть товар.</p></div><RoomView room={room} /></section>)}
    <section className="manifesto section" data-reveal><span className="eyebrow">ДЛЯ ТВОЕГО ДОМА</span><div className="manifesto-type">Выбирай<br />то, что <span>нравится<FigmaShape kind="flower" className="manifesto-figma" /></span></div><div className="manifesto-bottom"><p>Можно начать с одной вещи.<br />Посмотри, что есть в каталоге.</p><ButtonLink href="/catalog/" variant="lime">Выбрать декор</ButtonLink></div></section>
    <Marquee reverse />
    <section className="section home-journal" data-reveal><div className="section-heading"><div><span className="eyebrow">БЛОГ DOPAMINE</span><h2>Цвет, форма <em>и идеи.</em></h2></div><Link href="/blog/" className="text-link">Все материалы ↗</Link></div><div className="journal-mini">{journalArticles.map(article=><Link key={article.slug} href={`/article/?slug=${article.slug}`}><ResponsiveImage src={article.image} width="960" height="960" alt={article.title} loading="lazy" /><span className="eyebrow">{article.category}</span><h3>{article.title}</h3><span className="text-link">Читать ↗</span></Link>)}</div></section>
    <BuyersSection />
  </>;
}
export function Marquee({ reverse = false }: { reverse?: boolean }) { return <div className={`marquee ${reverse ? 'reverse' : ''}`} aria-label={reverse ? 'Декор для дома. Выбирай то, что нравится.' : 'Dopamine. Цвет, форма, декор.'}><div aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <span key={i}>{reverse ? 'ДЕКОР ДЛЯ ДОМА' : 'DOPAMINE'}<Star />{reverse ? 'ВЫБИРАЙ ТО, ЧТО НРАВИТСЯ' : 'ЦВЕТ, ФОРМА, ДЕКОР'}<Star /></span>)}</div></div>; }
