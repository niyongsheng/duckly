import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";
import { runMigrations } from "./migrations";
import type { Tag, Task, TaskCreate, TaskUpdate, DBNotification } from "./schema";

// SQLite Worker Promiser type
type PromiserFn = (
  method: string,
  opts: Record<string, unknown>,
) => Promise<{
  dbId?: string;
  resultRows?: Record<string, unknown>[];
  error?: string;
}>;

let dbInstance: DatabaseClient | null = null;
let promiser: PromiserFn | null = null;
let currentDbId: string | null = null;

export class DatabaseClient {
  private promiser: PromiserFn;
  private dbId: string;

  constructor(promiser: PromiserFn, dbId: string) {
    this.promiser = promiser;
    this.dbId = dbId;
  }

  async exec(sql: string): Promise<void> {
    const result = await this.promiser("exec", {
      dbId: this.dbId,
      sql,
    });
    if (result?.error) throw new Error(`SQL exec error: ${result.error}`);
  }

  async query<T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>,
  ): Promise<T[]> {
    const result = await this.promiser("exec", {
      dbId: this.dbId,
      sql,
      bind: params,
      rowMode: "object",
      resultRows: [],
    });
    if (result?.error) {
      console.error("[DB] query error:", result.error, "for SQL:", sql);
      return [];
    }
    return (result?.resultRows as T[]) ?? [];
  }

  async get<T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>,
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // ── Task row mapper ──
  // SQLite returns snake_case rows without a `tags` column.
  // Normalise to the camelCase Task type expected by the UI.

  private mapTask(row: Record<string, unknown>): Task {
    return {
      id: row.id as string,
      title: (row.title ?? "") as string,
      description: (row.description ?? "") as string,
      priority: row.priority as Task["priority"],
      status: (row.status ?? "todo") as Task["status"],
      tags: (row.tags ?? []) as string[],
      startDate: (row.startDate ?? row.start_date ?? undefined) as string | undefined,
      dueDate: (row.dueDate ?? row.due_date ?? undefined) as string | undefined,
      repeat: (row.repeat ?? "none") as Task["repeat"],
      createdAt: (row.createdAt ?? row.created_at ?? "") as string,
      updatedAt: (row.updatedAt ?? row.updated_at ?? "") as string,
    };
  }

  // ── Task CRUD ──

  async createTask(data: TaskCreate): Promise<Task> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const task: Task = {
      id,
      title: data.title,
      description: data.description ?? "",
      priority: data.priority,
      status: "todo",
      tags: data.tags ?? [],
      startDate: data.startDate,
      dueDate: data.dueDate,
      repeat: data.repeat ?? "none",
      createdAt: now,
      updatedAt: now,
    };

    await this.promiser("exec", {
      dbId: this.dbId,
      sql: `INSERT INTO tasks (id, title, description, priority, status, start_date, due_date, repeat, created_at, updated_at)
            VALUES ($id, $title, $description, $priority, $status, $startDate, $dueDate, $repeat, $createdAt, $updatedAt)`,
      bind: {
        $id: task.id,
        $title: task.title,
        $description: task.description,
        $priority: task.priority,
        $status: task.status,
        $startDate: task.startDate ?? null,
        $dueDate: task.dueDate ?? null,
        $repeat: task.repeat,
        $createdAt: task.createdAt,
        $updatedAt: task.updatedAt,
      },
    });

    return task;
  }

  async updateTask(id: string, data: TaskUpdate): Promise<Task | null> {
    const existing = await this.getTask(id);
    if (!existing) return null;

    const updates: string[] = [];
    const bind: Record<string, unknown> = { $id: id };

    if (data.title !== undefined) {
      updates.push("title = $title");
      bind.$title = data.title;
    }
    if (data.description !== undefined) {
      updates.push("description = $description");
      bind.$description = data.description;
    }
    if (data.priority !== undefined) {
      updates.push("priority = $priority");
      bind.$priority = data.priority;
    }
    if (data.startDate !== undefined) {
      updates.push("start_date = $startDate");
      bind.$startDate = data.startDate;
    }
    if (data.dueDate !== undefined) {
      updates.push("due_date = $dueDate");
      bind.$dueDate = data.dueDate;
    }
    if (data.repeat !== undefined) {
      updates.push("repeat = $repeat");
      bind.$repeat = data.repeat;
    }
    if (data.status !== undefined) {
      updates.push("status = $status");
      bind.$status = data.status;
    }

    if (updates.length > 0) {
      const now = new Date().toISOString();
      updates.push("updated_at = $updatedAt");
      bind.$updatedAt = now;

      await this.promiser("exec", {
        dbId: this.dbId,
        sql: `UPDATE tasks SET ${updates.join(", ")} WHERE id = $id`,
        bind,
      });
    }

    return this.getTask(id);
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "DELETE FROM tasks WHERE id = $id",
      bind: { $id: id },
    });
    return true;
  }

  async toggleTaskStatus(id: string): Promise<Task | null> {
    const task = await this.getTask(id);
    if (!task) return null;

    // Binary toggle: todo/in-progress → done, done → todo
    const nextStatus = task.status === "done" ? "todo" : "done";

    return this.updateTask(id, {
      title: task.title,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      dueDate: task.dueDate,
      repeat: task.repeat,
      tags: task.tags,
      status: nextStatus,
    });
  }

  async getTask(id: string): Promise<Task | null> {
    const row = await this.get<Record<string, unknown>>("SELECT * FROM tasks WHERE id = $id", {
      $id: id,
    });
    return row ? this.mapTask(row) : null;
  }

  async getAllTasks(): Promise<Task[]> {
    const rows = await this.query<Record<string, unknown>>("SELECT * FROM tasks ORDER BY created_at DESC");
    return rows.map((r) => this.mapTask(r));
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    const rows = await this.query<Record<string, unknown>>(
      "SELECT * FROM tasks WHERE priority = $priority ORDER BY created_at DESC",
      { $priority: priority },
    );
    return rows.map((r) => this.mapTask(r));
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const rows = await this.query<Record<string, unknown>>(
      "SELECT * FROM tasks WHERE status = $status ORDER BY created_at DESC",
      { $status: status },
    );
    return rows.map((r) => this.mapTask(r));
  }

  // ── Tag CRUD ──

  async createTag(name: string, color: string, isSeed?: boolean): Promise<Tag> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const tag: Tag = { id, name, color, createdAt: now, isSeed: isSeed ? 1 : 0 };

    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "INSERT INTO tags (id, name, color, created_at, is_seed) VALUES ($id, $name, $color, $createdAt, $isSeed)",
      bind: {
        $id: tag.id,
        $name: tag.name,
        $color: tag.color,
        $createdAt: tag.createdAt,
        $isSeed: tag.isSeed ?? 0,
      },
    });

    return tag;
  }

  async getAllTags(): Promise<Tag[]> {
    return this.query<Tag>("SELECT * FROM tags ORDER BY name");
  }

  async deleteTag(id: string): Promise<boolean> {
    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "DELETE FROM tags WHERE id = $id",
      bind: { $id: id },
    });
    return true;
  }

  async deleteAllTasks(): Promise<void> {
    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "DELETE FROM tasks",
    });
  }

  // ── Notification CRUD ──

  async getAllNotifications(): Promise<DBNotification[]> {
    return this.query<DBNotification>(
      "SELECT * FROM notifications ORDER BY created_at DESC",
    );
  }

  async createNotification(data: {
    id: string;
    taskId: string;
    taskTitle: string;
    type: string;
    createdAt: string;
  }): Promise<void> {
    await this.promiser("exec", {
      dbId: this.dbId,
      sql: `INSERT INTO notifications (id, task_id, task_title, type, read, created_at)
            VALUES ($id, $taskId, $taskTitle, $type, 0, $createdAt)`,
      bind: {
        $id: data.id,
        $taskId: data.taskId,
        $taskTitle: data.taskTitle,
        $type: data.type,
        $createdAt: data.createdAt,
      },
    });
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "UPDATE notifications SET read = 1 WHERE id = $id",
      bind: { $id: id },
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "UPDATE notifications SET read = 1 WHERE read = 0",
    });
  }

  async deleteAllNotifications(): Promise<void> {
    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "DELETE FROM notifications",
    });
  }

  async getUnreadCount(): Promise<number> {
    const rows = await this.query<{ "COUNT(*)": number }>(
      "SELECT COUNT(*) FROM notifications WHERE read = 0",
    );
    return rows[0]?.["COUNT(*)"] ?? 0;
  }

  async hasNotification(
    taskId: string,
    type: string,
  ): Promise<boolean> {
    const rows = await this.query(
      "SELECT 1 FROM notifications WHERE task_id = $taskId AND type = $type LIMIT 1",
      { $taskId: taskId, $type: type },
    );
    return rows.length > 0;
  }
}

export async function initDatabase(): Promise<DatabaseClient> {
  if (dbInstance) return dbInstance;

  const factory = await sqlite3Worker1Promiser();
  promiser = factory as PromiserFn;

  // Open database with OPFS persistence
  const p = promiser; // TS narrows after assignment
  const dbResult = await p("open", {
    filename: "duckly.db",
  });
  currentDbId = dbResult.dbId ?? "default";

  dbInstance = new DatabaseClient(p, currentDbId);

  // Run migrations
  await runMigrations(async (sql: string) => {
    await p("exec", { dbId: currentDbId, sql });
  });

  // Column mapping (snake_case → camelCase + default tags) handled in `mapTask()`.

  return dbInstance;
}

export function getDatabase(): DatabaseClient | null {
  return dbInstance;
}
