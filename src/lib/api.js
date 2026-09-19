/* skms-backend client. VITE_API_URL is the Render service; locally the backend runs on :4000. */
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/+$/, '');

/* null when the API can't be reached (asleep, offline, timed out), else { ok, status, data }.
   A free Render service takes ~50s to wake, so the default timeout outlasts that. */
export async function api(path, { timeout = 70_000, ...opts } = {}) {
  try {
    const res = await fetch(API_URL + path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...opts.headers },
      signal: AbortSignal.timeout(timeout),
    });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
  } catch {
    return null;
  }
}

export const ls = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, v) { try { v == null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(v)); } catch {} },
};
