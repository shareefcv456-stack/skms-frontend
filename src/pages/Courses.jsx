/* One course at a time, picked in the navbar's Courses menu (/courses#gp, #ai, #specialist, #final; #gp by default) */
import { Link, useLocation } from 'react-router';
import { COURSE_COPY, SPECIALIST_COPY } from '../lib/copy.jsx';
import { Cta } from '../components/Sections.jsx';

const COURSES = {
  gp: { title: 'Gulf Medical Licensing Examinations', img: '/img/card-gulf.jpg', alt: 'Doctor preparing for the Gulf licensing examination at a laptop' },
  ai: { title: 'Live patient AI VIDEOS', img: '/img/card-ai.jpg', alt: 'AI live patient video session on a laptop beside study notes' },
  specialist: { title: 'Specialist Gulf Licensing Examination.', img: '/img/card-specialist.jpg', alt: 'Specialist doctor studying for the licensing examination', rich: true },
  final: { title: 'Final year practical exam demo -AI VIDEOS', img: '/img/card-final.jpg', alt: 'Final year student reviewing a clinical case video' },
};

export default function Courses() {
  const id = decodeURIComponent(useLocation().hash.slice(1));
  const key = COURSES[id] ? id : 'gp', c = COURSES[key];
  return <>
    <section className="course-page">
      <div className="course-page__inner">
        <div className="course-page__body">
          <h1 className="course-page__title">{c.title}</h1>
          {c.rich
            ? <div className="course-page__text course-rich">{SPECIALIST_COPY}</div>
            : <p className="course-page__text">{COURSE_COPY[key]}</p>}
          <Link className="btn btn--primary course-page__cta" to={`/plans#${key}`}>View Plans</Link>
        </div>
        <figure className="course-page__media"><img src={c.img} alt={c.alt} /></figure>
      </div>
    </section>
    <Cta to="/plans" label="Buy Plans" />
  </>;
}
