---
name: Vite + Express middlewareMode on Replit
description: How to get Vite dev server HMR working when Vite runs in middlewareMode inside a custom Express/http server on Replit's proxied dev domain.
---

When a project uses `vite.createServer({ server: { middlewareMode: true } })` inside a custom Express server (instead of `vite dev`), two issues show up specifically in the Replit environment:

1. **HMR websocket fails to connect** ("WebSocket closed without opened", or tries `ws://localhost:443`).
   **Why:** Replit's preview proxy terminates TLS on 443 and forwards to the app's actual port (e.g. 5000). Vite's HMR client needs `server.hmr.clientPort: 443` and `protocol: 'wss'`, and ideally `host` set to `process.env.REPLIT_DEV_DOMAIN` so it doesn't default to `localhost`.
   **How to apply:** In `vite.config.ts`, set `server.hmr = { clientPort: 443, protocol: 'wss', host: process.env.REPLIT_DEV_DOMAIN }`.

2. **Vite's own separate HMR websocket server fails to bind** ("EADDRNOTAVAIL" on some internal port like 24678).
   **Why:** In middlewareMode, if you don't pass `hmr.server`, Vite spins up its own standalone ws server on a port that isn't reachable/bindable in the Replit container network namespace.
   **How to apply:** Create the `http.Server` explicitly (`http.createServer(app)`), pass it as `server.hmr.server` in the `createServer()` call, and use that same server instance for `.listen()` instead of `app.listen()`.

3. **Full page reloads never stop, so any splash/intro animation with a `setTimeout` never completes.**
   **Why:** Vite's file watcher was picking up churn in Replit's own agent/session state directories (e.g. `.local/state/**`, `.cache/**`, `.agents/**`), triggering full page reloads every few seconds.
   **How to apply:** Add `server.watch.ignored` in `vite.config.ts` covering `**/.local/**`, `**/.cache/**`, `**/.agents/**`, `**/.git/**`, `**/node_modules/**`, and any `attached_assets/**` dir.

