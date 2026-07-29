import { useEffect, useRef } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import {
  useNotificationStore,
  fireWebhook,
} from "../stores/useNotificationStore";
import { isDueToday, isDueTomorrow, isOverdue } from "../utils/date";

const CHECK_INTERVAL = 60_000; // 60 seconds

export function useReminder() {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const tasks = useTaskStore.getState().tasks;
      const ns = useNotificationStore.getState();
      const { toggles, webhookUrl } = ns.settings;

      for (const task of tasks) {
        if (task.status === "done" || !task.dueDate) continue;

        const dedupKey = `${task.id}_${task.dueDate}`;
        if (notifiedRef.current.has(dedupKey)) continue;

        let notifType: string | null = null;
        let isWebhookEvent = false;

        // 24h pre-reminder
        if (toggles.preRemind && isDueTomorrow(task.dueDate)) {
          notifType = "deadline_approaching";
          isWebhookEvent = true;
        }

        // Due today
        if (toggles.deadlinePush && isDueToday(task.dueDate)) {
          notifType = "deadline_due";
          isWebhookEvent = true;
        }

        // Overdue (fire once when first detected overdue)
        if (isOverdue(task.dueDate) && !isDueToday(task.dueDate)) {
          notifType = "deadline_overdue";
          isWebhookEvent = true;
        }

        if (!notifType) continue;

        // Skip if already notified (via persisted store)
        if (ns.hasNotified(task.id, notifType as any)) {
          notifiedRef.current.add(dedupKey);
          continue;
        }

        // Add to notification history
        ns.addNotification(task.id, task.title, notifType as any);
        notifiedRef.current.add(dedupKey);

        // Desktop notification
        if (toggles.taskReminder && "Notification" in window && Notification.permission === "granted") {
          const messages: Record<string, string> = {
            deadline_approaching: `「${task.title}」due tomorrow`,
            deadline_due: `「${task.title}」due today`,
            deadline_overdue: `「${task.title}」overdue`,
          };
          new Notification("Duckly", {
            body: messages[notifType] || task.title,
            icon: "/icons/android-chrome-192x192.png",
          });
        }

        // Webhook
        if (isWebhookEvent && webhookUrl && toggles.webhookPush) {
          const eventMap: Record<string, string> = {
            deadline_approaching: "due",
            deadline_due: "due",
            deadline_overdue: "due",
          };
          fireWebhook(webhookUrl, eventMap[notifType] || "due", task);
        }
      }
    };

    // Run immediately on mount
    check();
    const timer = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(timer);
  }, []);
}
