# Radio Wave Brasil

Player de rádios brasileiras ao vivo (Sertanejo, Pagode, MPB, Rock, News, etc.), consumindo a API pública [Radio Browser](https://www.radio-browser.info/).

## Stack
- React 19 + TypeScript, Vite 6, Tailwind CSS v4
- TanStack Query (React Query)
- Backend: Express (`server.ts`) serving the Vite app in dev and static build in prod, plus an `/api` proxy to `https://de1.api.radio-browser.info/json`

## Running on Replit
- Workflow "Start application" runs `npm run dev` (`tsx server.ts`), which starts Express + Vite middleware on port 5000.
- No secrets/env vars are required — the Radio Browser API is public and unauthenticated.
- Production build/run: `npm run build` then `npm run start` (deployment already configured as autoscale in `.replit`).

## Notes
- Originally built for deployment on Netlify (see `netlify.toml`); the Replit workflow/server setup covers running it here instead.
- No user preferences recorded yet.
