import { ABOUT_TEXT } from '../lib/copy.jsx';
import { Faculty, Founder } from '../components/Sections.jsx';

export default function About() {
  return <>
    <section className="about-hero">
      <img className="about-hero__bg" src="/img/tablet.jpg" alt="Doctor reviewing clinical analytics on a tablet" />
      <div className="about-hero__inner">
        <div className="about-hero__card">
          <p className="eyebrow">About Us</p>
          <h1 className="about-hero__title">Dr. SKM&#39;s Academy<br /><em>Leading International Platform</em></h1>
          <p className="about-hero__text">{ABOUT_TEXT}</p>
          <p className="about-hero__text">Our curriculum is carefully developed to reflect the latest Gulf medical licensing examination standards, combining high-yield clinical concepts with exam-focused, <strong>case-based MCQs</strong> and realistic clinical scenarios. Through expert faculty guidance, structured study plans. We equip candidates with the knowledge, confidence, and professional competence required to thrive in today&#39;s healthcare career in the GCC.</p>
        </div>
      </div>
    </section>
    <Founder />
    <Faculty />
  </>;
}
