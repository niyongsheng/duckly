<p align="center">
  <img src="./logo.png" width="100" alt="Duckly Logo">
</p>

<h3 align="center">Duckly</h3>
<p align="center">一款精美的事务管理 PWA web app，支持 日历视图 + 四象限法则 + 任务列表 三种模式管理日程。</p>

<p align="center">
  <a href="https://github.com/niyongsheng/duckly"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"></a>
  <a href="https://github.com/niyongsheng/duckly"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://github.com/niyongsheng/duckly"><img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
</p>

---

## 功能

| 模块 | 图标 | 描述                   |
|------|------|----------------------|
| **日历视图** | 📅 | 月 / 周 / 日 / 年，截止日期概览 |
| **四象限视图** | 📊 | 艾森豪威尔矩阵，事件拖拽分类       |
| **任务列表** | 📋 | 搜索、筛选、排序、分页          |
| **标签系统** | 🏷️ | 自定义标签管理与筛选           |
| **批量操作** | 🗑️ | 清空已完成 / 删除全部         |
| **Excel** | 📑 | 数据导入导出与备份            |
| **统计面板** | 📈 | 完成率分布图表              |
| **通知 & Webhook** | 🔔 | 截止提醒、外部推送            |
| **AI 通道** | 🤖 | 内嵌 AI 输入通道（读写/只读）    |
| **自定义** | 🎨 | 深色模式 / 国际化           |
| **PWA** | 📲 | 离线可用，本地数据存储          |

## AI API

Duckly 内置了面向 AI 代理的 JSON-RPC 2.0 API，支持通过 `window.__DucklyAI` 全局对象或 `window.postMessage` 通道操作任务数据。详见 [docs/ai-api.md](docs/ai-api.md)。

- `queryTasks` — 查询任务（支持按状态/优先级筛选）
- `createTask` — 创建任务
- `updateTask` — 更新任务
- `deleteTask` — 删除任务
- `getTags` — 获取标签列表

## 技术栈

| 层 | 选型 |
|---|------|
| 框架 | React 19 + TypeScript 6 |
| 构建 | Vite 8 |
| 存储 | SQLite WASM (OPFS 持久化) |
| 状态 | Zustand |
| 样式 | Tailwind CSS 4 + CSS 变量 |
| 国际化 | react-i18next（中 / 英） |
| PWA | vite-plugin-pwa（离线可用） |

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # 构建生产版本
pnpm preview    # 预览构建产物
pnpm lint       # Biome 检查
```

## 部署

### Cloudflare Pages（推荐 ⭐）

`public/_headers` 中的 COOP/COEP 头 Cloudflare 原生支持，SQLite WASM 开箱即用。

```bash
# CLI 部署
pnpm wrangler pages deploy dist --project-name=duckly
```

或连接 GitHub 仓库自动部署：Cloudflare Dashboard → Pages → 连接 Git 仓库 → 设置 `pnpm build` / `dist`。

### Vercel

需要创建 `vercel.json` 添加安全头：

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" }
      ]
    }
  ]
}
```

Framework preset 选择 Vite，构建命令 `pnpm build`，输出目录 `dist`。

### Docker

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
COPY public/_headers /usr/share/nginx/html/
```

## 许可证

[MIT](LICENSE) © 2026 [Nico](https://github.com/niyongsheng)
