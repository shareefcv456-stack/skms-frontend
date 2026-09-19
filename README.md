# skms-frontend

Dr. SKM's Academy public website — React 19, React Router, Tailwind CSS v4, Vite.

## Run locally

```bash
echo 'VITE_API_URL="http://localhost:4000"' > .env   # a local skms-backend
npm install
npm run dev               # http://localhost:5173
```

Pages render from the built-in content in `src/lib/content.js` at once, then switch to the admin's saved content and live plan prices when the API answers. A sleeping Render service never leaves the page empty, and the last good answer is cached in the browser. Keep `DEFAULTS` in step with `skms-backend/content.js`.

Styling: `src/index.css` holds the Figma-matched component styles (from the original `dr.css`) in Tailwind's components layer, and the brand tokens (`forest`, `sage`, `mint`…) in `@theme`.

## Deploy (Vercel)

Import the repo (framework preset: Vite) and set `VITE_API_URL` to the Render URL. `vercel.json` handles client-side routes and redirects the old `*.html` URLs. Add this domain to the backend's `CLIENT_URL`, and to "Authorized JavaScript origins" of the Google OAuth client.
