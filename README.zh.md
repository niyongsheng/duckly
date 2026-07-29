<div align="center">

<img src="./logo.png" alt="Duckly" width="100" height="100">

# Duckly

### *艾森豪威尔矩阵 · 日历视图 · 任务列表 — 一应俱全。*

**一款卡通风格的艾森豪威尔矩阵任务调度 PWA — React 19 + SQLite WASM，完全离线可用。**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![SQLite WASM](https://img.shields.io/badge/SQLite_WASM-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![PWA](https://img.shields.io/badge/PWA-✓-5A0FC8?style=flat-square)](https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps)
[![License](https://img.shields.io/badge/License-MIT-aa66ff?style=flat-square)](#license)

[English](README.md) &nbsp;|&nbsp; **简体中文**

</div>

---

## 预览

<p align="center">
  <img src="./docs/duckly-demo.gif" alt="截图占位">
</p>

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 日历视图 | 月 / 周 / 日 / 年视图，含任务安排侧栏 |
| 四象限矩阵 | 艾森豪威尔矩阵，支持拖拽分类 |
| 标签系统 | 预设标签 + 自定义彩色标签 |
| AI 通道 | 内置 JSON-RPC 2.0 API，通过 `window.__DucklyAI` 和 `postMessage` 调用 |
| 通知推送 | 应用内通知 + 桌面推送 + 截止提醒 + Webhook 推送 |
| 数据管理 | Excel 导入/导出、批量操作、全量数据备份 |
| 统计面板 | 完成率、象限分布图 |
| 个性化 | 深色模式、中英双语 |

---

## AI API

内置 JSON-RPC 2.0 接口，通过 `window.__DucklyAI` 或 `postMessage` 操作任务数据。权限分为 `readonly` 和 `readwrite` 两级。详见 [docs/ai-api.md](docs/ai-api.md)。

```
queryTasks   getTags      (只读)
createTask   updateTask   deleteTask   (读写)
```

---

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 + Tailwind CSS 4 |
| 存储 | SQLite WASM（OPFS 持久化） |
| 状态管理 | Zustand 5 |
| 国际化 | 中文 / 英文 |
| 部署 | GitHub Pages / Cloudflare Pages |

---

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # 生产构建
pnpm preview    # 预览生产构建
pnpm lint       # Biome 代码检查
```

> COOP/COEP 头信息已在 `public/_headers` 中配置 — SQLite WASM 开箱即用。

---

## 部署

Duckly 是纯静态 PWA — 无需后端，开箱即用。

<div align="left">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fniyongsheng%2Fduckly&project-name=duckly&repository-name=duckly)
&nbsp;
[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/pages/new)

</div>

| 平台 | 步骤 |
|------|------|
| **Vercel** | 点击上方按钮，登录，Deploy — 约 10 秒完成。自动识别 Vite 项目。 |
| **Cloudflare Pages** | 连接 Git 仓库，Framework: **Vite**，Build: `pnpm build`，Output: `dist`，部署。CLI: `wrangler pages deploy dist --project-name=duckly`（配置见 [`docs/deploy/wrangler.toml`](docs/deploy/wrangler.toml)）。 |
| **Docker** | 使用 [`Dockerfile`](docs/deploy/Dockerfile) 构建并运行（nginx 配置见 [`docs/deploy/nginx.conf`](docs/deploy/nginx.conf)）： |

```bash
docker build -t duckly .
docker run -d -p 8080:80 duckly
# → http://localhost:8080
```

<details>
<summary>或者使用 <code>docker compose</code></summary>

```yaml
# docker-compose.yml
services:
  duckly:
    build: .
    ports:
      - "8080:80"
```
</details>

> 所有数据存储在浏览器 OPFS 中，不同域名不共享数据。

---

## 许可

[MIT](LICENSE) &copy; 2026 [Nico](https://github.com/niyongsheng)
