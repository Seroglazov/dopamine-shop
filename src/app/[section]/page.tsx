import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogPage, ProductPage } from '../../components/shop';
import { AccountPage, AuthPage, CartPage, CheckoutPage } from '../../components/buyer';
import { InformationPage } from '../../components/information';

const titles: Record<string, string> = { catalog: 'Каталог', category: 'Категория', product: 'Товар', favorites: 'Избранное', cart: 'Корзина', checkout: 'Оформление заказа', account: 'Личный кабинет', orders: 'Мои заказы', login: 'Вход', register: 'Регистрация', about: 'О магазине', contacts: 'Контакты', delivery: 'Доставка и оплата', faq: 'Вопросы и ответы', privacy: 'Политика конфиденциальности' };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(titles).map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> { const { section } = await params; return { title: titles[section], robots: ['account','orders','checkout','login','register','cart','favorites'].includes(section) ? { index: false, follow: false } : undefined }; }
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!titles[section]) notFound();
  let content;
  if (section === 'catalog' || section === 'favorites' || section === 'category') content = <CatalogPage mode={section} />;
  else if (section === 'product') content = <ProductPage />;
  else if (section === 'cart') content = <CartPage />;
  else if (section === 'checkout') content = <CheckoutPage />;
  else if (section === 'account' || section === 'orders') content = <AccountPage orders={section === 'orders'} />;
  else if (section === 'login' || section === 'register') content = <AuthPage register={section === 'register'} />;
  else content = <InformationPage section={section} />;
  return <Suspense fallback={<div className="page-wrap loading-line">Загружаем страницу…</div>}>{content}</Suspense>;
}
