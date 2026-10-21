'use client';
import { ResponsiveImage } from './responsive-image';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { journalArticles } from '../lib/journal';
import { Breadcrumbs, ButtonLink, Icon } from './ui';
import { FigmaShape } from './figma-shape';

export function BlogPage() {
  const [topic, setTopic] = useState('Все');
  const articles = journalArticles.filter(article => topic === 'Все' || article.category === topic);
  return <div className="page-wrap journal-page"><Breadcrumbs items={[{ label: 'Блог' }]} />
    <header className="journal-heading"><div><span className="eyebrow">DOPAMINE / ЖУРНАЛ</span><h1>Есть что<br /><em>рассмотреть.</em></h1></div><p>Цвет, материалы и маленькие перемены.<br />Идеи для дома и вещей, которые рядом.</p><FigmaShape kind="clover" className="journal-shape" /></header>
    <div className="journal-topics" role="group" aria-label="Темы блога">{['Все','Декор','Материалы','Цвет'].map(label => <button key={label} onClick={() => setTopic(label)} aria-pressed={topic === label}>{label}</button>)}</div>
    <div className="journal-grid" aria-live="polite">{articles.map((article,i) => <article key={article.slug} className={i === 0 ? 'journal-card journal-feature' : 'journal-card'}><Link href={`/article/?slug=${article.slug}`} className="journal-image" aria-label={`Читать: ${article.title}`}><ResponsiveImage src={article.image} alt={article.title} width="960" height="960" loading={i === 0 ? 'eager' : 'lazy'} /></Link><div className="journal-copy"><span className="eyebrow">{article.category} / Редакция Dopamine</span><h2><Link href={`/article/?slug=${article.slug}`}>{article.title}</Link></h2><p>{article.subtitle}</p><Link href={`/article/?slug=${article.slug}`} className="text-link">Читать материал<Icon name="diagonal" size={18} /></Link></div></article>)}</div>
    <div className="journal-end"><p>От идеи — к предмету.</p><ButtonLink href="/catalog/" variant="dark">Смотреть каталог</ButtonLink></div>
  </div>;
}

export function ArticlePage() {
  const params = useSearchParams();
  const article = journalArticles.find(item => item.slug === params.get('slug'));
  if (!article) return <div className="page-wrap empty-state"><h1>Материал не найден</h1><ButtonLink href="/blog/" variant="dark">Вернуться в блог</ButtonLink></div>;
  const minutes = Math.max(1, Math.ceil((article.lead+' '+article.sections.map(s=>s.text).join(' ')).split(/\s+/).length / 180));
  return <div className="page-wrap journal-article"><Breadcrumbs items={[{ label: 'Блог', href: '/blog/' },{ label: article.category }]} /><header><span className="eyebrow">{article.category} / {minutes} мин чтения / Редакция Dopamine</span><h1>{article.title}</h1><p>{article.subtitle}</p></header><figure className="article-cover"><ResponsiveImage src={article.image} alt={article.title} width="960" height="960" fetchPriority="high" /></figure><div className="article-layout"><aside><span className="eyebrow">В ЭТОМ МАТЕРИАЛЕ</span><nav aria-label="Содержание статьи">{article.sections.map((section,i)=><a key={section.title} href={`#article-${i}`}>{section.title}<Icon name="arrow" size={16} /></a>)}</nav></aside><article className="article-body"><p className="article-lead">{article.lead}</p>{article.sections.map((section,i)=><section id={`article-${i}`} key={section.title}><span className="eyebrow">0{i+1}</span><h2>{section.title}</h2><p>{section.text}</p></section>)}<div className="article-product"><span className="eyebrow">DOPAMINE / ДЕТАЛИ</span><h2>Рассмотри поближе.</h2><ButtonLink href={`/product/?slug=${article.productSlug}`} variant="pink">Смотреть товар</ButtonLink></div></article></div><Link href="/blog/" className="text-link">← Все материалы</Link></div>;
}
