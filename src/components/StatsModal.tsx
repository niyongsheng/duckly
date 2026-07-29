import { useState } from "react";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";
import Modal from "./Modal";

export default function StatsModal() {
  const { t } = useI18n();
  const { showStatsModal, setShowStatsModal } = useUIStore();
  const tasks = useTaskStore((s) => s.tasks);
  const [tab, setTab] = useState<"chart" | "list">("chart");

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const pending = total - done;
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Quadrant counts
  const quadrantCounts = {
    "urgent-important": tasks.filter((t) => t.priority === "urgent-important").length,
    "not-urgent-important": tasks.filter((t) => t.priority === "not-urgent-important").length,
    "urgent-not-important": tasks.filter((t) => t.priority === "urgent-not-important").length,
    "not-urgent-not-important": tasks.filter((t) => t.priority === "not-urgent-not-important")
      .length,
  };

  const maxCount = Math.max(...Object.values(quadrantCounts), 1);

  return (
    <Modal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} title={t("stats.title")}>
      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === "chart" ? "active" : ""}`}
          onClick={() => setTab("chart")}
        >
          <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="8" width="4" height="12" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="10" y="4" width="4" height="16" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="16" y="6" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
          </svg>
          {t("stats.chart")}
        </button>
        <button
          className={`tab-btn ${tab === "list" ? "active" : ""}`}
          onClick={() => setTab("list")}
        >
          <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t("stats.list")}
        </button>
      </div>

      {/* Stats cards */}
      <div className="stats-summary-grid" style={{ marginTop: "var(--space-4)" }}>
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
          <div className="stat-value blue">{rate}%</div>
          <div className="stat-label">{t("task.rate")}</div>
        </div>
      </div>

      {tab === "chart" ? (
        <div className="grid-2" style={{ marginTop: "var(--space-6)" }}>
          {/* Quadrant bar chart */}
          <div
            className="card"
            style={{
              minHeight: 280,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--medium-gray)",
                textAlign: "center",
                marginBottom: "var(--space-4)",
              }}
            >
              {t("stats.distribution")}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "var(--space-4)",
                height: 160,
                padding: "0 var(--space-4)",
              }}
            >
              {Object.entries(quadrantCounts).map(([key, count], i) => {
                const colors = ["var(--coral)", "var(--blue)", "var(--yellow)", "var(--cyan)"];
                const labels = t("stats.quadrantLabels").split(",");
                const height = (count / maxCount) * 140;
                return (
                  <div
                    key={key}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--dark-gray)" }}>
                      {count}
                    </span>
                    <div
                      style={{
                        width: "100%",
                        height: Math.max(height, 4),
                        background: colors[i],
                        border: "var(--border-default)",
                        transition: "height 0.3s",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--medium-gray)",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      {labels[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie chart placeholder */}
          <div
            className="card"
            style={{
              minHeight: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--medium-gray)",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <svg
              className="icon icon-32"
              viewBox="0 0 24 24"
              fill="none"
              style={{ width: 64, height: 64 }}
            >
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 3v9l6.364 6.364"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M5 12h7" stroke="currentColor" strokeWidth="2" />
            </svg>
            {t("stats.pieChart")}
          </div>
        </div>
      ) : (
        /* Detail list */
        <div style={{ marginTop: "var(--space-6)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "var(--border-default)" }}>
                <th
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    textAlign: "left",
                    fontWeight: 700,
                  }}
                >
                  {t("task.title")}
                </th>
                <th
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    textAlign: "left",
                    fontWeight: 700,
                  }}
                >
                  {t("task.priority")}
                </th>
                <th
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    textAlign: "left",
                    fontWeight: 700,
                  }}
                >
                  {t("task.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 20).map((task) => (
                <tr key={task.id} style={{ borderBottom: "1px solid var(--light-gray)" }}>
                  <td style={{ padding: "var(--space-2) var(--space-3)" }}>{task.title}</td>
                  <td style={{ padding: "var(--space-2) var(--space-3)" }}>
                    <span className="tag" style={{ fontSize: 10, padding: "1px 6px" }}>
                      {t("priority." + task.priority + "_short")}
                    </span>
                  </td>
                  <td style={{ padding: "var(--space-2) var(--space-3)" }}>
                    {task.status === "done" ? "✓" : task.status === "in-progress" ? "…" : "○"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
