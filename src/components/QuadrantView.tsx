import { useCallback, useMemo, useState } from "react";
import type { Priority } from "../db/schema";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";
import TaskCard from "./TaskCard";

export default function QuadrantView() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const QUADRANT_CONFIGS = useMemo(() => [
    { key: "urgent-important" as Priority, dotColor: "coral", bgColor: "coral", title: t("quadrant.u1.title"), subtitle: t("quadrant.u1.desc") },
    { key: "not-urgent-important" as Priority, dotColor: "blue", bgColor: "blue", title: t("quadrant.u2.title"), subtitle: t("quadrant.u2.desc") },
    { key: "urgent-not-important" as Priority, dotColor: "yellow", bgColor: "yellow", title: t("quadrant.n1.title"), subtitle: t("quadrant.n1.desc") },
    { key: "not-urgent-not-important" as Priority, dotColor: "cyan", bgColor: "cyan", title: t("quadrant.n2.title"), subtitle: t("quadrant.n2.desc") },
  ], [t]);

  const getTasksForQuadrant = (priority: Priority) => tasks.filter((t) => t.priority === priority);

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, key: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverKey(key);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverKey(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetPriority: Priority) => {
      e.preventDefault();
      setDragOverKey(null);
      const taskId = e.dataTransfer.getData("text/plain");
      if (!taskId) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.priority === targetPriority) return;

      await updateTask(taskId, { priority: targetPriority });
    },
    [tasks, updateTask],
  );

  return (
    <section className="view-panel">
      <div className="quadrant-grid">
        {QUADRANT_CONFIGS.map((q) => {
          const quadrantTasks = getTasksForQuadrant(q.key);
          return (
            <div
              key={q.key}
              className="quadrant-card"
              onDragOver={(e) => handleDragOver(e, q.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, q.key)}
            >
              <div className="quadrant-header">
                <div className="quadrant-title-row">
                  <span className={`quadrant-dot ${q.dotColor}`} />
                  <div>
                    <h3 className="quadrant-title">{q.title}</h3>
                    <p className="quadrant-subtitle">{q.subtitle}</p>
                  </div>
                </div>
                <button className={`quadrant-add-btn ${q.bgColor}`}>+ Add</button>
              </div>
              <div className={`drop-zone ${dragOverKey === q.key ? "drag-over" : ""}`}>
                {quadrantTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
                ))}
                {quadrantTasks.length === 0 && (
                  <div className="empty-tip">
                    {q.key === "not-urgent-not-important"
                      ? t("quadrant.empty")
                      : t("quadrant.drop")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
