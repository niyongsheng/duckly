<p align="center">
  <img src="./logo.png" width="100" alt="Duckly 标志">
</p>

<h3 align="center">Duckly</h3>
<p align="center">精致事务管理 PWA，提供日历视图、四象限、任务列表三种日程管理模式。</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://sqlite.org"><img src="https://img.shields.io/badge/SQLite_WASM-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite WASM"></a>
</p>

[English](README.md) &nbsp;|&nbsp; **简体中文**
---

## 功能特性

- **三种视图** — 日历（月/周/日/年）、四象限矩阵（拖拽）、列表（搜索/筛选/分页）
- **标签系统** — 预设标签 + 自定义颜色标签管理
- **批量操作** — 清除已完成 / 删除全部
- **Excel 导入/导出** — 数据备份与恢复
- **统计图表** — 完成率及象限分布图
- **通知与 Webhook** — 应用内通知 + 桌面推送 + 截止日期提醒 + 外部 Webhook
- **AI 通道** — 内置 JSON-RPC 2.0 API，通过 `window.__DucklyAI` 和 `postMessage` 调用
- **自定义** — 深色模式 / 国际化（中文和英文）
- **PWA** — 离线可用，SQLite 本地存储

## AI API

内置 JSON-RPC 2.0 接口，通过 `window.__DucklyAI` 或 `postMessage` 操作任务数据。权限分为 `readonly` 和 `readwrite` 两级。详见 [docs/ai-api.md](docs/ai-api.md)。

```
queryTasks   getTags      (只读)
createTask   updateTask   deleteTask   (读写)
```

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 + Tailwind CSS 4 |
| 存储 | SQLite WASM（OPFS 持久化） |
| 状态管理 | Zustand 5 |
| 国际化 | 中文 / 英文 |
| 部署 | GitHub Pages / Cloudflare Pages |

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # 生产构建
pnpm preview    # 预览生产构建
pnpm lint       # Biome 检查
```

> COOP/COEP 头信息已在 `public/_headers` 中配置 — SQLite WASM 开箱即用。

## 许可

[MIT](LICENSE) © 2026 [Nico](https://github.com/niyongsheng)
