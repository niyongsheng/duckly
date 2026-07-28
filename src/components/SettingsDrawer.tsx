import { useEffect } from "react";
import { useI18n } from "../i18n/config";
import { usePWA } from "../hooks/usePWA";
import { useUIStore } from "../stores/useUIStore";

export default function SettingsDrawer() {
  const { t } = useI18n();
  const { showSettings, closeSettings, darkMode, setDarkMode } = useUIStore();
  const { canInstall, installApp } = usePWA();

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
            设置
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
            <div className="drawer-section-title">外观</div>
            <div className="drawer-toggle-group">
              <span className="drawer-toggle-label">深色模式</span>
              <div
                className={`drawer-toggle ${darkMode ? "on" : ""}`}
                onClick={() => setDarkMode(!darkMode)}
              />
            </div>
            <div className="drawer-toggle-group">
              <span className="drawer-toggle-label">紧凑布局</span>
              <div
                className="drawer-toggle"
                onClick={(e) => e.currentTarget.classList.toggle("on")}
              />
            </div>
          </div>

          {/* Integration */}
          <div className="drawer-section">
            <div className="drawer-section-title">集成</div>

            {/* Excel */}
            <div className="drawer-item" style={{ cursor: "default", flexWrap: "wrap" }}>
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
                <div className="drawer-item-label">Excel 导入/导出</div>
                <div className="drawer-item-desc">导入任务、导出备份、下载模板</div>
              </div>
              <div
                style={{ display: "flex", gap: 6, width: "100%", marginTop: 8, paddingLeft: 44 }}
              >
                <span
                  className="tag tag-pill"
                  style={{
                    background: "var(--blue)",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  导入
                </span>
                <span
                  className="tag tag-pill"
                  style={{
                    background: "var(--cyan)",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  导出
                </span>
                <span
                  className="tag tag-pill"
                  style={{
                    background: "var(--bg-card)",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  模板
                </span>
              </div>
            </div>

            {/* AI */}
            <div className="drawer-item" style={{ cursor: "default", flexWrap: "wrap" }}>
              <div className="drawer-item-icon">
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 8v8M12 8v8M15 8v8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">AI 接口</div>
                <div className="drawer-item-desc">读写模式 · 只读模式 · 关闭</div>
              </div>
              <div
                style={{ display: "flex", gap: 6, width: "100%", marginTop: 8, paddingLeft: 44 }}
              >
                <span
                  className="tag tag-pill"
                  style={{
                    background: "var(--blue)",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  读写
                </span>
                <span
                  className="tag tag-pill"
                  style={{
                    background: "var(--bg-card)",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  只读
                </span>
                <span
                  className="tag tag-pill"
                  style={{
                    background: "var(--coral)",
                    color: "var(--white)",
                    borderColor: "var(--coral)",
                    cursor: "pointer",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  关闭
                </span>
              </div>
            </div>

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
                <div className="drawer-item-label">Webhook 到期通知</div>
                <div className="drawer-item-desc">任务截止时自动推送通知到外部服务</div>
              </div>
              <div style={{ width: "100%", marginTop: 8, paddingLeft: 44 }}>
                <input
                  className="form-input"
                  placeholder="https://hooks.example.com/notify"
                  defaultValue="https://hooks.example.com/duckly-hook"
                  style={{
                    fontSize: 13,
                    padding: "var(--space-2) var(--space-3)",
                    marginBottom: "var(--space-2)",
                  }}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 4,
                    marginBottom: "var(--space-2)",
                  }}
                >
                  {[
                    { key: "webhook.eventDue", color: "var(--coral)", active: true },
                    { key: "webhook.eventDone", color: "var(--blue)", active: true },
                    { key: "webhook.eventCreate", color: "var(--yellow)", active: false },
                    { key: "webhook.eventChange", color: "var(--cyan)", active: true },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="tag tag-pill"
                      style={{
                        fontSize: 11,
                        cursor: "pointer",
                        background: item.active ? item.color : "transparent",
                        borderColor: item.active ? "var(--dark-gray)" : "var(--light-gray)",
                        textAlign: "center",
                      }}
                    >
                      {t(item.key)}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-small btn-primary" style={{ flex: 1, fontSize: 11 }}>
                    保存
                  </button>
                  <button className="btn btn-small" style={{ flex: 1, fontSize: 11 }}>
                    测试
                  </button>
                  <button className="btn btn-small btn-danger" style={{ flex: 1, fontSize: 11 }}>
                    删除
                  </button>
                </div>
              </div>
            </div>

            {/* Logs */}
            <div className="drawer-item">
              <div className="drawer-item-icon">
                <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12h6M12 9v6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="drawer-item-content">
                <div className="drawer-item-label">查看调用日志</div>
                <div className="drawer-item-desc">AI 接口的请求与响应记录</div>
              </div>
              <div className="drawer-item-right">→</div>
            </div>

            {/* API Docs */}
            <div className="drawer-item">
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
                <div className="drawer-item-label">接口协议文档</div>
                <div className="drawer-item-desc">查看 API 文档和接入说明</div>
              </div>
              <div className="drawer-item-right">→</div>
            </div>
          </div>

          {/* Data Management */}
          <div className="drawer-section">
            <div className="drawer-section-title">数据管理</div>
            <div className="drawer-item">
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
                <div className="drawer-item-label">导入数据</div>
                <div className="drawer-item-desc">从 CSV / Excel 导入任务</div>
              </div>
              <div className="drawer-item-right">→</div>
            </div>
            <div className="drawer-item">
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
                <div className="drawer-item-label">导出全部</div>
                <div className="drawer-item-desc">备份所有任务数据到本地</div>
              </div>
              <div className="drawer-item-right">→</div>
            </div>
            <div className="drawer-item">
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
                <div className="drawer-item-label">清除所有数据</div>
                <div className="drawer-item-desc">删除全部任务和标签（不可撤销）</div>
              </div>
              <div className="drawer-item-right" style={{ color: "var(--coral)" }}>
                ⚠
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="drawer-section">
            <div className="drawer-section-title">通知</div>
            {[
              { label: t("settings.notifTaskReminder"), on: true },
              { label: t("settings.notifDeadlinePush"), on: true },
              { label: t("settings.notifSound"), on: false },
              { label: t("settings.notifWebhook"), on: true },
              { label: t("settings.notifPreRemind"), on: true },
            ].map((item) => (
              <div key={item.label} className="drawer-toggle-group">
                <span className="drawer-toggle-label">{item.label}</span>
                <div
                  className={`drawer-toggle ${item.on ? "on" : ""}`}
                  onClick={(e) => e.currentTarget.classList.toggle("on")}
                />
              </div>
            ))}
          </div>

          {/* About */}
          <div className="drawer-section">
            <div className="drawer-section-title">关于</div>
            <div className="drawer-item">
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
                <div className="drawer-item-label">使用帮助</div>
                <div className="drawer-item-desc">查看文档和快捷键</div>
              </div>
              <div className="drawer-item-right">→</div>
            </div>
            <div className="drawer-item">
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
                <div className="drawer-item-label">检查更新</div>
                <div className="drawer-item-desc">v1.0.0 — 已是最新版本</div>
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
                  <div className="drawer-item-label">安装 App</div>
                  <div className="drawer-item-desc">安装到设备桌面</div>
                </div>
                <div className="drawer-item-right">↓</div>
              </div>
            )}
          </div>
        </div>

        <div className="drawer-footer">Duckly v1.0.0 · 所有数据本地 OPFS 存储 · 离线可用</div>
      </div>
    </>
  );
}
