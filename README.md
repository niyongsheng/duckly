<p align="center">
  <img src="./logo.png" width="100" alt="Duckly Logo">
</p>

<h3 align="center">Duckly</h3>
<p align="center">Elegant task management PWA with calendar view, Eisenhower Matrix and task list modes.</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://sqlite.org"><img src="https://img.shields.io/badge/SQLite_WASM-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite WASM"></a>
</p>

**English** &nbsp;|&nbsp; [简体中文](README.zh.md)
---

## Features

- **Three Views** — Calendar (month/week/day/year), Quadrant matrix (drag & drop), List (search/filter/pagination)
- **Tag System** — Preset tags + custom color tag management
- **Batch Operations** — Clear completed / Delete all
- **Excel Import/Export** — Data backup & restore
- **Statistics** — Completion rate & quadrant distribution charts
- **Notifications & Webhook** — In-app notifications + desktop push + deadline reminders + external webhook
- **AI Channel** — Built-in JSON-RPC 2.0 API via `window.__DucklyAI` and `postMessage`
- **Customization** — Dark mode / i18n (Chinese & English)
- **PWA** — Offline-ready, SQLite local storage

## AI API

Built-in JSON-RPC 2.0 interface to manipulate task data through `window.__DucklyAI` or `postMessage`. Permissions are tiered as `readonly` and `readwrite`. See [docs/ai-api.md](docs/ai-api.md).

```
queryTasks   getTags      (readonly)
createTask   updateTask   deleteTask   (readwrite)
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 + Tailwind CSS 4 |
| Storage | SQLite WASM (OPFS persisted) |
| State | Zustand 5 |
| i18n | Chinese / English |
| Deploy | GitHub Pages / Cloudflare Pages |

## Quick Start

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # Production build
pnpm preview    # Preview production build
pnpm lint       # Biome check
```

> COOP/COEP headers are configured in `public/_headers` — SQLite WASM works out of the box.

## License

[MIT](LICENSE) © 2026 [Nico](https://github.com/niyongsheng)
