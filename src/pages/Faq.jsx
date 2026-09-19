import { Link } from 'react-router';
import { FaqList } from '../components/Sections.jsx';

export default function Faq() {
  return (
    <section className="faq">
      <div className="faq__inner">
        <header className="faq__head">
          <p className="eyebrow">Questions</p>
          <h1 className="faq__title">Frequently Asked</h1>
        </header>
        <FaqList />
        <p className="faq__foot">Still stuck? <Link to="/contact">Contact us →</Link></p>
      </div>
    </section>
  );
}
