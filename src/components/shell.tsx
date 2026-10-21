'use client';
import { ResponsiveImage } from './responsive-image';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStore } from './store';
import { Icon, Logo, Modal, Star } from './ui';
import { MotionSystem } from './motion-system';
import { Footer7 } from '@/components/ui/footer-7';

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
    <div className="announcement"><span>НЕОБЫЧНЫЕ ВЕЩИ ДЛЯ ДОМА</span><span>Декор для дома <Star /></span></div>
    <header className="site-header">
      <Link href="/" aria-label="Dopamine — главная"><Logo /></Link>
      <nav className="desktop-nav" aria-label="Основная навигация">
        <Link href="/catalog/" className={path.includes('catalog') ? 'active' : ''}>Каталог <span>↗</span></Link>
        <Link href="/about/" className={path.includes('about') ? 'active' : ''}>О магазине</Link>
        <Link href="/blog/" className={path.includes('blog') || path.includes('article') ? 'active' : ''}>Блог</Link><Link href="/cooperation/" className={path.includes('cooperation') ? 'active' : ''}>Сотрудничество</Link>
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
    <Footer7 socialLinks={(store.settings?.contacts || []).filter(contact => /^(https:\/\/|mailto:|tel:)/.test(contact.href)).map(contact => ({ href: contact.href, label: contact.label, icon: <Icon name="diagonal" size={15} /> }))} />
    <nav className="mobile-nav" aria-label="Мобильная навигация">{[['/','home','Главная'],['/catalog/','search','Каталог'],['/favorites/','heart','Избранное'],['/account/','user','Профиль']].map(([href, icon, title]) => <Link href={href} key={href} aria-current={currentPath === href ? 'page' : undefined}><Icon name={icon} size={21} /><span>{title}</span></Link>)}</nav>
    <Modal open={menu} close={() => setMenu(false)} title="Меню" className="menu-modal"><Logo /><div className="menu-layout"><nav>{[['Каталог','/catalog/'],['Блог','/blog/'],['Сотрудничество','/cooperation/'],['О магазине','/about/'],['Избранное','/favorites/'],['Контакты','/contacts/']].map(([title, href], i) => <Link href={href} onClick={() => setMenu(false)} key={href}><small>0{i + 1}</small>{title}<Icon name="diagonal" size={40} /></Link>)}</nav><div className="menu-art"><Star /><p>Декор<br /><em>для дома.</em></p></div></div><div className="menu-secondary"><Link href="/account/">Личный кабинет</Link><Link href="/delivery/">Доставка и оплата</Link><Link href="/faq/">Вопросы и ответы</Link></div></Modal>
    <Modal open={search} close={() => setSearch(false)} title="Поиск товаров" className="search-modal"><span className="eyebrow">ПОИСК ПО КАТАЛОГУ</span><h2>Что ищешь?</h2><form action="/catalog/" onSubmit={() => setSearch(false)} className="search-field"><Icon name="search" /><input ref={searchRef} autoFocus name="q" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по каталогу" aria-label="Поиск по каталогу" /><button className="icon-button" type="submit" aria-label="Найти"><Icon name="arrow" /></button></form><div className="search-suggestions" aria-live="polite">{suggestions.map(p => <Link key={p.id} href={`/product/?slug=${p.slug}`} onClick={() => setSearch(false)}><ResponsiveImage src={p.images[0].src} width="48" height="48" alt="" />{p.title}<Icon name="arrow" /></Link>)}{query && suggestions.length === 0 && <p>Ничего не найдено. Попробуй другое название.</p>}{!query && <p>Введи название товара.</p>}</div></Modal>
    <MotionSystem />
  </>;
}
