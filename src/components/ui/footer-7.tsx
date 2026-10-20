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
  { title: 'Исследовать', links: [{ name: 'Весь каталог', href: '/catalog/' }, { name: 'Избранное', href: '/favorites/' }, { name: 'Мир Dopamine', href: '/about/' }] },
  { title: 'Покупателям', links: [{ name: 'Доставка и оплата', href: '/delivery/' }, { name: 'Вопросы и ответы', href: '/faq/' }, { name: 'Контакты', href: '/contacts/' }] },
  { title: 'Личное пространство', links: [{ name: 'Мой профиль', href: '/account/' }, { name: 'Мои заказы', href: '/orders/' }, { name: 'Корзина', href: '/cart/' }] },
];

/** Adapted from the supplied Footer7: real brand assets, routes and optional contacts. */
export function Footer7({
  logo = { url: '/', src: '/assets/logo-wordmark.svg', alt: 'Dopamine', title: 'Dopamine — главная' },
  sections = defaultSections,
  description = 'Предметы с характером. Для дома, в котором можно быть собой.',
  socialLinks = [],
  copyright = `© ${new Date().getFullYear()} Dopamine`,
  legalLinks = [{ name: 'Конфиденциальность', href: '/privacy/' }],
}: Footer7Props) {
  return <footer className="footer-seven" aria-label="Подвал сайта">
    <div className="footer7-invitation">
      <div><span className="eyebrow">MAKE ROOM FOR JOY</span><h2>Пусть дома будет<br /><em>больше тебя.</em></h2></div>
      <ButtonLink href="/catalog/" variant="lime">Найти свой дофамин</ButtonLink>
      <FigmaShape kind="orbit" className="footer7-orbit" />
    </div>
    <div className="footer7-main">
      <div className="footer7-brand">
        <Link href={logo.url} title={logo.title} aria-label={logo.title}><img className="footer7-logo" src={logo.src} width="1442" height="360" alt={logo.alt} /></Link>
        <p>{description}</p>
        <Link href="/about/" className="footer7-brand-link">Познакомиться поближе<Icon name="diagonal" size={15} /></Link>
        {socialLinks.length > 0 && <ul className="footer7-socials" aria-label="Связаться с Dopamine">{socialLinks.map(social => <li key={social.href}><a href={social.href} aria-label={social.label}>{social.icon}<span>{social.label}</span></a></li>)}</ul>}
      </div>
      <div className="footer7-columns">{sections.map(section => <nav key={section.title} aria-label={section.title}><h3>{section.title}</h3><ul>{section.links.map(link => <li key={link.href}><Link href={link.href}>{link.name}<span aria-hidden="true">↗</span></Link></li>)}</ul></nav>)}</div>
    </div>
    <div className="footer7-bottom"><p>{copyright}<span> · </span>С характером. С любовью.</p><nav aria-label="Правовая информация">{legalLinks.map(link => <Link href={link.href} key={link.href}>{link.name}</Link>)}</nav><a className="footer7-top" href="#main">Наверх<Icon name="arrow" size={15} /></a></div>
  </footer>;
}
