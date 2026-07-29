import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "../db/schema";

/* ── Types ── */

export type WebhookEvent = "due" | "done" | "create" | "change";
export type NotifToggle =
  | "taskReminder"
  | "deadlinePush"
  | "sound"
  | "webhookPush"
  | "preRemind";
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
  webhookEvents: { due: true, done: true, create: false, change: true },
  toggles: {
    taskReminder: true,
    deadlinePush: true,
    sound: false,
    webhookPush: true,
    preRemind: true,
  },
};

const MAX_NOTIFICATIONS = 100;

/* ── Webhook helper ── */

export async function fireWebhook(
  url: string,
  event: string,
  task: Partial<Task>,
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

/* ── Store interface ── */

interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings;

  // Actions
  addNotification: (
    taskId: string,
    taskTitle: string,
    type: NotificationType,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;

  // Settings actions
  setWebhookUrl: (url: string) => void;
  toggleWebhookEvent: (event: WebhookEvent) => void;
  setToggle: (key: NotifToggle, value: boolean) => void;
  testWebhook: () => Promise<boolean>;
  deleteWebhook: () => void;

  // Getters
  unreadCount: () => number;
  hasNotified: (taskId: string, type: NotificationType) => boolean;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      settings: { ...DEFAULT_SETTINGS },

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
          return {
            notifications: [notification, ...state.notifications].slice(
              0,
              MAX_NOTIFICATIONS,
            ),
          };
        });
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
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
        if (
          !settings.webhookUrl ||
          !settings.webhookUrl.startsWith("http")
        ) {
          return false;
        }
        return fireWebhook(settings.webhookUrl, "test", {});
      },

      deleteWebhook: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            webhookUrl: "",
            webhookEvents: { due: true, done: true, create: false, change: true },
          },
        }));
      },

      unreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      hasNotified: (taskId, type) => {
        return get().notifications.some(
          (n) => n.taskId === taskId && n.type === type,
        );
      },
    }),
    {
      name: "duckly-notifications",
      partialize: (state) => ({
        notifications: state.notifications,
        settings: state.settings,
      }),
    },
  ),
);
