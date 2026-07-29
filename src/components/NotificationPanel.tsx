import { useI18n } from "../i18n/config";
import { useNotificationStore } from "../stores/useNotificationStore";
import { formatRelative } from "../utils/date";

const TYPE_ICON_COLORS: Record<string, string> = {
  deadline_approaching: "var(--coral)",
  deadline_due: "var(--coral)",
  deadline_overdue: "var(--coral)",
  task_completed: "var(--blue)",
  task_created: "var(--yellow)",
  deadline_changed: "var(--cyan)",
};

function getTypeIcon(type: string) {
  // Warning/alert icon for deadlines, check for completion, plus for create, edit for change
  switch (type) {
    case "deadline_approaching":
    case "deadline_due":
    case "deadline_overdue":
      return (
        <svg className="icon" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
          <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
          <path d="M12 8v4M12 16h0" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "task_completed":
      return (
        <svg className="icon" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
          <path d="M9 11l3 3L22 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "task_created":
      return (
        <svg className="icon" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
          <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "deadline_changed":
      return (
        <svg className="icon" viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
          <path d="M15.232 5.232l3.536 3.536M9 11l7.5-7.5a2 2 0 012.828 0l1.172 1.172a2 2 0 010 2.828L11 17H7v-4l8.5-8.5z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function NotificationPanel() {
  const { t } = useI18n();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);

  return (
    <div className="notif-panel" style={{ display: "block" }}>
      <div className="notif-panel-header">
        <span className="notif-panel-title">
          <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t("notif.title")}
          {unreadCount > 0 && <> · {unreadCount} {t("notif.unread")}</>}
        </span>
        {unreadCount > 0 && (
          <button className="notif-panel-clear" onClick={markAllAsRead}>
            {t("notif.markAllRead")}
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="notif-empty">{t("notif.empty")}</div>
      )}

      {notifications.slice(0, 50).map((n) => (
        <div
          key={n.id}
          className={`notif-item ${n.read ? "" : "unread"}`}
          onClick={() => markAsRead(n.id)}
          style={{ cursor: "pointer" }}
        >
          <div
            className="notif-item-icon"
            style={{
              background: TYPE_ICON_COLORS[n.type] || "var(--blue)",
              borderColor: TYPE_ICON_COLORS[n.type] || "var(--blue)",
            }}
          >
            {getTypeIcon(n.type)}
          </div>
          <div className="notif-item-content">
            <div className="notif-item-title">{n.taskTitle}</div>
            <div className="notif-item-time">{formatRelative(n.createdAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
