import { useEffect, useRef, useState } from "react";
import { useConfirm } from "../hooks/useConfirm";
import { useExcel } from "../hooks/useExcel";
import { usePWA } from "../hooks/usePWA";
import { useToast } from "../hooks/useToast";
import { useI18n } from "../i18n/config";
import type { NotifToggle, WebhookEvent } from "../stores/useNotificationStore";
import { useNotificationStore } from "../stores/useNotificationStore";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";
import { isValidUrl } from "../utils/validation";

export default function SettingsDrawer() {
  const { t } = useI18n();
  const { showSettings, closeSettings, darkMode, setDarkMode } = useUIStore();
  const { showToast } = useToast();
  const { exportTasks, importTasks, download: downloadTemplate } = useExcel();
  const deleteAllTasks = useTaskStore((s) => s.deleteAllTasks);
  const {
    settings,
    setWebhookUrl,
    toggleWebhookEvent,
    setToggle,
    testWebhook,
    deleteWebhook,
    clearAll: clearAllNotifications,
    webhookLogs,
    clearWebhookLogs,
  } = useNotificationStore();
  const [testing, setTesting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const { canInstall, installApp } = usePWA();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [confirm, ConfirmDialog] = useConfirm();

  // Sync dark mode with document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("duckly-dark-mode", darkMode ? "1" : "0");
  }, [darkMode]);

  // Restore dark mode preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("duckly-dark-mode");
    if (saved === "1") {
      setDarkMode(true);
    }
  }, [setDarkMode]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    if (showSettings) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [showSettings, closeSettings]);

  return (
    <>
      <ConfirmDialog />
      {/* Overlay */}
      <div className={`drawer-overlay ${showSettings ? "open" : ""}`} onClick={closeSettings} />

      {/* Drawer */}
      <div className={`drawer ${showSettings ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-header-title">
            <svg className="icon icon-24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            {t("settings.title")}
          </div>
          <button className="drawer-close" onClick={closeSettings}>
            <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6l-12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* Appearance */}
          <div className="drawer-section">
            <div className="drawer-section-title">{t("settings.appearance")}</div>
            <div className="drawer-toggle-group">
              <span className="drawer-toggle-label">{t("settings.darkMode")}</span>
              <div
                className={`drawer-toggle ${darkMode ? "on" : ""}`}
                onClick={() => setDarkMode(!darkMode)}
              />
            </div>
          </div>

          {/* Integration */}
          <div className="drawer-section">
            <div className="drawer-section-title">{t("settings.integration")}</div>

            {/* Webhook */}
            <div className="drawer-item" style={{ cursor: "default", flexWrap: "wrap" }}>
              <div className="drawer-item-icon">
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">{t("settings.webhook")}</div>
                <div className="drawer-item-desc">{t("settings.webhookDesc")}</div>
              </div>
              <div style={{ width: "100%", marginTop: 8, paddingLeft: 44 }}>
                <input
                  className="form-input"
                  name="webhookUrl"
                  placeholder="https://hooks.example.com/notify"
                  value={settings.webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{
                    fontSize: 13,
                    padding: "var(--space-2) var(--space-3)",
                    marginBottom: "var(--space-2)",
                  }}
                />
                <div className="webhook-event-grid">
                  {(["due", "done", "create", "change", "delete"] as WebhookEvent[]).map(
                    (event) => (
                      <div
                        key={event}
                        className={`webhook-event-item ${settings.webhookEvents[event] ? "active" : ""}`}
                        onClick={() => toggleWebhookEvent(event)}
                      >
                        <input
                          type="checkbox"
                          name={"webhook-" + event}
                          checked={settings.webhookEvents[event]}
                          readOnly
                        />
                        {t("webhook.event" + event.charAt(0).toUpperCase() + event.slice(1))}
                      </div>
                    ),
                  )}
                </div>
                <div className="webhook-actions">
                  <button
                    className="btn btn-small btn-primary"
                    onClick={async () => {
                      if (!settings.webhookUrl) {
                        showToast("Please enter a webhook URL", "error");
                        return;
                      }
                      if (!isValidUrl(settings.webhookUrl)) {
                        showToast(
                          "Invalid URL format (must start with http:// or https://)",
                          "error",
                        );
                        return;
                      }
                      setTesting(true);
                      const ok = await testWebhook();
                      setTesting(false);
                      showToast(
                        ok
                          ? `${t("settings.webhookTested")} (HTTP 200)`
                          : "Webhook test failed — check the URL or try again",
                        ok ? "success" : "error",
                      );
                    }}
                  >
                    {testing ? "Sending…" : t("settings.webhookSaveTest")}
                  </button>
                  <button
                    className="btn btn-small"
                    onClick={async () => {
                      if (!settings.webhookUrl) {
                        showToast("Please enter a webhook URL first", "warning");
                        return;
                      }
                      if (!isValidUrl(settings.webhookUrl)) {
                        showToast("Invalid URL format", "error");
                        return;
                      }
                      const ok = await testWebhook();
                      showToast(
                        ok ? `${t("settings.webhookTested")} (HTTP 200)` : "Webhook test failed",
                        ok ? "success" : "error",
                      );
                    }}
                  >
                    {t("settings.webhookTest")}
                  </button>
                  <button
                    className="btn btn-small"
                    onClick={() => setShowLogs(!showLogs)}
                    disabled={webhookLogs.length === 0}
                  >
                    {t("settings.webhookLogs")}
                    {webhookLogs.length > 0 ? ` (${webhookLogs.length})` : ""}
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => {
                      deleteWebhook();
                      showToast(t("settings.webhookDeleted"), "warning");
                    }}
                  >
                    {t("settings.webhookDelete")}
                  </button>
                </div>
                {showLogs && (
                  <div style={{ marginTop: 8, paddingLeft: 44 }}>
                    <div className="drawer-section-title" style={{ fontSize: 12, marginBottom: 6 }}>
                      {t("settings.webhookLogs")}
                    </div>
                    {webhookLogs.length === 0 ? (
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {t("settings.webhookLogsEmpty")}
                      </div>
                    ) : (
                      <>
                        <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 6 }}>
                          {webhookLogs.map((log) => (
                            <div
                              key={log.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 11,
                                padding: "3px 0",
                                borderBottom: "1px solid var(--border-light)",
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: log.success ? "var(--green)" : "var(--coral)",
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}
                              >
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                              <span style={{ fontWeight: 500 }}>{log.event}</span>
                              <span
                                style={{
                                  color: "var(--text-secondary)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flex: 1,
                                }}
                              >
                                {log.taskTitle}
                              </span>
                              <span
                                style={{
                                  color: log.success ? "var(--green)" : "var(--coral)",
                                  flexShrink: 0,
                                }}
                              >
                                {log.success ? "✓" : "✗"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          className="btn btn-small"
                          onClick={() => {
                            clearWebhookLogs();
                            showToast(t("settings.webhookLogsCleared"), "success");
                          }}
                          style={{ fontSize: 11 }}
                        >
                          {t("settings.webhookLogsClear")}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="drawer-section">
            <div className="drawer-section-title">{t("settings.data")}</div>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const count = await importTasks(file);
                  showToast(`成功导入 ${count} 个任务`, "success");
                } catch (err) {
                  showToast(`导入失败: ${(err as Error).message}`, "error");
                }
                e.target.value = "";
              }}
            />
            <div
              className="drawer-item"
              onClick={() => {
                importInputRef.current?.click();
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="drawer-item-icon">
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 4h10l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 4v4h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 12h8M8 16h5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">{t("excel.importTitle")}</div>
                <div className="drawer-item-desc">{t("excel.descImport")}</div>
              </div>
              <div className="drawer-item-right">
                <span
                  className="tag tag-pill"
                  style={{ fontSize: 11, padding: "1px 6px", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadTemplate();
                  }}
                >
                  {t("excel.template")}
                </span>
              </div>
            </div>
            <div className="drawer-item" onClick={exportTasks} style={{ cursor: "pointer" }}>
              <div className="drawer-item-icon">
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 4h10l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 4v4h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 10v6M9 13h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">{t("excel.export")}</div>
                <div className="drawer-item-desc">{t("excel.descExport")}</div>
              </div>
              <div className="drawer-item-right">→</div>
            </div>
            <div
              className="drawer-item"
              onClick={async () => {
                const count = useTaskStore.getState().tasks.length;
                const ok = await confirm({
                  message: t("task.confirmDeleteAll").replace("{count}", String(count)),
                  variant: "danger",
                });
                if (ok) {
                  deleteAllTasks();
                  clearAllNotifications();
                  showToast("All data cleared", "warning");
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <div className="drawer-item-icon" style={{ borderColor: "var(--coral)" }}>
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 7h14M10 7V4h4v3M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">{t("settings.clearAll")}</div>
                <div className="drawer-item-desc">{t("settings.clearDesc")}</div>
              </div>
              <div className="drawer-item-right" style={{ color: "var(--coral)" }}>
                ⚠
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="drawer-section">
            <div className="drawer-section-title">{t("settings.notifications")}</div>
            {(
              [
                { key: "taskReminder", label: t("settings.notifTaskReminder") },
                { key: "deadlinePush", label: t("settings.notifDeadlinePush") },
                { key: "sound", label: t("settings.notifSound") },
                { key: "webhookPush", label: t("settings.notifWebhook") },
                { key: "preRemind", label: t("settings.notifPreRemind") },
              ] as Array<{ key: NotifToggle; label: string }>
            ).map((item) => (
              <div key={item.key} className="drawer-toggle-group">
                <span className="drawer-toggle-label">{item.label}</span>
                <div
                  className={`drawer-toggle ${settings.toggles[item.key] ? "on" : ""}`}
                  onClick={() => setToggle(item.key, !settings.toggles[item.key])}
                />
              </div>
            ))}
          </div>

          {/* About */}
          <div className="drawer-section">
            <div className="drawer-section-title">{t("settings.about")}</div>
            <div
              className="drawer-item"
              onClick={() => window.open("https://github.com/niyongsheng/duckly", "_blank")}
              style={{ cursor: "pointer" }}
            >
              <div className="drawer-item-icon">
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 8v4M12 16h0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">{t("settings.help")}</div>
                <div className="drawer-item-desc">{t("settings.helpDesc")}</div>
              </div>
              <div className="drawer-item-right">→</div>
            </div>
            <div
              className="drawer-item"
              onClick={() => showToast(t("settings.updateDesc"), "success")}
              style={{ cursor: "pointer" }}
            >
              <div className="drawer-item-icon">
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 10h-1.26A8 8 0 1 0 9 20h0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 13l-4 4h3v4h2v-4h3l-4-4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">{t("settings.checkUpdate")}</div>
                <div className="drawer-item-desc">{t("settings.updateDesc")}</div>
              </div>
              <div className="drawer-item-right">✓</div>
            </div>
            {canInstall && (
              <div className="drawer-item" onClick={installApp}>
                <div className="drawer-item-icon">
                  <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="7 10 12 15 17 10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="12"
                      y1="15"
                      x2="12"
                      y2="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="drawer-item-content">
                  <div className="drawer-item-label">{t("header.install")}</div>
                  <div className="drawer-item-desc">{t("settings.installDesc")}</div>
                </div>
                <div className="drawer-item-right">↓</div>
              </div>
            )}
          </div>
        </div>

        <div className="drawer-footer">{t("settings.footer")}</div>
      </div>
    </>
  );
}
