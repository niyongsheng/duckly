import { create } from "zustand";
import { initDatabase } from "../db/database";
import type { Task, TaskCreate, TaskUpdate } from "../db/schema";

interface TaskStats {
  total: number;
  done: number;
  pending: number;
  completionRate: number;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (data: TaskCreate) => Promise<Task>;
  updateTask: (id: string, data: TaskUpdate) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  getTasksByPriority: (priority: string) => Task[];
  getTasksForDate: (dateKey: string) => Task[];
  getStats: () => TaskStats;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  loadTasks: async () => {
    set({ loading: true, error: null });
    try {
      const db = await initDatabase();
      const tasks = await db.getAllTasks();
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addTask: async (data: TaskCreate) => {
    const db = await initDatabase();
    const task = await db.createTask(data);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: async (id: string, data: TaskUpdate) => {
    const db = await initDatabase();
    const updated = await db.updateTask(id, data);
    if (updated) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
      }));
    }
  },

  deleteTask: async (id: string) => {
    const db = await initDatabase();
    await db.deleteTask(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  toggleTask: async (id: string) => {
    // Optimistic update: toggle instantly in local state
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t,
      ),
    }));
    // Sync to database in background
    try {
      const db = await initDatabase();
      await db.toggleTaskStatus(id);
    } catch (err) {
      console.error("Failed to sync toggle to DB:", err);
    }
  },

  getTasksByPriority: (priority: string) => {
    return get().tasks.filter((t) => t.priority === priority);
  },

  getTasksForDate: (dateKey: string) => {
    return get().tasks.filter((t) => {
      if (!t.dueDate) return false;
      // dateKey format: "YYYY-M-D"
      const d = new Date(t.dueDate);
      const taskDateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      return taskDateKey === dateKey;
    });
  },

  getStats: () => {
    const tasks = get().tasks;
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const pending = total - done;
    return {
      total,
      done,
      pending,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  },
}));
