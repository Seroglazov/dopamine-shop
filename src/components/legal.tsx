import Link from 'next/link';
import { legalDocuments, type LegalDocumentKind } from '../lib/legal-documents';

function DocumentContent({ text }: { text: string }) {
  return <>{text.split(/\n\s*\n/).map((paragraph, index) => {
    const lines = paragraph.split('\n');
    return lines.every(line => line.startsWith('● '))
      ? <ul key={index}>{lines.map((line, item) => <li key={item}>{line.slice(2)}</li>)}</ul>
      : <p key={index}>{paragraph}</p>;
  })}</>;
}

export function LegalPage({ kind }: { kind: LegalDocumentKind }) {
  const document = legalDocuments[kind];
  return (
    <div className="page-wrap legal-page">
      <nav className="breadcrumbs" aria-label="Хлебные крошки"><Link href="/">Главная</Link><span aria-hidden="true">/</span><span>{document.title}</span></nav>
      <header className="legal-heading">
        <span className="eyebrow">{document.label}</span>
        <h1>{document.title}</h1>
      </header>
      <aside className="legal-draft-note" aria-label="Статус документа">
        <span className="legal-draft-dot" aria-hidden="true" />
        <div><strong>Проект документа — реквизиты будут заполнены перед запуском продаж.</strong><p>{kind === 'consent' ? 'Текст предоставлен владельцем сайта и размещён для ознакомления. Просмотр страницы не означает предоставление согласия. Разделы о рассылках, публикации материалов и cookie описывают проект будущих условий; соответствующие функции сейчас не включены.' : 'Оферта ещё не действует. Приём заказов и оплата пока недоступны.'}</p></div>
      </aside>
      <div className="legal-layout">
        <nav className="legal-toc" aria-label="Содержание документа">
          <span className="eyebrow">НА ЭТОЙ СТРАНИЦЕ</span>
          {document.sections.map(section => <a key={section.id} href={`#legal-${section.id}`}>{section.title}</a>)}
        </nav>
        <article className="legal-document">
          <p className="legal-introduction">{document.introduction}</p>
          {document.sections.map(section => <section key={section.id} id={`legal-${section.id}`} aria-labelledby={`legal-heading-${section.id}`}><h2 id={`legal-heading-${section.id}`}>{section.title}</h2><DocumentContent text={section.content} /></section>)}
          {document.footnote && <p className="legal-footnote">{document.footnote}</p>}
          <nav className="legal-related" aria-label="Другие документы"><Link href={kind === 'offer' ? '/consent/' : '/offer/'}>{kind === 'offer' ? 'Согласие на обработку персональных данных' : 'Публичная оферта'}<span aria-hidden="true">↗</span></Link><Link href="/privacy/">Политика конфиденциальности<span aria-hidden="true">↗</span></Link></nav>
        </article>
      </div>
    </div>
  );
}
