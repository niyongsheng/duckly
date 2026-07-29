# Duckly

A cute cartoon-style Eisenhower Matrix task scheduler PWA.

## Tech Stack

- **Framework:** React 19, TypeScript 6
- **Build:** Vite 8
- **Styling:** Tailwind CSS 4 + Brutalist CSS custom properties
- **State:** Zustand 5
- **Database:** SQLite WASM (OPFS-persisted via `@sqlite.org/sqlite-wasm`)
- **PWA:** VitePWA with Workbox (auto-update SW)
- **Deploy:** GitHub Pages (`niyongsheng.github.io/duckly/`), Cloudflare Pages (separate workflow)
- **Release:** Push `v*` tag triggers GitHub Release with auto-generated changelog

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server at localhost:5173 |
| `pnpm build` | TypeScript check + Vite build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |

## Key Directories

- `src/components/` — React components (Header, CalendarView, QuadrantView, etc.)
- `src/stores/` — Zustand stores (useTaskStore, useUIStore)
- `src/db/` — Database client, schema, migrations (SQLite WASM)
- `src/ai/` — AI channel (JSON-RPC 2.0 via postMessage + window.__DucklyAI)
- `src/i18n/` — Internationalization (zh.json / en.json)
- `src/hooks/` — Custom hooks (usePWA, useDatabase, useToast, useExcel)
- `docs/` — Documentation including `ai-api.md`

## CI/CD

- **Push to `main`** → Build + deploy to GitHub Pages (`.github/workflows/deploy.yml`)
- **Push `v*` tag** (e.g. `v1.0.0`) → Build + deploy + create GitHub Release with changelog
- **Cloudflare Pages** → Separate workflow (`deploy-cf.yml`), requires `CLOUDFLARE_API_TOKEN` secret
- Notifications are persisted in SQLite (`notifications` table), not localStorage

## AI API

Duckly exposes a built-in AI API for both in-browser agents and Claude Code:

- **`docs/ai-api.md`** — Full API documentation
- **`window.__DucklyAI`** — Global JS API (browser console)
- **`window.postMessage`** — JSON-RPC 2.0 channel (extensions, iframes)

Methods: `queryTasks`, `createTask`, `updateTask`, `deleteTask`, `getTags`

Read `docs/ai-api.md` for complete API reference with examples.

## Architecture Notes

- All data lives in browser OPFS (Origin Private File System) — no backend
- SQLite runs in a Web Worker via `@sqlite.org/sqlite-wasm`
- AI channel auto-initializes on app startup with `readonly` permission
- User can upgrade to `readwrite` via Settings → AI Channel
- The app uses COOP/COEP headers (via `public/_headers`) for SharedArrayBuffer support
