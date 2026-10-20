'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <div className="page-wrap"><div className="empty-state"><span className="eyebrow">НЕБОЛЬШАЯ ПАУЗА</span><h1>Что-то пошло не по плану.</h1><p>Попробуй открыть страницу ещё раз. Сохранённая корзина останется в браузере.</p><button className="button dark" onClick={reset}>Попробовать снова</button><Link href="/" className="text-link">На главную ↗</Link></div></div>;
}
