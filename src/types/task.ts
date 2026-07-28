export type Priority =
  | "urgent-important"
  | "not-urgent-important"
  | "urgent-not-important"
  | "not-urgent-not-important";

export type TaskStatus = "todo" | "in-progress" | "done";

export type RepeatType = "none" | "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  tags: string[];
  dueDate?: string; // ISO8601
  repeat: RepeatType;
  createdAt: string; // ISO8601
  updatedAt: string; // ISO8601
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  repeat: RepeatType;
}
