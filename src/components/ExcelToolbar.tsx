import { useRef } from "react";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";
import { downloadTemplate, exportTasksToExcel, importTasksFromExcel } from "../utils/excel";

export default function ExcelToolbar() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const loadTasks = useTaskStore((s) => s.loadTasks);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportTasksToExcel(tasks);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importTasksFromExcel(file);
      for (const task of imported) {
        await addTask(task);
      }
      await loadTasks();
      alert(`Imported ${imported.length} tasks!`);
    } catch (err) {
      alert(`Import failed: ${(err as Error).message}`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleExport} className="btn-duck bg-cartoon-warm text-cartoon-text text-sm">
        📥 {t("excel.export")}
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-duck bg-cartoon-warm text-cartoon-text text-sm"
      >
        📤 {t("excel.import")}
      </button>
      <button
        onClick={downloadTemplate}
        className="btn-duck bg-gray-100 text-cartoon-text/60 text-sm"
      >
        📋 {t("excel.template")}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
