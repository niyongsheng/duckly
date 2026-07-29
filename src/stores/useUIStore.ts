import { create } from "zustand";

type ViewMode = "calendar" | "quadrant" | "list" | "stats";
type DuckMood = "happy" | "neutral" | "sad";
type AIPermission = "off" | "readonly" | "readwrite";
type CalendarMode = "month" | "week" | "day" | "year";

interface UIState {
  viewMode: ViewMode;
  duckMood: DuckMood;
  showTaskForm: boolean;
  editingTaskId: string | null;
  showSettings: boolean;
  showNotifications: boolean;
  showStatsModal: boolean;
  darkMode: boolean;
  calendarMode: CalendarMode;
  aiChannelOpen: boolean;
  aiPermission: AIPermission;
  searchQuery: string;
  filterPriority: string | null;
  filterStatus: string | null;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setDuckMood: (mood: DuckMood) => void;
  openTaskForm: (editingId?: string) => void;
  closeTaskForm: () => void;
  toggleSettings: () => void;
  closeSettings: () => void;
  toggleNotifications: () => void;
  closeNotifications: () => void;
  setShowStatsModal: (show: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setCalendarMode: (mode: CalendarMode) => void;
  setAIChannel: (open: boolean, permission?: AIPermission) => void;
  setSearchQuery: (query: string) => void;
  setFilterPriority: (priority: string | null) => void;
  setFilterStatus: (status: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: "calendar",
  duckMood: "neutral",
  showTaskForm: false,
  editingTaskId: null,
  showSettings: false,
  showNotifications: false,
  showStatsModal: false,
  darkMode: false,
  calendarMode: "month",
  aiChannelOpen: false,
  aiPermission: "readonly",
  searchQuery: "",
  filterPriority: null,
  filterStatus: null,

  setViewMode: (mode) => set({ viewMode: mode }),

  setDuckMood: (mood) => set({ duckMood: mood }),

  openTaskForm: (editingId) => set({ showTaskForm: true, editingTaskId: editingId ?? null }),

  closeTaskForm: () => set({ showTaskForm: false, editingTaskId: null }),

  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),

  closeSettings: () => set({ showSettings: false }),

  toggleNotifications: () => set((state) => ({ showNotifications: !state.showNotifications })),

  closeNotifications: () => set({ showNotifications: false }),

  setShowStatsModal: (show) => set({ showStatsModal: show }),

  setDarkMode: (dark) => set({ darkMode: dark }),

  setCalendarMode: (mode) => set({ calendarMode: mode }),

  setAIChannel: (open, permission) =>
    set({
      aiChannelOpen: open,
      aiPermission: permission ?? (open ? "readonly" : "off"),
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterStatus: (status) => set({ filterStatus: status }),
}));
