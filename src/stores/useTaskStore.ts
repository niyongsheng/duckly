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
    // Snapshot previous state for rollback
    const prevTasks = get().tasks;
    // Optimistic update: apply immediately in local state
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t,
      ),
    }));
    // Sync to database in background
    try {
      const db = await initDatabase();
      await db.updateTask(id, data);
    } catch (err) {
      console.error("Failed to sync update to DB:", err);
      // Rollback local state on failure
      set({ tasks: prevTasks });
    }
  },

  deleteTask: async (id: string) => {
    const db = await initDatabase();
    await db.deleteTask(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  toggleTask: async (id: string) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus: Task["status"] = task.status === "done" ? "todo" : "done";
    await get().updateTask(id, { status: newStatus });
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
