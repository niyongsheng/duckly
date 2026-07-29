<p align="center">
  <img src="./logo.png" width="100" alt="Duckly Logo">
</p>

<h3 align="center">Duckly</h3>
<p align="center">一款卡通风格的艾森豪威尔矩阵任务管理 PWA。</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://sqlite.org"><img src="https://img.shields.io/badge/SQLite_WASM-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite WASM"></a>
</p>

---

## 特性

- **三种视图** — 日历（月/周/日/年）、四象限矩阵（拖拽分类）、列表（搜索/筛选/分页）
- **标签系统** — 预设标签 + 自定义颜色标签管理
- **批量操作** — 清空已完成 / 删除全部
- **Excel 导入导出** — 数据备份与恢复
- **统计面板** — 完成率、象限分布图谱
- **通知与 Webhook** — 应用内通知 + 桌面推送 + 截止日期提醒 + 外部 webhook 推送
- **AI 通道** — 内嵌 JSON-RPC 2.0 API，支持 `window.__DucklyAI` 与 `postMessage`
- **自定义** — 深色模式 / 中英双语
- **PWA** — 离线可用，SQLite 本地存储

## AI API

内置 JSON-RPC 2.0 接口，通过 `window.__DucklyAI` 或 `postMessage` 通道操作任务数据。权限分为 `readonly` 与 `readwrite` 两级。详见 [docs/ai-api.md](docs/ai-api.md)。

```
queryTasks   getTags      (readonly)
createTask   updateTask   deleteTask   (readwrite)
```

## 技术栈

| 层 | 选型 |
|---|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 + Tailwind CSS 4 |
| 存储 | SQLite WASM（OPFS 持久化） |
| 状态 | Zustand 5 |
| 国际化 | 中 / 英 |
| 部署 | GitHub Pages / Cloudflare Pages |

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # 构建生产版本
pnpm preview    # 预览构建产物
pnpm lint       # Biome 检查
```

> `public/_headers` 已配置 COOP/COEP 头，SQLite WASM 开箱即用。

## License

[MIT](LICENSE) © 2026 [Nico](https://github.com/niyongsheng)
