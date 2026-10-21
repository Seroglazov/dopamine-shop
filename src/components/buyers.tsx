import Link from 'next/link';
import { buyerQuestions } from '../lib/buyers';
import { Icon, Star } from './ui';

export function BuyersSection() {
  return (
    <section id="buyers" className="section buyers-section" aria-labelledby="buyers-heading">
      <div className="buyers-intro">
        <span className="eyebrow">ВСЁ О ПОКУПКАХ</span>
        <h2 id="buyers-heading">Покупателям<span aria-hidden="true">↘</span></h2>
        <p>От первого «хочу» до любимой вещи дома.</p>
        <Link className="text-link" href="/faq/">Вся информация<Icon name="diagonal" size={17} /></Link>
        <div className="buyers-stamp" aria-hidden="true"><Star /><span>ХОРОШИЕ<br />ВОПРОСЫ!</span></div>
      </div>
      <div className="buyers-questions">
        {buyerQuestions.map((item, index) => (
          <details key={item.id}>
            <summary><span className="buyers-question-number">0{index + 1}</span><span>{item.title}</span><Icon name="plus" /></summary>
            <div className="buyers-answer">
              <p>{item.answer}</p>
              <Link className="text-link" href={item.href}>{item.link}<Icon name="diagonal" size={16} /></Link>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
