'use client';
import { ResponsiveImage } from './responsive-image';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';

export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    diagonal: <path d="M6 18 18 6M6 6h12v12" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 8h16M4 16h16" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    filter: <><path d="M4 7h16M4 17h16" /><circle cx="8" cy="7" r="2" /><circle cx="16" cy="17" r="2" /></>,
    check: <path d="m4 12 5 5L20 6" />,
    box: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z M3 8l9 5 9-5M12 13v9M7 5.8l9 5V15" /></>,
    chevron: <path d="m8 4 8 8-8 8" />,
    home: <><path d="m2 11 10-8 10 8M5 9v12h14V9M9 21v-7h6v7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>;
}
export function Star({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="m50 0 9 28L82 9l-4 30 22 11-28 9 19 23-30-4-11 22-9-28L18 91l4-30L0 50l28-9L9 18l30 4Z" /></svg>;
}
export function Logo({ white = false, className = '' }: { white?: boolean; className?: string }) {
  return <ResponsiveImage className={`logo ${white ? 'logo-white' : ''} ${className}`} src="/assets/logo-wordmark.svg" width="1442" height="360" alt="Dopamine" loading="eager" />;
}
export function ButtonLink({ href, children, variant = '', className = '' }: { href: string; children: ReactNode; variant?: string; className?: string }) {
  return <Link className={`button ${variant} ${className}`} href={href} data-magnetic>{children}<Icon name="diagonal" size={19} /></Link>;
}
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link>{items.map((item, i) => <span key={i}><span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav>;
}
export function Empty({ icon = 'box', title, children, href = '/catalog/', action = 'В каталог' }: { icon?: string; title: string; children: ReactNode; href?: string; action?: string }) {
  return <div className="empty-state"><div className="empty-symbol"><Icon name={icon} size={38} /><Star /></div><h2>{title}</h2><p>{children}</p><ButtonLink href={href} variant="dark">{action}</ButtonLink></div>;
}
export function Modal({ open, close, title, children, className = '' }: { open: boolean; close: () => void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current; if (!dialog) return;
    const trigger = document.activeElement as HTMLElement;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (open) { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; trigger?.focus(); }; }
  }, [open]);
  return <dialog ref={ref} className={`modal ${className}`} aria-label={title} onCancel={close} onClick={e => { if (e.target === e.currentTarget) close(); }}><button className="icon-button modal-close" aria-label="Закрыть" onClick={close}><Icon name="close" /></button>{children}</dialog>;
}
export function SkeletonGrid() { return <div className="product-grid" aria-label="Загрузка каталога" aria-busy="true">{Array.from({ length: 8 }, (_, i) => <div className="skeleton-card" key={i}><div /><span /><span /></div>)}</div>; }
