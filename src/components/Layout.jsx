/* Shared chrome on every page: announcement bar, header (44px logo + drawer on mobile), footer and the
   Write-a-Review modal. Pages open that modal through the outlet context: useOutletContext().openReview() */
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';
import { CONTACT, COURSE_MENU, NAV, isExternal, safeUrl } from '../lib/content.js';
import { useCms } from '../lib/site.jsx';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { Brand } from './icons.jsx';

export default function Layout() {
  const [reviewOpen, setReviewOpen] = useState(false);
  const { pathname, hash } = useLocation();

  // a new page starts at the top; a #hash lands on its section (the sticky header offset is in the CSS)
  useEffect(() => {
    const el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
    el ? el.scrollIntoView() : window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <Announcement />
      <Header />
      <main><Outlet context={{ openReview: () => setReviewOpen(true) }} /></main>
      <Footer />
      {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} />}
    </>
  );
}

function Announcement() {
  const a = useCms('announcement');
  if (!a.enabled || !a.text?.trim()) return null;
  const href = safeUrl(a.link);
  return (
    <div className="bg-forest px-4 py-2 text-center text-[13px] leading-5 text-white sm:text-[14px]">
      {a.text}
      {href && a.linkText && (isExternal(href)
        ? <a href={href} target="_blank" rel="noopener" className="ml-2 font-bold underline underline-offset-2">{a.linkText}</a>
        : <Link to={href} className="ml-2 font-bold underline underline-offset-2">{a.linkText}</Link>)}
    </div>
  );
}

const StorePill = ({ kind }) => {
  const Icon = Brand[kind];
  return (
    <a href={kind === 'apple' ? CONTACT.appStore : CONTACT.playStore} target="_blank" rel="noopener" className="store-pill">
      <span className="store-pill__icon"><Icon /></span>
      <span className="store-pill__label"><span>Get it on</span><b>{kind === 'apple' ? 'Apple Store' : 'Play Store'}</b></span>
    </a>
  );
};

function LoginButton({ label, className }) {
  const { user, requireLogin, logout } = useAuth();
  return (
    <button type="button" className={className} title={user ? `Signed in as ${user.email}` : ''}
      onClick={() => (user ? logout() : requireLogin())}>
      {user ? 'Logout' : label}
    </button>
  );
}

function Header() {
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setDrawer(false), [pathname]);   // following a link closes the drawer

  // the underline spans the padded link box, so it runs 10px past the text on each side (Figma); hover previews it
  const link = ([to, label]) => (
    <NavLink key={to} to={to} end={to === '/'}
      className={({ isActive }) => `group relative block px-2.5 py-2.5 transition ${isActive ? 'text-[#7d8f57]' : 'text-[#2b2b2b] hover:text-[#7d8f57]'}`}>
      {({ isActive }) => <>
        {label}
        <span className={`absolute left-0 right-0 top-full h-[3px] rounded-full bg-[#4A6B53] transition-transform ${isActive ? '' : 'scale-x-0 group-hover:scale-x-100'}`} />
      </>}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/[.06] bg-white">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 min-[769px]:h-[106px] min-[769px]:px-6 lg:h-[114px] lg:px-10 min-[90rem]:px-20">
        <Link to="/" className="navbar-brand h-11 w-11 shrink-0 min-[769px]:h-[80px] min-[769px]:w-[80px]">
          <img src="/img/logo.png" alt="Dr. SKM's Academy" className="h-full w-full object-contain" />
        </Link>
        <nav className="ml-10 hidden items-center gap-[11px] text-[18px] lg:flex xl:ml-14 min-[90rem]:ml-[96px]">
          {NAV.map(item => item[0] !== '/courses' ? link(item) : (
            <div key="courses" className="has-menu relative">
              {link(item)}
              <div className="menu absolute left-1/2 top-full w-[540px] -translate-x-1/2 pt-3">
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,.18)]">
                  {COURSE_MENU.map(([t, to]) => (
                    <Link key={to} to={to} className="block border-b border-[#ededed] px-8 py-4 text-[17px] text-[#1a1a1a] transition last:border-0 hover:bg-[#f6faf0]">{t}</Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2.5 xl:flex">
          <StorePill kind="apple" />
          <StorePill kind="play" />
          <LoginButton label="Login/Signup" className="btn-grad h-[52px] w-[172px] rounded-full text-[18px] !font-normal" />
        </div>
        <LoginButton label="Login" className="btn-grad ml-auto h-8 rounded-full px-3.5 text-[13px] leading-none !font-normal min-[769px]:h-auto min-[769px]:px-5 min-[769px]:py-2.5 min-[769px]:text-sm xl:hidden" />
        <button type="button" onClick={() => setDrawer(true)} className="-mr-2 p-2 text-[#1a1a1a] lg:hidden" aria-label="Open menu" aria-expanded={drawer}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* mobile drawer: slides in from the right over a dimmed page */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawer ? '' : 'pointer-events-none'}`} inert={!drawer}>
        <div onClick={() => setDrawer(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${drawer ? 'opacity-100' : 'opacity-0'}`} />
        <nav className={`absolute right-0 top-0 flex h-full w-[min(82vw,320px)] flex-col bg-white px-6 pb-8 pt-4 shadow-2xl transition-transform duration-300 ${drawer ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="mb-4 flex items-center justify-between">
            <img src="/img/logo.png" alt="" className="h-11 w-11 object-contain" />
            <button type="button" onClick={() => setDrawer(false)} className="-mr-2 p-2" aria-label="Close menu"><X className="h-6 w-6" /></button>
          </div>
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `block border-b border-black/5 py-3.5 text-[16px] ${isActive ? 'text-[#7d8f57]' : 'text-[#2b2b2b]'}`}>{label}</NavLink>
          ))}
          <div className="mt-6 flex flex-wrap gap-3"><StorePill kind="apple" /><StorePill kind="play" /></div>
        </nav>
      </div>
    </header>
  );
}

/* Social buttons — footer and contact page */
export function Socials({ size = 40 }) {
  return ['instagram', 'whatsapp', 'facebook', 'youtube'].map(k => {
    const Icon = Brand[k], href = CONTACT[k];
    return (
      <a key={k} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})} aria-label={k} title={k}
        className="grid place-items-center rounded-full bg-[#8a9b68] text-white transition hover:bg-[#9bad77]" style={{ width: size, height: size }}>
        <Icon />
      </a>
    );
  });
}

function Footer() {
  const col = (title, items) => (
    <nav className="site-footer__col">
      <p className="site-footer__colhead">{title}</p>
      <ul>{items.map(([t, to]) => <li key={to}><Link to={to}>{t}</Link></li>)}</ul>
    </nav>
  );
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <div className="site-footer__logo">
            <span><img src="/img/logo.png" alt="Dr. SKM's Academy" className="h-full w-full object-contain" /></span>
            <span className="site-footer__name">Dr. SKM&#39;s<br />Academy</span>
          </div>
          <p className="site-footer__blurb">AI-powered clinical learning designed specifically for Gulf licensing examinations. Trusted by 500+ doctors across the GCC.</p>
          <div className="site-footer__social"><Socials size={44} /></div>
        </div>
        {col('PLATFORMS', [['HOME', '/'], ['Plans', '/plans'], ['Courses', '/courses'], ['About Us', '/about']])}
        {col('SUPPORT', [['Contact Us', '/contact'], ['FAQs', '/faq']])}
      </div>
      <div className="site-footer__bottom">
        <p>&copy; {new Date().getFullYear()} Dr. SKM&#39;s Academy. All rights reserved.</p>
        <p><a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Refund Policy</a></p>
      </div>
    </footer>
  );
}

/* Write a Review → /api/reviews. Kept for the team's Review Inbox; the admin approves what gets published. */
function ReviewModal({ onClose }) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!rating) return setMsg({ text: 'Please pick a star rating.', bad: true });
    if (!name.trim()) return setMsg({ text: 'Please enter your name.', bad: true });
    if (body.trim().length < 10) return setMsg({ text: 'Please write a few words about your experience.', bad: true });
    setBusy(true);
    const r = await api('/api/reviews', { method: 'POST', body: JSON.stringify({ name, rating, body }) });
    setBusy(false);
    if (!r?.ok) return setMsg({ text: r?.data?.error || 'Could not send your review — please try again.', bad: true });
    setName(''); setBody(''); setRating(0);
    setMsg({ text: 'Thank you! Your review has been sent to our team.' });
  }

  return (
    <div className="modal-veil" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="review-card" role="dialog" aria-modal="true" aria-label="Write a review">
        <button type="button" onClick={onClose} className="review-card__x" aria-label="Close"><X /></button>
        <p className="review-card__label">Your Rating</p>
        <div className="review-card__stars">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" aria-label={`${n} star`} className={n <= rating ? 'is-on' : ''} onClick={() => setRating(n)}>&#9733;</button>
          ))}
        </div>
        <label className="review-card__label" htmlFor="rev-name">Name</label>
        <input id="rev-name" className="review-card__input" value={name} onChange={e => setName(e.target.value)} />
        <label className="review-card__label" htmlFor="rev-text">Your Review</label>
        <textarea id="rev-text" className="review-card__input review-card__area" placeholder="Write your message...." value={body} onChange={e => setBody(e.target.value)} />
        {msg && <p role="status" className="auth-msg" style={{ color: msg.bad ? '#b42318' : '#4b5b33' }}>{msg.text}</p>}
        <div className="review-card__actions">
          <button type="button" className="review-card__cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn--primary review-card__send" onClick={send} disabled={busy}>Send Review</button>
        </div>
      </div>
    </div>
  );
}
