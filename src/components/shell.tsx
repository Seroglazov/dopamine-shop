'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore } from './store';
import { ButtonLink, Icon, Logo, Modal, Star } from './ui';
import { MotionSystem } from './motion-system';
import { FigmaShape } from './figma-shape';

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const currentPath = path.endsWith('/') ? path : path + '/';
  const router = useRouter();
  const store = useStore();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setMenu(false); setSearch(false); }, [path]);
  useEffect(() => {
    // Keep already-shared links from the previous site working.
    const hash = location.hash;
    if (hash.startsWith('#product/')) router.replace('/product/?slug=' + encodeURIComponent(hash.slice(9)));
    else if (['#catalog', '#about', '#contacts'].includes(hash)) router.replace('/' + hash.slice(1) + '/');
  }, [router]);
  const suggestions = query.trim() ? store.catalog.products.filter(p => p.title.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))).slice(0, 5) : [];
  return <>
    <a href="#main" className="skip-link">К содержимому</a>
    <div className="announcement"><span>БОЛЬШЕ ЦВЕТА. БОЛЬШЕ ТЕБЯ.</span><span>Objects for happy living <Star /></span></div>
    <header className="site-header">
      <Link href="/" aria-label="Dopamine — главная"><Logo /></Link>
      <nav className="desktop-nav" aria-label="Основная навигация">
        <Link href="/catalog/" className={path.includes('catalog') ? 'active' : ''}>Каталог <span>↗</span></Link>
        <Link href="/about/" className={path.includes('about') ? 'active' : ''}>Мир Dopamine</Link>
        <Link href="/delivery/">Доставка</Link>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Поиск" onClick={() => setSearch(true)}><Icon name="search" /></button>
        <Link className="icon-button hide-small" href="/account/" aria-label="Личный кабинет"><Icon name="user" /></Link>
        <Link className="icon-button hide-small" href="/favorites/" aria-label={`Избранное: ${store.favorites.length}`}><Icon name="heart" />{store.favorites.length > 0 && <span className="count">{store.favorites.length}</span>}</Link>
        <Link className="bag-button" href="/cart/" aria-label={`Корзина: ${store.summary.count}`}><Icon name="bag" /><span className="bag-label">Корзина</span><b key={store.summary.count}>{store.summary.count}</b></Link>
        <button className="icon-button" aria-label="Открыть меню" aria-expanded={menu} onClick={() => setMenu(true)}><Icon name="menu" /></button>
      </div>
    </header>
    <main id="main" tabIndex={-1} className="route-view" key={path}>{children}</main>
    <footer className="site-footer">
      <div className="footer-top"><div><span className="eyebrow">ПУСТЬ ДОМ РАДУЕТ</span><h2>Хорошее настроение.<br /><em>На постоянной основе.</em></h2></div><ButtonLink href="/catalog/" variant="lime">Найти своё</ButtonLink></div>
      <div className="footer-links"><p>Необычный декор.<br />Обыкновенное счастье.</p><div><span>Исследовать</span><Link href="/catalog/">Каталог</Link><Link href="/favorites/">Избранное</Link><Link href="/about/">О Dopamine</Link></div><div><span>Покупателям</span><Link href="/delivery/">Доставка и оплата</Link><Link href="/faq/">Вопросы и ответы</Link><Link href="/contacts/">Контакты</Link></div><div><span>Личное пространство</span><Link href="/account/">Мой профиль</Link><Link href="/orders/">Мои заказы</Link><Link href="/privacy/">Конфиденциальность</Link></div></div>
      <Link href="/" className="footer-wordmark" aria-label="Dopamine — на главную"><Logo white /><FigmaShape kind="orbit" className="footer-figma" /></Link>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} DOPAMINE</span><span>С характером. С любовью. Для тебя.</span><a href="#main">Наверх ↑</a></div>
    </footer>
    <nav className="mobile-nav" aria-label="Мобильная навигация">{[['/','home','Главная'],['/catalog/','search','Каталог'],['/favorites/','heart','Избранное'],['/account/','user','Профиль']].map(([href, icon, title]) => <Link href={href} key={href} aria-current={currentPath === href ? 'page' : undefined}><Icon name={icon} size={21} /><span>{title}</span></Link>)}</nav>
    <Modal open={menu} close={() => setMenu(false)} title="Меню" className="menu-modal"><Logo /><div className="menu-layout"><nav>{[['Каталог','/catalog/'],['Мир Dopamine','/about/'],['Избранное','/favorites/'],['Контакты','/contacts/']].map(([title, href], i) => <Link href={href} onClick={() => setMenu(false)} key={href}><small>0{i + 1}</small>{title}<Icon name="diagonal" size={40} /></Link>)}</nav><div className="menu-art"><Star /><p>make room<br />for <em>joy.</em></p></div></div><div className="menu-secondary"><Link href="/account/">Личный кабинет</Link><Link href="/delivery/">Доставка и оплата</Link><Link href="/faq/">FAQ</Link></div></Modal>
    <Modal open={search} close={() => setSearch(false)} title="Поиск товаров" className="search-modal"><span className="eyebrow">НАЙДИ СВОЙ ДОФАМИН</span><h2>Что тебя порадует?</h2><form action="/catalog/" onSubmit={() => setSearch(false)} className="search-field"><Icon name="search" /><input ref={searchRef} autoFocus name="q" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по каталогу" aria-label="Поиск по каталогу" /><button className="icon-button" type="submit" aria-label="Найти"><Icon name="arrow" /></button></form><div className="search-suggestions" aria-live="polite">{suggestions.map(p => <Link key={p.id} href={`/product/?slug=${p.slug}`} onClick={() => setSearch(false)}><img src={p.images[0].src} width="48" height="48" alt="" />{p.title}<Icon name="arrow" /></Link>)}{query && suggestions.length === 0 && <p>Совпадений пока нет. Попробуй другое название.</p>}{!query && <p>Ищи по названию, бренду или описанию.</p>}</div></Modal>
    <MotionSystem />
  </>;
}
