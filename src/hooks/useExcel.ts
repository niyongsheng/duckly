import { useCallback } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { downloadTemplate, exportTasksToExcel, importTasksFromExcel } from "../utils/excel";

export function useExcel() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);

  const exportTasks = useCallback(() => {
    exportTasksToExcel(tasks);
  }, [tasks]);

  const importTasks = useCallback(
    async (file: File) => {
      const imported = await importTasksFromExcel(file);
      for (const task of imported) {
        await addTask(task);
      }
      // Don't call loadTasks() — it would reload from DB and may return
      // stale data (OPFS write might not be visible to a new query yet in
      // SQLite WASM).  The store already has every task from addTask().
      return imported.length;
    },
    [addTask],
  );

  const download = useCallback(() => {
    downloadTemplate();
  }, []);

  return { exportTasks, importTasks, download };
}
