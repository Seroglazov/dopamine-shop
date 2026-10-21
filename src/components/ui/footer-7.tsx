import { ResponsiveImage } from '../responsive-image';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { ButtonLink, Icon } from '../ui';
import { FigmaShape } from '../figma-shape';

export interface Footer7Props {
  logo?: { url: string; src: string; alt: string; title: string };
  sections?: Array<{ title: string; links: Array<{ name: string; href: string }> }>;
  description?: string;
  socialLinks?: Array<{ icon: ReactElement; href: string; label: string }>;
  copyright?: string;
  legalLinks?: Array<{ name: string; href: string }>;
}
const defaultSections = [
  { title: 'Каталог', links: [{ name: 'Весь каталог', href: '/catalog/' }, { name: 'Избранное', href: '/favorites/' }, { name: 'О магазине', href: '/about/' }, { name: 'Блог', href: '/blog/' }] },
  { title: 'Покупателям', links: [{ name: 'Доставка и оплата', href: '/delivery/' }, { name: 'Как заказать', href: '/faq/' }, { name: 'Контакты', href: '/contacts/' }, { name: 'Сотрудничество', href: '/cooperation/' }] },
  { title: 'Личный кабинет', links: [{ name: 'Мой профиль', href: '/account/' }, { name: 'Мои заказы', href: '/orders/' }, { name: 'Корзина', href: '/cart/' }] },
];

/** Adapted from the supplied Footer7: real brand assets, routes and optional contacts. */
export function Footer7({
  logo = { url: '/', src: '/assets/logo-wordmark.svg', alt: 'Dopamine', title: 'Dopamine — главная' },
  sections = defaultSections,
  description = 'Магазин необычного декора для дома: выбираем яркие цвета и интересные формы.',
  socialLinks = [],
  copyright = `© ${new Date().getFullYear()} Dopamine`,
  legalLinks = [{ name: 'Публичная оферта', href: '/offer/' }, { name: 'Согласие на обработку персональных данных', href: '/consent/' }, { name: 'Политика конфиденциальности', href: '/privacy/' }],
}: Footer7Props) {
  return <footer className="footer-seven" aria-label="Подвал сайта">
    <div className="footer7-invitation">
      <div><span className="eyebrow">ДЕКОР ДЛЯ ДОМА</span><h2>Что добавим<br /><em>в твой дом?</em></h2></div>
      <ButtonLink href="/catalog/" variant="lime">Смотреть каталог</ButtonLink>
      <FigmaShape kind="orbit" className="footer7-orbit" />
    </div>
    <div className="footer7-main">
      <div className="footer7-brand">
        <Link href={logo.url} title={logo.title} aria-label={logo.title}><ResponsiveImage className="footer7-logo" src={logo.src} width="1442" height="360" alt={logo.alt} /></Link>
        <p>{description}</p>
        <Link href="/about/" className="footer7-brand-link">О магазине<Icon name="diagonal" size={15} /></Link>
        {socialLinks.length > 0 && <ul className="footer7-socials" aria-label="Связаться с Dopamine">{socialLinks.map(social => <li key={social.href}><a href={social.href} aria-label={social.label}>{social.icon}<span>{social.label}</span></a></li>)}</ul>}
      </div>
      <div className="footer7-columns">{sections.map(section => <nav key={section.title} aria-label={section.title}><h3>{section.title}</h3><ul>{section.links.map(link => <li key={link.href}><Link href={link.href}>{link.name}<span aria-hidden="true">↗</span></Link></li>)}</ul></nav>)}</div>
    </div>
    <div className="footer7-bottom"><p>{copyright}<span> · </span>Декор для дома.</p><nav aria-label="Правовая информация">{legalLinks.map(link => <Link href={link.href} key={link.href}>{link.name}</Link>)}</nav><a className="footer7-top" href="#main">Наверх<Icon name="arrow" size={15} /></a></div>
  </footer>;
}
