import * as XLSX from "xlsx";
import type { Task, TaskCreate } from "../db/schema";

const EXPORT_HEADERS = [
  "Title",
  "Description",
  "Priority",
  "Status",
  "Tags",
  "Due Date",
  "Repeat",
  "Created At",
];

function taskToRow(task: Task): (string | number | boolean)[] {
  return [
    task.title,
    task.description ?? "",
    task.priority,
    task.status,
    task.tags.join(", "),
    task.dueDate ?? "",
    task.repeat,
    task.createdAt,
  ];
}

function rowToTask(row: (string | number | boolean)[]): TaskCreate {
  return {
    title: String(row[0] ?? ""),
    description: String(row[1] ?? ""),
    priority: (String(row[2]) ?? "not-urgent-not-important") as TaskCreate["priority"],
    tags: String(row[4] ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    dueDate: String(row[5] ?? "") || undefined,
    repeat: (String(row[6]) ?? "none") as TaskCreate["repeat"],
  };
}

export function exportTasksToExcel(tasks: Task[]): void {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS, ...tasks.map(taskToRow)]);

  // Column widths
  ws["!cols"] = [
    { wch: 30 },
    { wch: 40 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Tasks");
  XLSX.writeFile(wb, `duckly-tasks-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function importTasksFromExcel(file: File): Promise<TaskCreate[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<(string | number | boolean)[]>(ws, {
          header: 1,
        });

        // Skip header row
        const dataRows = rows.slice(1).filter((row) => row.length > 0 && row[0]);
        const tasks = dataRows.map(rowToTask);
        resolve(tasks);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadTemplate(): void {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    EXPORT_HEADERS,
    [
      "Sample Task",
      "Description here",
      "urgent-important",
      "todo",
      "work, personal",
      "2025-12-31",
      "none",
      new Date().toISOString(),
    ],
  ]);

  ws["!cols"] = [
    { wch: 30 },
    { wch: 40 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 10 },
    { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Tasks");
  XLSX.writeFile(wb, "duckly-template.xlsx");
}
