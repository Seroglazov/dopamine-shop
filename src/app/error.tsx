'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <div className="page-wrap"><div className="empty-state"><span className="eyebrow">ОШИБКА ЗАГРУЗКИ</span><h1>Не удалось открыть страницу</h1><p>Попробуй ещё раз или вернись на главную страницу.</p><button className="button dark" onClick={reset}>Попробовать снова</button><Link href="/" className="text-link">На главную ↗</Link></div></div>;
}
