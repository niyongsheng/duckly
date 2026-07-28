import { useMemo, useState } from "react";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";
import TaskCard from "./TaskCard";

const PAGE_SIZE = 5;

export default function ListView() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);
  const {
    searchQuery,
    filterPriority,
    filterStatus,
    setSearchQuery,
    setFilterPriority,
    setFilterStatus,
  } = useUIStore();
  const [page, setPage] = useState(1);

  // Manual filter inputs
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (localSearch && !task.title.toLowerCase().includes(localSearch.toLowerCase()))
        return false;
      if (filterPriority && task.priority !== filterPriority) return false;
      if (filterStatus && task.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, localSearch, filterPriority, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTasks = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearch = () => {
    setSearchQuery(localSearch);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="view-panel">
      <div className="card">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "var(--space-6)",
            flexWrap: "wrap",
            gap: "var(--space-4)",
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700 }}>全部任务列表</h3>
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 0 }}>
              <input
                className="form-input"
                placeholder={t("task.search")}
                style={{ width: 200, fontSize: 14 }}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn btn-small"
                style={{ borderLeft: "none" }}
                onClick={handleSearch}
              >
                <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M16 16l4 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <select
              className="btn btn-small"
              value={filterPriority ?? ""}
              onChange={(e) => {
                setFilterPriority(e.target.value || null);
                setPage(1);
              }}
              style={{ textTransform: "none" }}
            >
              <option value="">{t("task.allPriorities")}</option>
              <option value="urgent-important">{t("priority.urgent-important")}</option>
              <option value="not-urgent-important">{t("priority.not-urgent-important")}</option>
              <option value="urgent-not-important">{t("priority.urgent-not-important")}</option>
              <option value="not-urgent-not-important">{t("priority.not-urgent-not-important")}</option>
            </select>
            <select
              className="btn btn-small"
              value={filterStatus ?? ""}
              onChange={(e) => {
                setFilterStatus(e.target.value || null);
                setPage(1);
              }}
              style={{ textTransform: "none" }}
            >
              <option value="">{t("task.allStatuses")}</option>
              <option value="todo">{t("status.todo")}</option>
              <option value="in-progress">{t("status.in-progress")}</option>
              <option value="done">{t("status.done")}</option>
            </select>
          </div>
        </div>

        {/* Task list */}
        {pagedTasks.length === 0 ? (
          <div className="empty-tip">
            {filtered.length === 0 ? t("task.emptyList") : t("task.filterNoResult")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {pagedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "var(--space-6)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--medium-gray)" }}>
            共 {t("task.totalItems").replace("{count}", String(filtered.length))}
          </span>
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                className="btn btn-small"
                disabled={safePage <= 1}
                style={{ opacity: safePage <= 1 ? 0.4 : 1 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`btn btn-small ${p === safePage ? "btn-primary" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="btn btn-small"
                disabled={safePage >= totalPages}
                style={{ opacity: safePage >= totalPages ? 0.4 : 1 }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
