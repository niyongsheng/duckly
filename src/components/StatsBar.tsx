import { useTaskStore } from "../stores/useTaskStore";

export default function StatsBar() {
  // Use state that updates reactively
  const tasks = useTaskStore((s) => s.tasks);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pending = total - done;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section className="stats-summary-grid">
      <div className="stat-card">
        <div className="stat-value dark">{total}</div>
        <div className="stat-label">全部任务</div>
      </div>
      <div className="stat-card">
        <div className="stat-value cyan">{done}</div>
        <div className="stat-label">已完成</div>
      </div>
      <div className="stat-card">
        <div className="stat-value yellow">{pending}</div>
        <div className="stat-label">待处理</div>
      </div>
      <div className="stat-card">
        <div className="stat-value blue">{completionRate}%</div>
        <div className="stat-label">完成率</div>
      </div>
    </section>
  );
}
