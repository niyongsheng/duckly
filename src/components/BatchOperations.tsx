import { useState } from "react";
import { useI18n } from "../i18n/config";
import { usePWA } from "../hooks/usePWA";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";
import Modal from "./Modal";

type ConfirmAction = "clearDone" | "deleteAll" | null;

export default function BatchOperations() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const { setShowStatsModal } = useUIStore();
  const { canInstall, installApp } = usePWA();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const handleConfirm = () => {
    if (confirmAction === "clearDone") {
      const doneTasks = tasks.filter((t) => t.status === "done");
      doneTasks.forEach((t) => deleteTask(t.id));
    } else if (confirmAction === "deleteAll") {
      tasks.forEach((t) => deleteTask(t.id));
    }
    setConfirmAction(null);
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <>
      <div className="card">
        <h3
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: "var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <svg className="icon icon-20" viewBox="0 0 24 24" fill="none">
            <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t("batch.title")}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <button
            className="btn btn-small"
            onClick={() => doneCount > 0 && setConfirmAction("clearDone")}
            style={{ opacity: doneCount === 0 ? 0.4 : 1 }}
            disabled={doneCount === 0}
          >
            <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 11l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("batch.clearDone")}
          </button>
          <button
            className="btn btn-small btn-danger"
            onClick={() => tasks.length > 0 && setConfirmAction("deleteAll")}
            style={{ opacity: tasks.length === 0 ? 0.4 : 1 }}
            disabled={tasks.length === 0}
          >
            <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 7h14M10 7V4h4v3M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("batch.deleteAll")}
          </button>
          <button className="btn btn-small btn-warning" onClick={() => setShowStatsModal(true)}>
            <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("batch.stats")}
          </button>
          {canInstall && (
            <button className="btn btn-small" onClick={installApp}>
              <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path
                  d="M8 10l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t("batch.install")}
            </button>
          )}
        </div>
        <p
          style={{
            marginTop: "var(--space-4)",
            fontSize: 12,
            color: "var(--medium-gray)",
          }}
        >
          {t("batch.dataLocal")}
        </p>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={t("task.confirm")}
      >
        <div style={{ padding: "var(--space-4) 0" }}>
          <p style={{ fontSize: 16, marginBottom: "var(--space-6)", lineHeight: 1.6 }}>
            {confirmAction === "clearDone"
              ? t("task.confirmClearDone").replace("{count}", String(doneCount))
              : confirmAction === "deleteAll"
                ? t("task.confirmDeleteAll").replace("{count}", String(tasks.length))
                : ""}
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <button className="btn btn-small" onClick={() => setConfirmAction(null)}>
              {t("task.cancel")}
            </button>
            <button className="btn btn-small btn-danger" onClick={handleConfirm}>
              {confirmAction === "deleteAll" ? t("batch.deleteAll") : t("batch.clearDone")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
