/* Site content: the built-in DEFAULTS first, then the admin's saved CMS overrides and the live plans from the API.
   The last good answer is cached in localStorage, so a visitor who comes back while the API sleeps still sees the
   current content instead of the defaults. */
import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULTS } from './content.js';
import { api, ls } from './api.js';

const CACHE = 'skm_site';
const Site = createContext(null);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(() => ls.get(CACHE) || { cms: {}, plans: null });

  useEffect(() => {
    const merge = patch => setSite(s => { const next = { ...s, ...patch }; ls.set(CACHE, next); return next; });
    api('/api/cms').then(r => r?.ok && merge({ cms: r.data }));
    // `saved` means the API has not reached the database yet: keep what we have rather than show stale cards
    api('/api/plans/live').then(r => r?.ok && r.data.source === 'db' && merge({ plans: r.data.plans }));
  }, []);

  return <Site.Provider value={site}>{children}</Site.Provider>;
}

/* One CMS section: a saved list wins unless it is empty (an emptied list never leaves a blank section);
   a saved object is laid over the defaults, so a field added later still has a value. */
export function useCms(key) {
  const v = useContext(Site).cms?.[key], d = DEFAULTS[key];
  if (Array.isArray(d)) return Array.isArray(v) && v.length ? v : d;
  return { ...d, ...(v && typeof v === 'object' ? v : {}) };
}

/* every program with at least one plan: live from the database, else the cached or built-in cards */
export function usePlans() {
  return (useContext(Site).plans || DEFAULTS.plans).filter(g => g.cards?.length);
}
