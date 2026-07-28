import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";
import { runMigrations } from "./migrations";
import type { Tag, Task, TaskCreate, TaskUpdate } from "./schema";

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
    await this.promiser("exec", {
      dbId: this.dbId,
      sql,
    });
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
    return (result?.resultRows as T[]) ?? [];
  }

  async get<T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>,
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
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
    return this.get<Task>("SELECT * FROM tasks WHERE id = $id", { $id: id });
  }

  async getAllTasks(): Promise<Task[]> {
    return this.query<Task>("SELECT * FROM tasks ORDER BY created_at DESC");
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    return this.query<Task>(
      "SELECT * FROM tasks WHERE priority = $priority ORDER BY created_at DESC",
      {
        $priority: priority,
      },
    );
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return this.query<Task>("SELECT * FROM tasks WHERE status = $status ORDER BY created_at DESC", {
      $status: status,
    });
  }

  // ── Tag CRUD ──

  async createTag(name: string, color: string): Promise<Tag> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const tag: Tag = { id, name, color, createdAt: now };

    await this.promiser("exec", {
      dbId: this.dbId,
      sql: "INSERT INTO tags (id, name, color, created_at) VALUES ($id, $name, $color, $createdAt)",
      bind: {
        $id: tag.id,
        $name: tag.name,
        $color: tag.color,
        $createdAt: tag.createdAt,
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

  // Convert column names: snake_case -> camelCase mapping
  // The SQLite returns snake_case columns from our schema.
  // We handle this by using aliases in queries or post-processing.
  // For simplicity, we'll keep snake_case in SQL and convert in the store layer.

  return dbInstance;
}

export function getDatabase(): DatabaseClient | null {
  return dbInstance;
}
