import type { Task } from "../db/schema";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";
import { useI18n } from "../i18n/config";
import { useConfirm } from "../hooks/useConfirm";
import { PRIORITY_BG_COLORS } from "../constants";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { t } = useI18n();
  const { toggleTask, deleteTask } = useTaskStore();
  const { openTaskForm } = useUIStore();
  const [confirm, ConfirmDialog] = useConfirm();

  return (
    <>
      <ConfirmDialog />
      <div className="task-item">
      <input
        type="checkbox"
        className="task-checkbox"
        checked={task.status === "done"}
        onChange={() => toggleTask(task.id)}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 2 }}
        >
          <span
            className="tag tag-pill"
            style={{
              fontSize: 10,
              padding: "1px 6px",
              background: PRIORITY_BG_COLORS[task.priority] || "var(--blue)",
              borderColor: "var(--dark-gray)",
            }}
          >
            {t("priority." + task.priority + "_short")}
          </span>
          {task.dueDate && (
            <span style={{ fontSize: 11, color: "var(--medium-gray)" }}>
              {new Date(task.dueDate!).toLocaleDateString("zh-CN")}
            </span>
          )}
          {task.repeat !== "none" && (
            <span style={{ fontSize: 11, color: "var(--medium-gray)" }}>↺ {task.repeat}</span>
          )}
        </div>
        <p
          className={`task-text ${task.status === "done" ? "completed" : ""}`}
          style={{ fontSize: 14, fontWeight: 500 }}
        >
          {task.title}
        </p>
        {task.description && (
          <p
            style={{
              fontSize: 12,
              color: "var(--medium-gray)",
              marginTop: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.description}
          </p>
        )}
        {task.tags && task.tags.length > 0 && (
          <div className="tag-group" style={{ marginTop: 6 }}>
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="tag tag-pill"
                style={{ fontSize: 10, padding: "1px 6px", background: "var(--bg-page)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="task-actions">
        <button className="task-btn-edit" onClick={() => openTaskForm(task.id)}>
          <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15.232 5.232l3.536 3.536M9 11l7.5-7.5a2 2 0 0 1 2.828 0l1.172 1.172a2 2 0 0 1 0 2.828L11 17H7v-4l8.5-8.5z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          className="task-btn-delete"
          onClick={async () => {
            const ok = await confirm({ message: t("task.confirmDelete") });
            if (ok) deleteTask(task.id);
          }}
        >
          <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6l-12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
    </>
  );
}
