import { useCallback } from "react";
import { useTaskStore } from "../stores/useTaskStore";
import { downloadTemplate, exportTasksToExcel, importTasksFromExcel } from "../utils/excel";

export function useExcel() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const loadTasks = useTaskStore((s) => s.loadTasks);

  const exportTasks = useCallback(() => {
    exportTasksToExcel(tasks);
  }, [tasks]);

  const importTasks = useCallback(
    async (file: File) => {
      const imported = await importTasksFromExcel(file);
      for (const task of imported) {
        await addTask(task);
      }
      await loadTasks();
      return imported.length;
    },
    [addTask, loadTasks],
  );

  const download = useCallback(() => {
    downloadTemplate();
  }, []);

  return { exportTasks, importTasks, download };
}
