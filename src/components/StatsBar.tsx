import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";

export default function StatsBar() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pending = total - done;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section className="stats-summary-grid">
      <div className="stat-card">
        <div className="stat-value dark">{total}</div>
        <div className="stat-label">{t("task.total")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value cyan">{done}</div>
        <div className="stat-label">{t("task.completed")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value yellow">{pending}</div>
        <div className="stat-label">{t("task.pending")}</div>
      </div>
      <div className="stat-card">
        <div className="stat-value blue">{completionRate}%</div>
        <div className="stat-label">{t("task.rate")}</div>
      </div>
    </section>
  );
}
