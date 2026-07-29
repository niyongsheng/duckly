# Duckly

Eisenhower Matrix 任务管理 PWA。

## Tech Stack

React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4 + Zustand 5 + SQLite WASM (OPFS)

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | 本地开发 localhost:5173 |
| `pnpm build` | TypeScript 检查 + Vite 构建 |
| `pnpm preview` | 预览构建产物 |
| `pnpm lint` / `pnpm format` | Biome 检查 / 格式化 |

## Deploy

- **GitHub Pages** — push 到 `main` 自动部署；push `v*` tag 自动发版含 changelog
- **Cloudflare Pages** — 单独 workflow，需配置 `CLOUDFLARE_API_TOKEN` secret

## Architecture Notes

- 数据全部在浏览器 OPFS（SQLite WASM），无后端
- 通知存 SQLite `notifications` 表，非 localStorage
- AI API 见 `docs/ai-api.md`
- COOP/COEP header (`public/_headers`) 启用 SharedArrayBuffer
