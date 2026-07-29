import { useEffect } from "react";
import { initAIChannel } from "../ai/channel";
import { useI18n } from "../i18n/config";
import BarChart from "../components/BarChart";
import BatchOperations from "../components/BatchOperations";
import CalendarView from "../components/CalendarView";
import DonutChart from "../components/DonutChart";
import Header from "../components/Header";
import ListView from "../components/ListView";
import NetworkStatus from "../components/NetworkStatus";
import QuadrantView from "../components/QuadrantView";
import SettingsDrawer from "../components/SettingsDrawer";
import StatsBar from "../components/StatsBar";
import StatsModal from "../components/StatsModal";
import TagManagement from "../components/TagManagement";
import TaskForm from "../components/TaskForm";
import ToastContainer from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { useReminder } from "../hooks/useReminder";
import { useTagStore } from "../stores/useTagStore";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";

export default function App() {
  const { t } = useI18n();
  useReminder();
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const viewMode = useUIStore((s) => s.viewMode);
  const { toasts, removeToast } = useToast();

  const loadTags = useTagStore((s) => s.loadTags);

  useEffect(() => {
    loadTasks();
    loadTags();
    initAIChannel();

  }, [loadTasks, loadTags]);

  return (
    <div>
      {/* Overlay components */}
      <SettingsDrawer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <NetworkStatus />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="page-wrap">
        {/* Views */}
        {viewMode === "stats" && (
          <section className="view-panel stats-view">
            <StatsBar />
            <div className="stats-charts">
              {/* Quadrant distribution bar chart */}
              <div className="stats-chart-card">
                <div className="stats-chart-title">
                  <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="12" width="4" height="8" rx="1" fill="currentColor" opacity=".7"/>
                    <rect x="10" y="8" width="4" height="12" rx="1" fill="currentColor" opacity=".7"/>
                    <rect x="16" y="4" width="4" height="16" rx="1" fill="currentColor" opacity=".7"/>
                  </svg>
                  {t("stats.distribution")}
                </div>
                <BarChart />
              </div>
              {/* Donut chart */}
              <div className="stats-chart-card">
                <div className="stats-chart-title">
                  <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 3v9l6.364 6.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 12h7" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {t("stats.completion")}
                </div>
                <DonutChart />
              </div>
            </div>
          </section>
        )}
        {viewMode === "quadrant" && <QuadrantView />}
        {viewMode === "calendar" && <CalendarView />}
        {viewMode === "list" && <ListView />}

        {/* Footer Section — hidden in stats view */}
        {viewMode !== "stats" && (
          <>
            <div className="divider" />
            <section className="grid-2">
              <TagManagement />
              <BatchOperations />
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      <TaskForm />
      <StatsModal />
    </div>
  );
}
