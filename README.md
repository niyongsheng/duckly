<div align="center">

<img src="./logo.png" alt="Duckly" width="100" height="100">

# Duckly

### *Eisenhower Matrix · Calendar · Task List — all in one.*

**A cute cartoon-style Eisenhower Matrix task scheduler PWA — React 19 + SQLite WASM, fully offline-ready.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite WASM](https://img.shields.io/badge/SQLite_WASM-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![PWA](https://img.shields.io/badge/PWA-✓-5A0FC8?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![License](https://img.shields.io/badge/license-MIT-aa66ff?style=flat-square)](#license)

**English** &nbsp;|&nbsp; [简体中文](README.zh.md)

</div>

---

## Preview

<p align="center">
  <img src="./docs/duckly-demo.gif" alt="Screenshot placeholder">
</p>

---

## Features

| Capability | Description |
|---|---|
| Calendar | Month / Week / Day / Year views with task schedule sidebar |
| Quadrant Board | Eisenhower Matrix with drag-and-drop classification |
| Tag System | Preset tags + custom color labels |
| AI Channel | Built-in JSON-RPC 2.0 API via `window.__DucklyAI` and `postMessage` |
| Notifications | In-app + desktop push + deadline reminders + Webhook push |
| Data Management | Excel import / export, batch operations, full data backup |
| Statistics | Completion rate & quadrant distribution charts |
| Customization | Dark mode, i18n (Chinese & English) |

---

## AI API

Built-in JSON-RPC 2.0 interface to manipulate task data through `window.__DucklyAI` or `postMessage`. Permissions are tiered as `readonly` and `readwrite`. See [docs/ai-api.md](docs/ai-api.md) for the full reference.

```
queryTasks   getTags      (readonly)
createTask   updateTask   deleteTask   (readwrite)
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 + Tailwind CSS 4 |
| Storage | SQLite WASM (OPFS persisted) |
| State | Zustand 5 |
| i18n | Chinese / English |
| Deploy | GitHub Pages / Cloudflare Pages |

---

## Quick Start

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm lint       # Biome check
```

> COOP/COEP headers are configured in `public/_headers` — SQLite WASM works out of the box.

---

## Deploy

Duckly is a pure static PWA — it runs on any static host with zero server configuration.

<div align="left">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fniyongsheng%2Fduckly&project-name=duckly&repository-name=duckly)
&nbsp;
[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new)

</div>

| Platform | Steps |
|---|---|
| **Vercel** | Click button above, sign in, Deploy — done in ~10 seconds. Auto-detects Vite. |
| **Cloudflare Pages** | Connect your Git repo, Framework: **Vite**, Build: `pnpm build`, Output: `dist`, Deploy. CLI: `wrangler pages deploy dist --project-name=duckly` (config at [`docs/deploy/wrangler.toml`](docs/deploy/wrangler.toml)). |
| **Docker** | Build and run with the provided [`Dockerfile`](docs/deploy/Dockerfile) (nginx config at [`docs/deploy/nginx.conf`](docs/deploy/nginx.conf)): |

```bash
docker build -t duckly .
docker run -d -p 8080:80 duckly
# → http://localhost:8080
```

<details>
<summary>Or use <code>docker compose</code></summary>

```yaml
# docker-compose.yml
services:
  duckly:
    build: .
    ports:
      - "8080:80"
```
</details>

> All data lives in the browser's OPFS storage. Different domains do not share state.

---

## License

[MIT](LICENSE) &copy; 2026 [Nico](https://github.com/niyongsheng)
