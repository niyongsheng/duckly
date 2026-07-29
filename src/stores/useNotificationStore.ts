import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initDatabase } from "../db/database";
import type { Task } from "../db/schema";

/* ── Types ── */

export type WebhookEvent = "due" | "done" | "create" | "change" | "delete";
export type NotifToggle = "taskReminder" | "deadlinePush" | "sound" | "webhookPush" | "preRemind";
export type NotificationType =
  | "deadline_approaching"
  | "deadline_due"
  | "deadline_overdue"
  | "task_completed"
  | "task_created"
  | "deadline_changed";

export interface Notification {
  id: string;
  taskId: string;
  taskTitle: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface WebhookEvents {
  due: boolean;
  done: boolean;
  create: boolean;
  change: boolean;
  delete: boolean;
}

export interface NotifToggles {
  taskReminder: boolean;
  deadlinePush: boolean;
  sound: boolean;
  webhookPush: boolean;
  preRemind: boolean;
}

export interface NotificationSettings {
  webhookUrl: string;
  webhookEvents: WebhookEvents;
  toggles: NotifToggles;
}

/* ── Defaults ── */

const DEFAULT_SETTINGS: NotificationSettings = {
  webhookUrl: "",
  webhookEvents: { due: true, done: true, create: false, change: true, delete: true },
  toggles: {
    taskReminder: true,
    deadlinePush: true,
    sound: false,
    webhookPush: true,
    preRemind: true,
  },
};

const MAX_NOTIFICATIONS = 100;
const MAX_WEBHOOK_LOGS = 50;

/* ── Webhook helper ── */

export interface WebhookLog {
  id: string;
  event: string;
  taskTitle: string;
  url: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

export async function fireWebhook(
  url: string,
  event: string,
  task: Partial<Task>,
): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        event,
        task,
        timestamp: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fire a webhook and record the result in the delivery log.
 * Returns the success boolean for callers that need it.
 */
export async function fireWebhookAndLog(
  url: string,
  event: string,
  task: Partial<Task>,
): Promise<boolean> {
  const ok = await fireWebhook(url, event, task);
  // Push log entry via the store
  const ns = useNotificationStore.getState();
  ns.addWebhookLog(createWebhookLog(event, task.title ?? "", url, ok));
  return ok;
}

function createWebhookLog(
  event: string,
  taskTitle: string,
  url: string,
  success: boolean,
  error?: string,
): WebhookLog {
  return {
    id: crypto.randomUUID(),
    event,
    taskTitle,
    url,
    success,
    error,
    timestamp: new Date().toISOString(),
  };
}

/* ── Legacy migration ── */

async function migrateLegacyNotifications(
  db: import("../db/database").DatabaseClient,
): Promise<void> {
  try {
    const legacyRaw = localStorage.getItem("duckly-notifications");
    if (!legacyRaw) return;

    const parsed = JSON.parse(legacyRaw);
    const legacyNotifs: Notification[] = parsed?.state?.notifications ?? [];
    if (legacyNotifs.length === 0) {
      localStorage.removeItem("duckly-notifications");
      return;
    }

    for (const n of legacyNotifs) {
      await db.createNotification({
        id: n.id,
        taskId: n.taskId,
        taskTitle: n.taskTitle,
        type: n.type,
        createdAt: n.createdAt,
      });
    }

    localStorage.removeItem("duckly-notifications");
    console.log(`[notif] Migrated ${legacyNotifs.length} notifications to SQLite`);
  } catch (e) {
    console.warn("[notif] Legacy migration failed:", e);
  }
}

/* ── Store interface ── */

interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;

  // Webhook delivery logs (memory-only, not persisted)
  webhookLogs: WebhookLog[];

  // Actions
  loadNotifications: () => Promise<void>;
  addNotification: (taskId: string, taskTitle: string, type: NotificationType) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;

  // Settings actions
  setWebhookUrl: (url: string) => void;
  toggleWebhookEvent: (event: WebhookEvent) => void;
  setToggle: (key: NotifToggle, value: boolean) => void;
  testWebhook: () => Promise<boolean>;
  deleteWebhook: () => void;

  // Webhook log actions
  addWebhookLog: (log: WebhookLog) => void;
  clearWebhookLogs: () => void;

  // Getters
  unreadCount: () => number;
  hasNotified: (taskId: string, type: NotificationType) => boolean;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: { ...DEFAULT_SETTINGS },
      webhookLogs: [],

      loadNotifications: async () => {
        try {
          const db = await initDatabase();

          // Migrate legacy localStorage data on first load
          await migrateLegacyNotifications(db);

          const rows = await db.getAllNotifications();
          const notifs: Notification[] = rows.map((r) => ({
            id: r.id,
            taskId: r.task_id,
            taskTitle: r.task_title,
            type: r.type as NotificationType,
            read: r.read === 1,
            createdAt: r.created_at,
          }));
          set({ notifications: notifs });
        } catch (e) {
          console.warn("[notif] Failed to load from DB, using empty:", e);
        }
      },

      addNotification: (taskId, taskTitle, type) => {
        set((state) => {
          const notification: Notification = {
            id: crypto.randomUUID(),
            taskId,
            taskTitle,
            type,
            read: false,
            createdAt: new Date().toISOString(),
          };

          // Sync to DB in background
          initDatabase().then((db) => {
            db.createNotification({
              id: notification.id,
              taskId,
              taskTitle,
              type,
              createdAt: notification.createdAt,
            }).catch((e) => console.warn("[notif] DB write failed:", e));
          });

          return {
            notifications: [notification, ...state.notifications].slice(0, MAX_NOTIFICATIONS),
          };
        });
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));

        // Sync to DB in background
        initDatabase().then((db) => {
          db.markNotificationRead(id).catch((e) =>
            console.warn("[notif] DB markAsRead failed:", e),
          );
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));

        initDatabase().then((db) => {
          db.markAllNotificationsRead().catch((e) =>
            console.warn("[notif] DB markAllAsRead failed:", e),
          );
        });
      },

      clearAll: () => {
        set({ notifications: [] });

        initDatabase().then((db) => {
          db.deleteAllNotifications().catch((e) => console.warn("[notif] DB clearAll failed:", e));
        });
      },

      setWebhookUrl: (url) => {
        set((state) => ({
          settings: { ...state.settings, webhookUrl: url },
        }));
      },

      toggleWebhookEvent: (event) => {
        set((state) => ({
          settings: {
            ...state.settings,
            webhookEvents: {
              ...state.settings.webhookEvents,
              [event]: !state.settings.webhookEvents[event],
            },
          },
        }));
      },

      setToggle: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            toggles: { ...state.settings.toggles, [key]: value },
          },
        }));
      },

      testWebhook: async () => {
        const { settings } = get();
        if (!settings.webhookUrl || !settings.webhookUrl.startsWith("http")) {
          return false;
        }
        const mockTask: Partial<Task> = {
          title: "Test Notification from Duckly",
          priority: "not-urgent-not-important",
        };
        const ok = await fireWebhook(settings.webhookUrl, "test", mockTask);
        get().addWebhookLog(createWebhookLog("test", "Test Notification", settings.webhookUrl, ok));
        return ok;
      },

      deleteWebhook: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            webhookUrl: "",
          },
        }));
      },

      addWebhookLog: (log) => {
        set((state) => ({
          webhookLogs: [log, ...state.webhookLogs].slice(0, MAX_WEBHOOK_LOGS),
        }));
      },

      clearWebhookLogs: () => {
        set({ webhookLogs: [] });
      },

      unreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      hasNotified: (taskId, type) => {
        return get().notifications.some((n) => n.taskId === taskId && n.type === type);
      },
    }),
    {
      name: "duckly-notifications",
      // Only persist settings (webhook config) to localStorage
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
);
