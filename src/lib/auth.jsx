/* Student session + the login modal (Google sign-in or an emailed 6-digit code).
   requireLogin(onDone) opens the modal and, once signed in, hands the user to onDone — the plans page uses it to go
   straight on to Razorpay after a logged-out visitor clicks Buy Now. */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { api, ls } from './api.js';
import { GoogleG } from '../components/icons.jsx';

const USER_KEY = 'skm_user';
const Auth = createContext(null);
export const useAuth = () => useContext(Auth);

const storedUser = () => { const u = ls.get(USER_KEY); return u?.exp > Date.now() ? u : null; };

/* Google's own button, rendered offscreen once the page loads. Clicking it opens the account picker, which has to
   happen inside the user's click — an `await` between the click and the popup would get it blocked. */
const GIS_HOST = 'g-picker';
const loadGis = () => new Promise((ok, fail) => {
  const el = Object.assign(document.createElement('script'), { src: 'https://accounts.google.com/gsi/client', async: true, onload: ok });
  el.onerror = () => fail(new Error('gsi'));
  document.head.appendChild(el);
});

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(storedUser);
  const [modal, setModal] = useState(null);   // null = closed, else { forPurchase }
  const [msg, setMsg] = useState(null);       // { text, bad }
  const [googleBusy, setGoogleBusy] = useState(false);
  const pending = useRef(null);               // what to do once signed in
  const gisReady = useRef(false);

  const setUser = u => { ls.set(USER_KEY, u); setUserState(u); };
  const say = (text, bad) => setMsg(text ? { text, bad } : null);

  const close = () => { pending.current = null; setModal(null); };
  function requireLogin(onDone, forPurchase = false) {
    pending.current = onDone;
    say('');
    setModal({ forPurchase });
  }
  function finishLogin(data) {
    const u = { token: data.token, exp: data.exp, ...data.user };
    setUser(u);
    setModal(null);
    const done = pending.current;
    pending.current = null;
    done?.(u);
  }

  const onCredential = useRef();
  onCredential.current = async res => {
    if (!res?.credential) return say('Google sign-in was cancelled.', true);
    setGoogleBusy(true);
    const r = await api('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential: res.credential }) });
    setGoogleBusy(false);
    if (!r?.ok) return say(r?.data?.error || 'Google sign-in failed — please try again.', true);
    finishLogin(r.data);
  };

  useEffect(() => {   // best effort: a failure just leaves the Google button reporting it
    (async () => {
      const r = await api('/api/config');
      const clientId = r?.data?.googleClientId;
      if (!clientId) return;
      await loadGis();
      window.google.accounts.id.initialize({
        client_id: clientId, auto_select: false, cancel_on_tap_outside: true, use_fedcm_for_prompt: true,
        callback: res => onCredential.current(res),
      });
      const host = Object.assign(document.createElement('div'), { id: GIS_HOST });
      host.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(host);
      window.google.accounts.id.renderButton(host, { type: 'standard', theme: 'outline', size: 'large' });
      gisReady.current = true;
    })().catch(() => {});
  }, []);

  function googleSignIn() {   // stays synchronous so the popup keeps the click
    if (!gisReady.current) return say('Google sign-in is not available right now — use your email instead.', true);
    const picker = document.querySelector(`#${GIS_HOST} [role="button"]`);
    picker ? picker.click() : window.google.accounts.id.prompt();
  }

  return (
    <Auth.Provider value={{ user, requireLogin, logout: () => setUser(null) }}>
      {children}
      {modal && <LoginModal forPurchase={modal.forPurchase} msg={msg} say={say} onClose={close}
        onGoogle={googleSignIn} googleBusy={googleBusy} onLogin={finishLogin} />}
    </Auth.Provider>
  );
}

/* First submit mails a code (/api/auth/otp); second submit verifies it (/api/auth/verify). */
function LoginModal({ forPurchase, msg, say, onClose, onGoogle, googleBusy, onLogin }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return say('Please enter a valid email address.', true);
    if (challenge && !/^\d{6}$/.test(otp.trim())) return say('Enter the 6-digit code from your email.', true);
    setBusy(true);
    try {
      if (!challenge) {
        const r = await api('/api/auth/otp', { method: 'POST', body: JSON.stringify({ email }) });
        if (!r?.ok) return say(r?.data?.error || 'Could not send the code — please try again.', true);
        setChallenge(r.data.challenge);
        return say(`We sent a 6-digit code to ${email.trim()}.` + (r.data.devCode ? ` Test code: ${r.data.devCode}` : ''));
      }
      const r = await api('/api/auth/verify', { method: 'POST', body: JSON.stringify({ challenge, otp: otp.trim() }) });
      if (!r?.ok) return say(r?.data?.error || 'Login failed — please try again.', true);
      onLogin(r.data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-card grid md:grid-cols-2" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="auth-card__dark">
          <h3 className="auth-card__title">Welcome to<br /><em>SKM&rsquo;s Academy</em></h3>
          <p className="auth-card__lede">Empowering medical professionals with AI-powered clinical learning, expert guidance, and focused preparation for Gulf Medical Licensing Examinations.</p>
        </div>
        <div className="auth-panel">
          <button type="button" onClick={onClose} className="auth-x" aria-label="Close"><X className="h-6 w-6" /></button>
          <h4 className="auth-heading" id="auth-title">{forPurchase ? 'Login to buy this plan' : 'Welcome back'}</h4>
          <p className="auth-sub">Continue with Google, or log in with a code sent to your email.</p>
          <button type="button" className="auth-google" onClick={onGoogle} disabled={googleBusy}><GoogleG /><span>Continue with Google</span></button>
          <form className="auth-form" noValidate onSubmit={submit}>
            <p className="auth-or">or</p>
            <label className="auth-label" htmlFor="auth-email">Enter your Email address</label>
            <input id="auth-email" type="email" autoComplete="email" maxLength={200} required className="auth-input" placeholder="eg, ajmal55@gmail.com"
              value={email} onChange={e => { setEmail(e.target.value); setChallenge(null); setOtp(''); }} />
            {challenge && <>
              <label className="auth-label" htmlFor="auth-otp">Enter the 6-digit code we emailed you</label>
              <input id="auth-otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} className="auth-input" placeholder="••••••" autoFocus
                value={otp} onChange={e => setOtp(e.target.value)} />
            </>}
            <button type="submit" className="btn-grad auth-btn" disabled={busy}>Login</button>
          </form>
          {msg && <p role="status" className="auth-msg" style={{ color: msg.bad ? '#b42318' : '#4b5b33' }}>{msg.text}</p>}
          <p className="auth-terms">By continuing you agree to our Terms of Use and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}
