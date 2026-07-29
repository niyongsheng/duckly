# Duckly AI API

Duckly exposes a JSON-RPC 2.0 interface for AI agents to read and write task data. This document describes how AI agents can interact with Duckly programmatically.

---

## Quick Start

```js
// In browser console (when Duckly is open):
const duckly = window.__DucklyAI;

// Read all tasks
const tasks = await duckly.queryTasks({});
console.log(tasks);

// Create a task
const newTask = await duckly.createTask({
  title: "Review pull request",
  priority: "urgent-important",
  tags: ["技术开发"],
});
```

---

## 1. `window.__DucklyAI` Global API

When Duckly is running in the browser, all AI methods are available through `window.__DucklyAI`. This is the easiest way for in-browser AI agents (extensions, devtools, bookmarklets) to interact.

### Methods

#### `queryTasks(params)`

Query tasks with optional filters.

```js
await window.__DucklyAI.queryTasks({})
await window.__DucklyAI.queryTasks({ status: "todo" })
await window.__DucklyAI.queryTasks({ priority: "urgent-important" })
await window.__DucklyAI.queryTasks({ status: "done", priority: "not-urgent-important" })
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | No | Filter by status: `"todo"`, `"in-progress"`, `"done"` |
| `priority` | `string` | No | Filter by priority: `"urgent-important"`, `"not-urgent-important"`, `"urgent-not-important"`, `"not-urgent-not-important"` |

**Returns:** `Task[]`

---

#### `createTask(params)`

Create a new task.

```js
await window.__DucklyAI.createTask({
  title: "Prepare quarterly report",
  description: "Gather Q2 data and create slides",
  priority: "urgent-important",
  tags: ["产品需求"],
  startDate: "2026-07-29T09:00",
  dueDate: "2026-07-30T18:00",
  repeat: "none",
})
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | **Yes** | Task title (1-200 chars) |
| `description` | `string` | No | Task description |
| `priority` | `string` | **Yes** | Must be one of the four priority values |
| `tags` | `string[]` | No | Tag names |
| `startDate` | `string` | No | ISO datetime string |
| `dueDate` | `string` | No | ISO datetime string |
| `repeat` | `string` | No | `"none"`, `"daily"`, `"weekly"`, `"monthly"` |

**Priority values:**

| Value | Meaning |
|-------|---------|
| `"urgent-important"` | Do First — Urgent & Important |
| `"not-urgent-important"` | Schedule — Important & Not Urgent |
| `"urgent-not-important"` | Delegate — Urgent & Not Important |
| `"not-urgent-not-important"` | Eliminate — Not Urgent & Not Important |

**Returns:** `Task`

---

#### `updateTask(params)`

Update an existing task. Only include fields you want to change.

```js
await window.__DucklyAI.updateTask({
  id: "task-uuid-here",
  title: "Updated title",
  status: "done",
  priority: "not-urgent-important",
})
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | **Yes** | Task ID (UUID) |
| Any `Task` field | varies | No | Fields to update |

**Returns:** `Task`

---

#### `deleteTask(params)`

Delete a task by ID.

```js
await window.__DucklyAI.deleteTask({ id: "task-uuid-here" })
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | **Yes** | Task ID (UUID) |

---

#### `getTags()`

Get all tags.

```js
await window.__DucklyAI.getTags()
```

**Returns:** `{ id: string, name: string }[]`

---

## 2. `window.postMessage` JSON-RPC Channel

Duckly also listens for JSON-RPC 2.0 messages via `window.postMessage`. This is useful for cross-origin AI agents (extensions, iframes, or other browser automation).

### Request Format

```json
{
  "jsonrpc": "2.0",
  "id": "request-1",
  "method": "queryTasks",
  "params": { "status": "todo" }
}
```

### Response Format

```json
{
  "jsonrpc": "2.0",
  "id": "request-1",
  "result": [ /* Task objects */ ]
}
```

Error response:

```json
{
  "jsonrpc": "2.0",
  "id": "request-1",
  "error": {
    "code": -32001,
    "message": "Method 'createTask' requires readwrite permission, current: readonly"
  }
}
```

### Example (from browser extension or iframe)

```js
// Send request
window.postMessage({
  jsonrpc: "2.0",
  id: crypto.randomUUID(),
  method: "queryTasks",
  params: {},
}, "*");

// Listen for response
window.addEventListener("message", (event) => {
  if (event.data?.jsonrpc === "2.0") {
    console.log("Duckly AI response:", event.data);
  }
});
```

---

## 3. Available Methods

| Method | Permission | Description |
|--------|-----------|-------------|
| `queryTasks` | `readonly` | Query tasks with optional status/priority filters |
| `getTags` | `readonly` | List all tags |
| `createTask` | `readwrite` | Create a new task |
| `updateTask` | `readwrite` | Update an existing task |
| `deleteTask` | `readwrite` | Delete a task |

---

## 4. Permission Model

Duckly has two permission levels:

| Level | Allowed Methods |
|-------|----------------|
| `readonly` | `queryTasks`, `getTags` |
| `readwrite` | All methods |

The user controls permission in Duckly's Settings → AI Channel. When the AI channel is off, all methods return permission errors.

---

## 5. Data Types

### Task

```typescript
interface Task {
  id: string;            // UUID
  title: string;         // 1-200 chars
  description: string;   // optional, max 1000 chars
  priority: Priority;    // "urgent-important" | "not-urgent-important" | "urgent-not-important" | "not-urgent-not-important"
  status: TaskStatus;    // "todo" | "in-progress" | "done"
  tags: string[];        // tag names
  startDate?: string;    // ISO datetime
  dueDate?: string;      // ISO datetime
  repeat: RepeatType;    // "none" | "daily" | "weekly" | "monthly"
  createdAt: string;     // ISO datetime
  updatedAt: string;     // ISO datetime
}
```

### Tag

```typescript
interface Tag {
  id: string;            // UUID
  name: string;          // 1-50 chars
}
```

---

## 6. Preset Tags

Chinese: `技术开发, 产品需求, 个人成长, 日常事务`
English: `Tech, Product, Growth, Routine`

When creating a task, you can use any string as a tag. These presets are shown in the UI for convenience.
