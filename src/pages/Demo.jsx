/* Free Exam Demo: three questions. An answer locks once picked — the right option lights up green (the pulsing
   "winner light", dr.css .is-correct), a wrong pick turns red — and the result is also said in words. Finishing
   opens the score modal, which links to the plans. */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

/* [question, options, index of the correct option] */
const QUESTIONS = [
  ['A 6-month-old presented with a genetic disorder attributed to multifactorial inheritance. This type of inheritance is most likely to play a significant role in which of the following disorder?',
    ['Achondroplasia', 'Lysosomal storage disease', 'Cleft lip', 'Huntington disease'], 2],
  ['A 54-year-old man with type 2 diabetes has a fasting plasma glucose of 9.8 mmol/L on two occasions despite metformin. Which of the following is the most appropriate next step?',
    ['Add a sulfonylurea', 'Start basal insulin', 'Increase metformin beyond the maximum dose', 'Stop metformin and observe'], 0],
  ['A 28-year-old woman presents with fatigue, weight gain and cold intolerance. TSH is raised and free T4 is low. What is the most likely diagnosis?',
    ['Graves disease', 'Primary hypothyroidism', 'Subclinical hyperthyroidism', 'Sick euthyroid syndrome'], 1],
];
const LETTERS = ['A', 'B', 'C', 'D'];

export default function Demo() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(() => QUESTIONS.map(() => null));
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const panel = useRef(null);

  const [q, options, answer] = QUESTIONS[index], choice = picked[index], answered = choice !== null, last = index === QUESTIONS.length - 1;
  const score = picked.filter((p, i) => p === QUESTIONS[i][2]).length, total = QUESTIONS.length;
  const lead = score === total ? 'Outstanding clinical reasoning!' : score >= total - 1 ? 'Strong clinical reasoning!' : 'A good start — keep practising!';

  const pick = i => !answered && setPicked(p => p.map((v, j) => (j === index ? i : v)));
  function next() {
    if (!answered) return;
    if (!last) return setIndex(index + 1);
    setLeaving(true);   // fade the questions out, then bring the score in
    setTimeout(() => setDone(true), 350);
  }
  function retake() {
    setPicked(QUESTIONS.map(() => null));
    setIndex(0);
    setDone(false);
    setLeaving(false);
    panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    if (!done) return;
    const onKey = e => e.key === 'Escape' && retake();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [done]);

  return (
    <section className="demo">
      <div className="demo__inner">
        <h1 className="demo__title">Free Exam Demo</h1>

        <div ref={panel} className={`demo__panel${leaving ? ' is-leaving' : ''}`}>
          <p className="demo__progress">Question {index + 1} of {total}</p>
          <p className="demo__question">{q}</p>
          <ul className="demo__options">
            {options.map((o, i) => {
              const state = !answered ? '' : i === answer ? ' is-correct' : i === choice ? ' is-wrong' : '';
              return (
                <li key={`${index}-${i}`}>
                  <button className={`demo__option${state}`} type="button" disabled={answered} onClick={() => pick(i)}>
                    <span className="demo__letter">{LETTERS[i]}</span>{o}
                  </button>
                </li>
              );
            })}
          </ul>
          {/* colour alone isn't feedback: the result is also said in words, and read out by screen readers */}
          <p className={`demo__feedback${answered ? (choice === answer ? ' is-right' : ' is-miss') : ''}`} aria-live="polite">
            {!answered ? '' : choice === answer ? '✓ Correct!' : `✗ Not quite — the correct answer is ${LETTERS[answer]}.`}
          </p>
          <div className="demo__nav">
            <button className="demo__btn" type="button" disabled={index === 0} onClick={() => setIndex(index - 1)}>Last Question</button>
            <button className="btn btn--primary demo__btn" type="button" disabled={!answered} onClick={next}>{last ? 'Finish' : 'Next Question'}</button>
          </div>
        </div>
      </div>

      {done && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#1E231E]/55 p-4 backdrop-blur-sm">
          <div className="demo__done !m-0 w-full" role="dialog" aria-modal="true" aria-labelledby="demo-done-title">
            <div className="demo__badge" aria-hidden="true">✓</div>
            <h2 className="demo__done-title" id="demo-done-title">Exam Demo Completed!</h2>
            <p className="demo__score">Score: <b>{score}</b> / {total}</p>
            <p className="demo__insight">{lead} Get access to 500+ realistic video scenarios, mock tests, and high-yield study materials.</p>
            <div className="demo__cta">
              <Link className="btn btn--primary" to="/plans">Unlock Full Exam Plans</Link>
              <button className="demo__retake" type="button" onClick={retake} autoFocus>Retake Demo</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
