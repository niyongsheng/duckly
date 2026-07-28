# Duckly

<img src="./logo.png" width="140" height="140" alt="Duckly Logo">

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_WASM-OPFS-003B57?logo=sqlite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-离线可用-5A0FC8?logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

一款精致的事务管理 PWA，支持 **日历视图 + 四象限法则 + 任务列表** 三种模式管理日程。

## 技术栈

| 层         | 选型                          |
| ---------- | ----------------------------- |
| 框架       | React 19 + TypeScript 6       |
| 构建       | Vite 8                        |
| 存储       | SQLite WASM (OPFS 持久化)     |
| 状态       | Zustand                       |
| 样式       | Tailwind CSS 4 + CSS 变量     |
| 国际化     | react-i18next（中 / 英）      |
| PWA        | vite-plugin-pwa（离线可用）    |
| AI 通道    | 内嵌 AI 输入通道（读写/只读）  |

## 功能

- **日历视图** — 月 / 周 / 日 / 年，截止日期概览
- **四象限视图** — 艾森豪威尔矩阵拖拽分类
- **任务列表** — 搜索、筛选、排序、分页
- **标签系统** — 自定义标签管理
- **批量操作** — 清空已完成 / 删除全部
- **Excel 导入导出** — 数据备份与批量导入
- **统计面板** — 完成率分布图表
- **通知 & Webhook** — 截止提醒、外部推送
- **深色模式 / 紧凑布局**
- **PWA 离线可用** — 所有数据本地存储

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # 构建生产版本
pnpm preview    # 预览构建产物
pnpm lint       # Biome 检查
```

## 许可证

[MIT](LICENSE) © 2026 Nico
