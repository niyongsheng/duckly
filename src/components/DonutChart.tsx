import { useMemo } from "react";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";

export default function DonutChart() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "todo").length;
    const overdue = tasks.filter((t) => {
      if (t.status === "done" || !t.dueDate) return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, pending, overdue, rate };
  }, [tasks]);

  const items = [
    { label: t("stats.done"), count: stats.done, dotClass: "done" },
    { label: t("stats.inProgress"), count: stats.inProgress, dotClass: "progress" },
    { label: t("stats.pending"), count: stats.pending, dotClass: "pending" },
    { label: t("stats.overdue"), count: stats.overdue, dotClass: "overdue" },
  ];

  return (
    <div className="donut-container">
      <div className="donut">
        <div className="donut-hole">
          <span className="dv">{stats.rate}%</span>
          <span className="dl">{t("stats.completionRate")}</span>
        </div>
      </div>
      <div className="donut-legend">
        {items.map((item) => (
          <div key={item.label} className="donut-legend-item">
            <span className={`dl-dot ${item.dotClass}`} />
            <span className="dl-label">{item.label}</span>
            <span className="dl-count">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
