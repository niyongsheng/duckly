import { useEffect, useMemo, useState } from "react";
import type { Priority, RepeatType, TaskCreate } from "../db/schema";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";
import Modal from "./Modal";

export default function TaskForm() {
  const { t } = useI18n();
  const { showTaskForm, editingTaskId, closeTaskForm } = useUIStore();
  const { tasks, addTask, updateTask } = useTaskStore();

  const PRIORITY_CONFIG = useMemo(() => [
    { key: "urgent-important" as Priority, label: t("priority.urgent-important"), color: "coral", dotColor: "coral" },
    { key: "not-urgent-important" as Priority, label: t("priority.not-urgent-important"), color: "blue", dotColor: "blue" },
    { key: "urgent-not-important" as Priority, label: t("priority.urgent-not-important"), color: "yellow", dotColor: "yellow" },
    { key: "not-urgent-not-important" as Priority, label: t("priority.not-urgent-not-important"), color: "cyan", dotColor: "cyan" },
  ], [t]);

  const REPEAT_OPTIONS = useMemo(() => [
    { value: "none" as RepeatType, label: t("repeat.none") },
    { value: "daily" as RepeatType, label: t("repeat.daily") },
    { value: "weekly" as RepeatType, label: t("repeat.weekly") },
    { value: "monthly" as RepeatType, label: t("repeat.monthly") },
  ], [t]);

  const TAG_PRESETS = useMemo(() => {
    const names = t("tag.presetsForm").split(",");
    const colors = ["var(--blue)", "var(--coral)", "var(--yellow)", "var(--cyan)"];
    return names.map((name: string, i: number) => ({ name: name.trim(), color: colors[i] || "var(--blue)" }));
  }, [t]);

  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("urgent-important");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repeat, setRepeat] = useState<RepeatType>("none");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? "");
      setPriority(editingTask.priority);
      setStartDate(editingTask.startDate ?? "");
      setEndDate(editingTask.dueDate ?? "");
      setRepeat(editingTask.repeat);
      setSelectedTags(editingTask.tags ?? []);
    } else {
      setTitle("");
      setDescription("");
      setPriority("urgent-important");
      setStartDate("");
      setEndDate("");
      setRepeat("none");
      setSelectedTags([]);
    }
  }, [editingTask, showTaskForm]);

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const data: TaskCreate = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        tags: selectedTags,
        startDate: startDate || undefined,
        dueDate: endDate || undefined,
        repeat: repeat === "none" ? undefined : repeat,
      };

      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await addTask(data);
      }
      closeTaskForm();
    } catch (err) {
      console.error("Failed to save task:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={showTaskForm}
      onClose={closeTaskForm}
      title={editingTask ? t("task.editTitle") : t("task.formTitle")}
    >
      <form className="task-form" onSubmit={handleSubmit}>
        {/* Title */}
        <div>
          <label>{t("task.name")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder={t("task.namePlaceholder")}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label>{t("task.description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            placeholder={t("task.descPlaceholder")}
          />
        </div>

        {/* Priority Quadrant Buttons */}
        <div>
          <label>{t("task.quadrant")}</label>
          <div className="priority-group">
            {PRIORITY_CONFIG.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`priority-btn ${p.color}${priority === p.key ? " active" : ""}`}
                onClick={() => setPriority(p.key)}
              >
                <span className={`p-dot ${p.dotColor}`} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div>
          <label>{t("task.timeRange")}</label>
          <div className="task-time-range">
            <input
              className="form-input"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="time-range-sep">{t("task.to")}</span>
            <input
              className="form-input"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Repeat */}
        <div>
          <label>{t("task.repeat")}</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as RepeatType)}
            className="form-input"
          >
            {REPEAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tag Selector */}
        <div>
          <label>{t("task.tags")}</label>
          <div className="tag-select">
            {TAG_PRESETS.map((tag) => (
              <span
                key={tag.name}
                className={`tag tag-pill${selectedTags.includes(tag.name) ? " active" : ""}`}
                style={{
                  background: selectedTags.includes(tag.name) ? tag.color : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="task-form-actions">
          <button type="button" onClick={closeTaskForm} className="btn btn-small">
            {t("task.cancel")}
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="btn btn-small btn-primary"
            style={{ opacity: saving || !title.trim() ? 0.6 : 1 }}
          >
            {saving ? t("task.saving") : editingTask ? t("task.saveChanges") : t("task.create")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
