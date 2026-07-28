import { getDatabase } from "../db/database";
import type { Task, TaskCreate, TaskUpdate } from "../db/schema";
import { TaskCreateSchema, TaskUpdateSchema } from "../db/schema";

export interface MethodResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const AI_METHODS = {
  queryTasks: async (params: {
    status?: string;
    priority?: string;
  }): Promise<MethodResult<Task[]>> => {
    const db = getDatabase();
    if (!db) return { success: false, error: "Database not initialized" };

    try {
      let tasks = await db.getAllTasks();
      if (params.status) {
        tasks = tasks.filter((t) => t.status === params.status);
      }
      if (params.priority) {
        tasks = tasks.filter((t) => t.priority === params.priority);
      }
      return { success: true, data: tasks };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },

  createTask: async (params: TaskCreate): Promise<MethodResult<Task>> => {
    const db = getDatabase();
    if (!db) return { success: false, error: "Database not initialized" };

    const parsed = TaskCreateSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    try {
      const task = await db.createTask(parsed.data);
      return { success: true, data: task };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },

  updateTask: async (params: { id: string } & TaskUpdate): Promise<MethodResult<Task>> => {
    const db = getDatabase();
    if (!db) return { success: false, error: "Database not initialized" };

    const { id, ...updates } = params;
    const parsed = TaskUpdateSchema.safeParse(updates);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    try {
      const task = await db.updateTask(id, parsed.data);
      if (!task) return { success: false, error: "Task not found" };
      return { success: true, data: task };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },

  deleteTask: async (params: { id: string }): Promise<MethodResult<void>> => {
    const db = getDatabase();
    if (!db) return { success: false, error: "Database not initialized" };

    try {
      await db.deleteTask(params.id);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },

  getTags: async (): Promise<MethodResult<{ id: string; name: string }[]>> => {
    const db = getDatabase();
    if (!db) return { success: false, error: "Database not initialized" };

    try {
      const tags = await db.getAllTags();
      return {
        success: true,
        data: tags.map((t) => ({ id: t.id, name: t.name })),
      };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },
};

export type AIMethodName = keyof typeof AI_METHODS;
