import { z } from "zod";

// ── Zod validation schemas ──

export const PriorityEnum = z.enum([
  "urgent-important",
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important",
]);

export const TaskStatusEnum = z.enum(["todo", "in-progress", "done"]);

export const RepeatEnum = z.enum(["none", "daily", "weekly", "monthly"]);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(""),
  priority: PriorityEnum,
  status: TaskStatusEnum,
  tags: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  repeat: RepeatEnum.default("none"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: PriorityEnum,
  status: TaskStatusEnum.optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  repeat: RepeatEnum.optional(),
});

export const TaskUpdateSchema = TaskCreateSchema.partial();

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z.string(),
  createdAt: z.string(),
  isSeed: z.number().optional(),
});

export const TagCreateSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string(),
});

export type Priority = z.infer<typeof PriorityEnum>;
export type TaskStatus = z.infer<typeof TaskStatusEnum>;
export type RepeatType = z.infer<typeof RepeatEnum>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type TagCreate = z.infer<typeof TagCreateSchema>;

// ── SQL table definitions ──

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT NOT NULL CHECK(priority IN ('urgent-important','not-urgent-important','urgent-not-important','not-urgent-not-important')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo','in-progress','done')),
  start_date TEXT,
  due_date TEXT,
  repeat TEXT NOT NULL DEFAULT 'none' CHECK(repeat IN ('none','daily','weekly','monthly')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_seed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_tags (
  task_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
`;

export const MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS _migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
`;

export const NOTIFICATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  task_title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN (
    'deadline_approaching','deadline_due','deadline_overdue',
    'task_completed','task_created','deadline_changed'
  )),
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
`;

export interface DBNotification {
  id: string;
  task_id: string;
  task_title: string;
  type: string;
  read: number;
  created_at: string;
}
