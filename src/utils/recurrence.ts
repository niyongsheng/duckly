import { addDays, addWeeks, addMonths, parseISO } from "date-fns";
import type { RepeatType, Task, TaskCreate } from "../db/schema";

/**
 * Shift an ISO date string forward by one repeat interval.
 * Returns undefined when isoString is undefined.
 */
function shiftDate(isoString: string | undefined, repeat: RepeatType): string | undefined {
  if (!isoString) return undefined;
  const date = parseISO(isoString);
  switch (repeat) {
    case "daily":
      return addDays(date, 1).toISOString();
    case "weekly":
      return addWeeks(date, 1).toISOString();
    case "monthly":
      return addMonths(date, 1).toISOString();
    default:
      return isoString;
  }
}

/**
 * Compute a TaskCreate for the next occurrence of a recurring task.
 * Returns null when no anchor date (dueDate / startDate) exists.
 */
export function computeNextOccurrence(task: Task): TaskCreate | null {
  const anchor = task.dueDate ?? task.startDate;
  if (!anchor) {
    console.warn(
      `[recurrence] Task "${task.title}" has repeat "${task.repeat}" but no date anchor; skipping.`,
    );
    return null;
  }

  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    tags: [...task.tags],
    startDate: shiftDate(task.startDate, task.repeat),
    dueDate: shiftDate(task.dueDate, task.repeat),
    repeat: task.repeat,
  };
}
