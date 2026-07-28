import { useState } from "react";
import { useI18n } from "../i18n/config";
import { useUIStore } from "../stores/useUIStore";
import NotificationPanel from "./NotificationPanel";
import DuckLogo from "./DuckLogo";

export default function Header() {
  const { t, locale, setLocale } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const {
    viewMode,
    setViewMode,
    openTaskForm,
    toggleSettings,
    toggleNotifications,
    closeNotifications,
    showNotifications,
  } = useUIStore();

  const views: Array<{ key: "calendar" | "quadrant" | "list" | "stats"; label: string }> = [
    { key: "calendar", label: t("header.calendar") },
    { key: "quadrant", label: t("header.quadrant") },
    { key: "list", label: t("header.list") },
    { key: "stats", label: t("header.stats") },
  ];

  return (
    <header className="app-header">
      <div className="header-row">
        {/* Left: Logo + Tabs */}
        <div className="header-left">
          <div className="logo-group">
            <DuckLogo className="logo-icon" />
            <h1 className="app-title">Duckly</h1>
          </div>

          {/* View tabs */}
          <div className="tab-bar" style={{ margin: 0 }}>
            {views.map((v) => (
              <button
                key={v.key}
                className={`tab-btn ${viewMode === v.key ? "active" : ""}`}
                onClick={() => setViewMode(v.key)}
              >
                {v.key === "calendar" && (
                  <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M8 3v4M16 3v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <rect x="7" y="13" width="2" height="2" rx="0.3" fill="currentColor" />
                    <rect x="11" y="13" width="2" height="2" rx="0.3" fill="currentColor" />
                    <rect x="15" y="13" width="2" height="2" rx="0.3" fill="currentColor" />
                  </svg>
                )}
                {v.key === "quadrant" && (
                  <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="8"
                      height="8"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="13"
                      y="3"
                      width="8"
                      height="8"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="3"
                      y="13"
                      width="8"
                      height="8"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <rect
                      x="13"
                      y="13"
                      width="8"
                      height="8"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
                {v.key === "list" && (
                  <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6h16M4 12h16M4 18h16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="4" cy="18" r="1.5" fill="currentColor" />
                  </svg>
                )}
                {v.key === "stats" && (
                  <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" opacity="0.7" />
                    <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor" opacity="0.7" />
                    <rect x="16" y="4" width="4" height="16" rx="1" fill="currentColor" opacity="0.7" />
                  </svg>
                )}
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="header-right">
          {/* Add task button */}
          <button className="btn btn-primary btn-small" onClick={() => openTaskForm()}>
            <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16M4 12h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("header.newTask")}
          </button>

          {/* Notification bell */}
          <div style={{ position: "relative" }}>
            <button
              className="notif-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleNotifications();
              }}
            >
              <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="notif-badge">3</span>
            </button>
            {showNotifications && (
              <>
                <div
                  className="notif-backdrop"
                  onClick={closeNotifications}
                />
                <NotificationPanel />
              </>
            )}
          </div>

          {/* Language switcher */}
          <div style={{ position: "relative" }}>
            <button
              className="dropdown-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setShowLangMenu((v) => !v);
              }}
            >
              <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M4 12h16" stroke="currentColor" strokeWidth="2" />
              </svg>
              {locale === "zh" ? "中文" : "EN"}
              <svg
                className="icon"
                viewBox="0 0 24 24"
                fill="none"
                style={{ width: 12, height: 12 }}
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {showLangMenu && (
              <>
                <div
                  className="notif-backdrop"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="dropdown-menu" style={{ display: "block" }}>
                  <button
                    className={`dropdown-item ${locale === "zh" ? "active" : ""}`}
                    onClick={() => { setLocale("zh"); setShowLangMenu(false); }}
                  >
                    简体中文
                  </button>
                  <button
                    className={`dropdown-item ${locale === "en" ? "active" : ""}`}
                    onClick={() => { setLocale("en"); setShowLangMenu(false); }}
                  >
                    English
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Settings button */}
          <button className="settings-btn" onClick={toggleSettings} title={t("header.settings")}>
            <svg className="icon icon-20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
