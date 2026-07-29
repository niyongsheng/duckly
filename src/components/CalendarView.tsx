import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Task } from "../db/schema";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";
import { useI18n } from "../i18n/config";

type CalendarMode = "month" | "week" | "day" | "year";

interface MultiDayEvent {
  id: string;
  text: string;
  color: "coral" | "blue" | "yellow" | "cyan";
  start: string; // "YYYY-M-D"
  end: string; // "YYYY-M-D"
  done: boolean;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${month + 1}-${day}`;
}

function getTasksForDateKey(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    const taskKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    return taskKey === dateKey;
  });
}

function getPriorityColor(task: Task): string {
  switch (task.priority) {
    case "urgent-important":
      return "coral";
    case "not-urgent-important":
      return "blue";
    case "urgent-not-important":
      return "yellow";
    case "not-urgent-not-important":
      return "cyan";
    default:
      return "coral";
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function priorityToEventColor(priority: string): MultiDayEvent["color"] {
  switch (priority) {
    case "urgent-important":
      return "coral";
    case "not-urgent-important":
      return "blue";
    case "urgent-not-important":
      return "yellow";
    case "not-urgent-not-important":
      return "cyan";
    default:
      return "coral";
  }
}

/** Check if a task is a multi-day event (startDate and dueDate on different calendar days) */
function isMultiDayEvent(task: Task): boolean {
  if (!task.startDate || !task.dueDate) return false;
  const start = new Date(task.startDate);
  const end = new Date(task.dueDate);
  // Compare date portions only (strip time)
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 1;
}

/** Get non-multi-day tasks for a given date key (used for calendar cell dots) */
function getSingleDayTasks(tasks: Task[], dateKey: string): Task[] {
  return tasks.filter((t) => {
    if (!t.dueDate || isMultiDayEvent(t)) return false;
    const d = new Date(t.dueDate);
    const taskKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    return taskKey === dateKey;
  });
}

/** Get all tasks relevant to a date key, including multi-day events that span it (used for sidebar) */
function getTasksForDateSpan(tasks: Task[], dateKey: string): Task[] {
  const [y, m, d] = dateKey.split("-").map(Number);
  const target = new Date(y, m - 1, d);

  return tasks.filter((t) => {
    if (!t.startDate && !t.dueDate) return false;

    if (isMultiDayEvent(t)) {
      // Multi-day event: check if target date is within start~end range (inclusive)
      const start = new Date(t.startDate as string);
      const end = new Date(t.dueDate as string);
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
      return targetDay >= startDay && targetDay <= endDay;
    }

    // Single-day task: match by dueDate
    if (!t.dueDate) return false;
    const dd = new Date(t.dueDate);
    const taskKey = `${dd.getFullYear()}-${dd.getMonth() + 1}-${dd.getDate()}`;
    return taskKey === dateKey;
  });
}

/** Derive multi-day events from tasks that have both startDate and dueDate on different days */
function deriveMultiDayEvents(tasks: Task[]): MultiDayEvent[] {
  return tasks
    .filter((t) => t.startDate && t.dueDate)
    .filter((t) => {
      const start = new Date(t.startDate as string);
      const end = new Date(t.dueDate as string);
      // Compare date portions only (strip time), so same-day tasks don't become multi-day
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const diffDays = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 1;
    })
    .map((t) => {
      const start = new Date(t.startDate as string);
      const end = new Date(t.dueDate as string);
      const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      return {
        id: t.id,
        text: t.title,
        color: priorityToEventColor(t.priority),
        start: dateKey(start),
        end: dateKey(end),
        done: t.status === "done",
      };
    });
}

export default function CalendarView() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);
  const openTaskForm = useUIStore((s) => s.openTaskForm);
  const [mode, setMode] = useState<CalendarMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 28)); // July 28, 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const multiDayEvents = useMemo(() => deriveMultiDayEvents(tasks), [tasks]);
  const today = useMemo(() => new Date(2026, 6, 28), []);
  const weekdaysShort = useMemo(() => [
    t("calendar.weekday.sun"), t("calendar.weekday.mon"), t("calendar.weekday.tue"),
    t("calendar.weekday.wed"), t("calendar.weekday.thu"), t("calendar.weekday.fri"),
    t("calendar.weekday.sat"),
  ], [t]);
  const weekdaysFull = useMemo(() => t("calendar.weekdayFull").split(","), [t]);
  const monthsCn = useMemo(() => t("calendar.monthNames").split(","), [t]);

  const navigate = useCallback(
    (delta: number) => {
      const d = new Date(currentDate);
      if (mode === "month") {
        d.setMonth(d.getMonth() + delta);
      } else if (mode === "week") {
        d.setDate(d.getDate() + delta * 7);
      } else if (mode === "day") {
        d.setDate(d.getDate() + delta);
      } else if (mode === "year") {
        d.setFullYear(d.getFullYear() + delta);
      }
      setCurrentDate(d);
    },
    [mode, currentDate],
  );

  const goToToday = useCallback(() => {
    setCurrentDate(new Date(today));
    setSelectedDate(new Date(today));
  }, [today]);

  const monthStart = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate],
  );
  const monthEnd = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    [currentDate],
  );
  const calStart = useMemo(() => {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [monthStart]);
  const calEnd = useMemo(() => {
    const d = new Date(monthEnd);
    d.setDate(d.getDate() + (6 - d.getDay()));
    return d;
  }, [monthEnd]);

  const monthDays = useMemo(() => {
    const days: Date[] = [];
    const day = new Date(calStart);
    while (day <= calEnd) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  }, [calStart, calEnd]);

  const selectedDateStr = selectedDate
    ? `${selectedDate.getFullYear()}${t("date.year")}${selectedDate.getMonth() + 1}${t("date.month")}${selectedDate.getDate()}${t("date.day")} ${weekdaysFull[selectedDate.getDay()]}`
    : "";
  const selectedDateKey = selectedDate
    ? formatDateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    : "";
  const selectedTasks = selectedDate ? getTasksForDateSpan(tasks, selectedDateKey) : [];

  // ── Multi-day overlay effect (month view) ──
  useEffect(() => {
    if (mode !== "month" || !gridRef.current) return;
    const grid = gridRef.current;
    // Remove old overlays and reset task container margins
    grid.querySelectorAll(".cal-multi-overlay").forEach((el) => el.remove());
    grid.querySelectorAll(".calendar-cell").forEach((c) => {
      const tc = c.querySelector(".calendar-cell-tasks");
      if (tc) (tc as HTMLElement).style.marginTop = "";
    });

    const cells = Array.from(grid.querySelectorAll(".calendar-cell"));
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const DAY_NUM_HEIGHT = 38; // space reserved for day number (font + margin + 20px gap)

    const visibleEvents = multiDayEvents
      .filter((ev) => {
        const s = new Date(ev.start);
        const e = new Date(ev.end);
        e.setHours(23, 59, 59, 999);
        return !(e < firstDay || s > lastDay);
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const rowStack: Record<number, number> = {};
    const gridRect = grid.getBoundingClientRect();

    visibleEvents.forEach((ev) => {
      const evStart = new Date(ev.start);
      const evEnd = new Date(ev.end);
      evEnd.setHours(23, 59, 59, 999);
      const visibleStart = new Date(Math.max(evStart.getTime(), firstDay.getTime()));
      const visibleEnd = new Date(Math.min(evEnd.getTime(), lastDay.getTime()));
      visibleEnd.setHours(23, 59, 59, 999);

      // Find start and end cell indices within the visible month
      const findDayCell = (d: Date) =>
        cells.findIndex(
          (c) =>
            c.querySelector(".calendar-day-number") &&
            parseInt(c.querySelector(".calendar-day-number")!.textContent || "0") === d.getDate() &&
            !c.classList.contains("other-month"),
        );
      const startIdx = findDayCell(visibleStart);
      const endIdx = findDayCell(visibleEnd);
      if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) return;

      // Generate a bar per row the event spans
      const startRow = Math.floor(startIdx / 7);
      const endRow = Math.floor(endIdx / 7);
      const colsPerRow = 7;

      for (let row = startRow; row <= endRow; row++) {
        const rowFirst = row * colsPerRow;
        const rowLast = Math.min(rowFirst + colsPerRow - 1, cells.length - 1);
        // This row's bar starts at the event's start on the first row, else at the row's left edge
        const barStartIdx = row === startRow ? startIdx : rowFirst;
        // This row's bar ends at the event's end on the last row, else at the row's right edge
        const barEndIdx = row === endRow ? endIdx : rowLast;
        if (barStartIdx > barEndIdx) continue;

        // Stack tracking per row (cap at 3)
        if (!rowStack[row]) rowStack[row] = 0;
        if (rowStack[row] >= 3) continue;
        const stackOffset = rowStack[row] * 24;
        rowStack[row]++;

        const bs = cells[barStartIdx].getBoundingClientRect();
        const be = cells[barEndIdx].getBoundingClientRect();

        const bar = document.createElement("div");
        bar.className = `cal-multi-overlay ${ev.color}${ev.done ? " done" : ""}`;
        // Only show text on the first row's bar
        bar.textContent = row === startRow ? ev.text : "";
        bar.title = `${ev.text} (${ev.start} ~ ${ev.end})`;
        bar.style.left = `${bs.left - gridRect.left}px`;
        bar.style.width = `${be.right - bs.left}px`;
        bar.style.top = `${bs.top - gridRect.top + stackOffset + DAY_NUM_HEIGHT}px`;
        bar.style.position = "absolute";
        grid.appendChild(bar);
      }
    });

    // Push task containers below the overlay stack
    Object.entries(rowStack).forEach(([rowIdx, count]) => {
      const taskOffset = DAY_NUM_HEIGHT + Math.min(count, 3) * 24;
      const start = parseInt(rowIdx) * 7;
      const end = Math.min(start + 7, cells.length);
      for (let i = start; i < end; i++) {
        const tc = cells[i].querySelector(".calendar-cell-tasks");
        if (tc) (tc as HTMLElement).style.marginTop = `${taskOffset}px`;
      }
    });
  }, [mode, currentDate, tasks]);

  // ── Year view data ──
  const yearMonths = useMemo(() => {
    const months: Array<{
      m: number;
      days: Date[];
      firstDay: number;
      daysInMonth: number;
      daysInPrev: number;
    }> = [];
    for (let m = 0; m < 12; m++) {
      const first = new Date(currentDate.getFullYear(), m, 1);
      const daysInMonth = new Date(currentDate.getFullYear(), m + 1, 0).getDate();
      const daysInPrev = new Date(currentDate.getFullYear(), m, 0).getDate();
      const firstDay = first.getDay();
      const days: Date[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        days.push(new Date(currentDate.getFullYear(), m, d));
      }
      months.push({ m, days, firstDay, daysInMonth, daysInPrev });
    }
    return months;
  }, [currentDate]);

  // ── Week view ──
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  return (
    <section className="view-panel">
      <div className="calendar-section active">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="calendar-nav-btn" onClick={() => navigate(-1)}>
              <svg className="icon icon-20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="calendar-month-year">
              {mode === "year"
                ? `${currentDate.getFullYear()}${t("date.year")}`
                : `${currentDate.getFullYear()}${t("date.year")} ${monthsCn[currentDate.getMonth()]}`}
            </span>
            <button className="calendar-nav-btn" onClick={() => navigate(1)}>
              <svg className="icon icon-20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="calendar-today-btn" onClick={goToToday}>
              <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <rect x="10" y="6" width="4" height="12" rx="1" fill="currentColor" opacity="0.6" />
                <rect x="6" y="10" width="12" height="4" rx="1" fill="currentColor" opacity="0.6" />
              </svg>
              {t("calendar.today")}
            </button>
          </div>

          {/* Mode tabs */}
          <div className="tab-bar" style={{ margin: 0 }}>
            {(["month", "week", "day", "year"] as CalendarMode[]).map((m) => (
              <button
                key={m}
                className={`tab-btn ${mode === m ? "active" : ""}`}
                onClick={() => setMode(m)}
              >
                {m === "month" && (
                  <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
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
                  </svg>
                )}
                {m === "week" && (
                  <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
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
                    <path
                      d="M3 16h18"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </svg>
                )}
                {m === "day" && (
                  <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
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
                    <path
                      d="M12 10v6M8 13h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {m === "year" && (
                  <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 3v18M15 3v18" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
                {t("calendar." + m)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Month View ── */}
        {mode === "month" && (
          <div className="calendar-layout">
            <div>
              <div className="calendar-grid" ref={gridRef}>
                {weekdaysShort.map((d, i) => (
                  <div key={d} className={`calendar-weekday ${i === 0 || i >= 6 ? "weekend" : ""}`}>
                    {d}
                  </div>
                ))}
                {monthDays.map((d) => {
                  const dateKey = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
                  const dayTasks = getSingleDayTasks(tasks, dateKey);
                  const isOtherMonth = d.getMonth() !== currentDate.getMonth();
                  const isTodayDate = isSameDay(d, today);
                  const isSelectedDate = selectedDate && isSameDay(d, selectedDate);

                  return (
                    <div
                      key={dateKey}
                      className={`calendar-cell${isOtherMonth ? " other-month" : ""}${isTodayDate ? " today" : ""}${isSelectedDate ? " selected" : ""}${dayTasks.length > 0 ? " has-task" : ""}`}
                      onClick={() => setSelectedDate(new Date(d))}
                    >
                      <div className="calendar-day-number">{d.getDate()}</div>
                      {dayTasks.length > 0 && (
                        <div className="calendar-cell-tasks">
                          {dayTasks.slice(0, 3).map((t) => (
                            <div
                              key={t.id}
                              className={`cal-task ${t.status === "done" ? "cal-task-done" : ""}`}
                            >
                              <span
                                className={`cal-task-dot ${getPriorityColor(t)} ${t.status === "done" ? "done" : ""}`}
                              />
                              <span className="cal-task-text">{t.title}</span>
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="cal-more-link">+{dayTasks.length - 3} {t("calendar.more")}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <CalendarSidebar
              selectedDateStr={selectedDateStr}
              selectedTasks={selectedTasks}
              tasksCount={selectedTasks.length}
              onAddTask={() => openTaskForm()}
            />
          </div>
        )}

        {/* ── Week View ── */}
        {mode === "week" && (
          <div className="week-view active">
            {/* Multi-day events */}
            <div className="week-multi-events">
              {multiDayEvents
                .filter((ev) => {
                  const s = new Date(ev.start);
                  const e = new Date(ev.end);
                  e.setHours(23, 59, 59, 999);
                  const ws = new Date(weekStart);
                  const we = new Date(weekStart);
                  we.setDate(we.getDate() + 6);
                  we.setHours(23, 59, 59, 999);
                  return !(e < ws || s > we);
                })
                .map((ev) => (
                  <div
                    key={ev.id}
                    className={`week-multi-bar ${ev.color}${ev.done ? " done" : ""}`}
                  >
                    <svg className="dm-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 12h16" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    {ev.text}
                    <span className="wm-range">{ev.start} ~ {ev.end}</span>
                  </div>
                ))}
            </div>
            <div className="week-grid">
              <div className="week-time-cell" style={{ background: "var(--bg-page)" }} />
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  className={`week-day-header${d.getDay() === 0 || d.getDay() >= 6 ? " weekend" : ""}${isSameDay(d, today) ? " today" : ""}`}
                >
                  <div className="wd-name">{weekdaysShort[d.getDay()]}</div>
                  <div className="wd-date">{d.getDate()}</div>
                </div>
              ))}
              {Array.from({ length: 17 }, (_, h) => h + 6).map((h) => (
                <Fragment key={`row-${h}`}>
                  <div className="week-time-cell">
                    {h}:00
                  </div>
                  {weekDays.map((d, di) => {
                    const dateKey = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
                    const dayTasks = getSingleDayTasks(tasks, dateKey);
                    return (
                      <div
                        key={`c-${h}-${di}`}
                        className={`week-day-col${isSameDay(d, today) ? " today-col" : ""}`}
                      >
                        {h === 6 &&
                          dayTasks.map((t) => (
                            <div
                              key={t.id}
                              className={`week-task ${getPriorityColor(t)}${t.status === "done" ? " done" : ""}`}
                            >
                              <div className="week-task-text">{t.title}</div>
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ── Day View ── */}
        {mode === "day" && (
          <div className="day-view active">
            {/* Multi-day events */}
            <div className="day-multi-events">
              {multiDayEvents
                .filter((ev) => {
                  const s = new Date(ev.start);
                  const e = new Date(ev.end);
                  e.setHours(23, 59, 59, 999);
                  const day = currentDate;
                  return day >= s && day <= e;
                })
                .map((ev) => (
                  <div
                    key={ev.id}
                    className={`day-multi-bar ${ev.color}${ev.done ? " done" : ""}`}
                  >
                    <svg className="dm-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 12h16" stroke="currentColor" strokeWidth="2"/>
                      <path d="M8 10v4M16 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {ev.text}
                    <span className="dm-range">{ev.start} ~ {ev.end}</span>
                  </div>
                ))}
            </div>
            <div className="day-timeline">
              {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => (
                <Fragment key={`day-${h}`}>
                  <div className="day-hour-label">
                    {h}:00
                  </div>
                  <div
                    className={`day-hour-cell${h === today.getHours() ? " current" : ""}`}
                  >
                    {h === 6 &&
                      selectedTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`day-task-block ${getPriorityColor(task)}${task.status === "done" ? " done" : ""}`}
                        >
                          <span className="dt-time">{t("calendar.allDay")}</span>
                          <span className="dt-text">{task.title}</span>
                          <span
                            className="dt-tag"
                            style={{
                              background: `var(--${getPriorityColor(task) === "coral" ? "coral" : getPriorityColor(task) === "blue" ? "blue" : getPriorityColor(task) === "yellow" ? "yellow" : "cyan"})`,
                            }}
                          >
                            {{ coral: t("priority.urgent"), blue: t("priority.important"), yellow: t("priority.inProgress"), cyan: t("priority.daily") }[getPriorityColor(task)]}
                          </span>
                        </div>
                      ))}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ── Year View ── */}
        {mode === "year" && (
          <div className="year-view" style={{ display: "block" }}>
            <div className="year-grid">
              {yearMonths.map(({ m, days, firstDay, daysInPrev }) => {
                const taskCount = days.reduce((sum, d) => {
                  const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
                  return sum + getTasksForDateKey(tasks, key).length;
                }, 0);

                return (
                  <div
                    key={m}
                    className="year-month-card"
                    onClick={() => {
                      const d = new Date(currentDate.getFullYear(), m, 1);
                      setCurrentDate(d);
                      setMode("month");
                    }}
                  >
                    <div className="year-month-title">{monthsCn[m]}</div>
                    <div className="year-month-weekdays">
                      {weekdaysShort.map((wd, i) => (
                        <span key={wd} className={`year-month-weekday${i === 0 || i >= 6 ? " weekend" : ""}`}>
                          {wd}
                        </span>
                      ))}
                    </div>
                    <div className="year-month-days">
                      {Array.from({ length: firstDay }, (_, i) => (
                        <div key={`p-${i}`} className="year-month-day other-month">
                          {daysInPrev - firstDay + 1 + i}
                        </div>
                      ))}
                      {days.map((d) => {
                        const key = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
                        const dayTasks = getSingleDayTasks(tasks, key);
                        const isTodayDate = isSameDay(d, today);
                        const color = dayTasks.length > 0 ? getPriorityColor(dayTasks[0]) : "";
                        return (
                          <div
                            key={key}
                            className={`year-month-day${isTodayDate ? " today" : ""}${dayTasks.length > 0 ? ` has-task ${color ? `has-task-${color}` : ""}` : ""}`}
                          >
                            {d.getDate()}
                          </div>
                        );
                      })}
                    </div>
                    {taskCount > 0 && (
                      <div className="year-month-summary">
                        <span>
                          <span className="dot" style={{ background: "var(--coral)" }} />{" "}
                          {taskCount}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CalendarSidebar({
  selectedDateStr,
  selectedTasks,
  tasksCount,
  onAddTask,
}: {
  selectedDateStr: string;
  selectedTasks: Task[];
  tasksCount: number;
  onAddTask?: () => void;
}) {
  const { t } = useI18n();
  const overdueCount = selectedTasks.filter((task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  }).length;
  return (
    <div className="calendar-sidebar">
      {/* Selected date info */}
      <div className="cal-sidebar-card">
        <div className="cal-sidebar-title">
          <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
            <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{selectedDateStr || t("calendar.selectDate")}</span>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
          <span className="cal-sidebar-task-tag" style={{ background: "var(--blue)" }}>
            {t("calendar.tasksCount").replace("{count}", String(tasksCount))}
          </span>
          <span className="cal-sidebar-task-tag" style={{ background: "var(--yellow)" }}>
            {overdueCount}{t("calendar.deadline")}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="cal-sidebar-card">
        <div className="cal-sidebar-title">
          <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t("calendar.taskSchedule")}
        </div>

        {selectedTasks.length === 0 ? (
          <div className="empty-tip" style={{ padding: "var(--space-3)" }}>
            {t("calendar.noTasksScheduled")}
          </div>
        ) : (
          selectedTasks.map((task) => {
            const color = getPriorityColorClass(task.priority);
            return (
              <div
                key={task.id}
                className="cal-sidebar-task-item"
                style={{ opacity: task.status === "done" ? 0.6 : 1 }}
              >
                <span className="cal-sidebar-time" style={{ lineHeight: 1.4 }}>
                  {isMultiDayEvent(task)
                    ? <>
                        {new Date(task.startDate!).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })} {new Date(task.startDate!).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                        <br />
                        {new Date(task.dueDate!).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })} {new Date(task.dueDate!).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                      </>
                    : task.dueDate
                      ? new Date(task.dueDate).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
                      : t("calendar.allDay")}
                </span>
                <div className="cal-sidebar-task-info">
                  <div
                    className="cal-sidebar-task-title"
                    style={{ textDecoration: task.status === "done" ? "line-through" : "none" }}
                  >
                    {task.title}
                  </div>
                  <span
                    className="cal-sidebar-task-tag"
                    style={{ background: `var(--${color})`, borderColor: "var(--dark-gray)" }}
                  >
                    {{ coral: t("priority.urgent"), blue: t("priority.important"), yellow: t("priority.inProgress"), cyan: t("priority.daily") }[color]}
                  </span>
                </div>
              </div>
            );
          })
        )}

        <button
          className="btn btn-small"
          style={{ width: "100%", marginTop: "var(--space-3)", justifyContent: "center" }}
          onClick={onAddTask}
        >
          <svg className="icon icon-16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4v16M4 12h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t("calendar.addTask")}
        </button>
      </div>

      {/* Quick filter */}
      <div className="cal-sidebar-card">
        <div className="cal-sidebar-title">
          <svg className="icon icon-18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M7 12h10M10 17h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {t("calendar.quickFilter")}
        </div>
        <div className="tag-group">
          <span
            className="tag tag-pill"
            style={{
              background: "var(--coral)",
              color: "var(--white)",
              borderColor: "var(--coral)",
              cursor: "pointer",
            }}
          >
            {t("list.filterUrgent")}
          </span>
          <span className="tag tag-pill" style={{ background: "var(--blue)", cursor: "pointer" }}>
            {t("list.filterImportant")}
          </span>
          <span className="tag tag-pill" style={{ background: "var(--yellow)", cursor: "pointer" }}>
            {t("list.filterInProgress")}
          </span>
          <span className="tag tag-pill" style={{ background: "var(--cyan)", cursor: "pointer" }}>
            {t("list.filterDone")}
          </span>
        </div>
      </div>
    </div>
  );
}

function getPriorityColorClass(priority: string): string {
  switch (priority) {
    case "urgent-important":
      return "coral";
    case "not-urgent-important":
      return "blue";
    case "urgent-not-important":
      return "yellow";
    case "not-urgent-not-important":
      return "cyan";
    default:
      return "coral";
  }
}
