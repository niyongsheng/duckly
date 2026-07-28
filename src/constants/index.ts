import type { Priority } from "../types/task";

export const QUADRANTS: Array<{
  key: Priority;
  labelKey: string;
  color: string;
  bgColor: string;
}> = [
  {
    key: "urgent-important",
    labelKey: "quadrant.u1",
    color: "#FF8A80",
    bgColor: "#FFF0EE",
  },
  {
    key: "not-urgent-important",
    labelKey: "quadrant.u2",
    color: "#FFE082",
    bgColor: "#FFF8E0",
  },
  {
    key: "urgent-not-important",
    labelKey: "quadrant.n1",
    color: "#8EC8E8",
    bgColor: "#E8F4FA",
  },
  {
    key: "not-urgent-not-important",
    labelKey: "quadrant.n2",
    color: "#A8D8D9",
    bgColor: "#E8F5F5",
  },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  "urgent-important": "Urgent & Important",
  "not-urgent-important": "Not Urgent & Important",
  "urgent-not-important": "Urgent & Not Important",
  "not-urgent-not-important": "Not Urgent & Not Important",
};

export const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "done", label: "Done" },
] as const;

export const REPEAT_OPTIONS = [
  { value: "none", label: "No Repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export const TAG_COLORS = [
  "#FF8A80",
  "#FFE082",
  "#8EC8E8",
  "#A8D8D9",
  "#FFDDB7",
  "#B39DDB",
  "#F48FB1",
  "#81C784",
];
