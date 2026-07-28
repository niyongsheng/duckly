import type { Task } from "../db/schema";
import { useI18n } from "../i18n/config";
import { PRIORITY_BG_COLORS } from "../constants";

interface DragOverlayContentProps {
  task: Task;
}

export default function DragOverlayContent({ task }: DragOverlayContentProps) {
  const { t } = useI18n();
  const accentColor = PRIORITY_BG_COLORS[task.priority] || "var(--blue)";

  return (
    <div
      className="task-overlay-card"
      style={{
        borderLeft: `6px solid ${accentColor}`,
        opacity: 0.95,
        transform: "rotate(2deg)",
      }}
    >
      <span
        className="tag tag-pill"
        style={{
          background: accentColor,
          fontSize: 10,
          padding: "1px 6px",
        }}
      >
        {t("priority." + task.priority + "_short")}
      </span>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          marginTop: 4,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {task.title}
      </p>
    </div>
  );
}
