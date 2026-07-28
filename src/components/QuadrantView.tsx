import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import type { Priority, Task } from "../db/schema";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";
import TaskCard from "./TaskCard";
import DragOverlayContent from "./DragOverlayContent";

/* ── Constants ── */

interface QuadrantRawConfig {
  key: Priority;
  dotColor: "coral" | "blue" | "yellow" | "cyan";
  bgColor: "coral" | "blue" | "yellow" | "cyan";
  titleKey: string;
  subtitleKey: string;
}

const QUADRANT_CONFIGS: QuadrantRawConfig[] = [
  {
    key: "urgent-important",
    dotColor: "coral",
    bgColor: "coral",
    titleKey: "quadrant.u1.title",
    subtitleKey: "quadrant.u1.desc",
  },
  {
    key: "not-urgent-important",
    dotColor: "blue",
    bgColor: "blue",
    titleKey: "quadrant.u2.title",
    subtitleKey: "quadrant.u2.desc",
  },
  {
    key: "urgent-not-important",
    dotColor: "yellow",
    bgColor: "yellow",
    titleKey: "quadrant.n1.title",
    subtitleKey: "quadrant.n1.desc",
  },
  {
    key: "not-urgent-not-important",
    dotColor: "cyan",
    bgColor: "cyan",
    titleKey: "quadrant.n2.title",
    subtitleKey: "quadrant.n2.desc",
  },
];

/* ── Sub-components ── */

function DraggableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={isDragging ? { opacity: 0.4, ...style } : style}
      {...listeners}
      {...attributes}
    >
      <TaskCard task={task} />
    </div>
  );
}

function QuadrantColumn({
  raw,
  tasks,
}: {
  raw: QuadrantRawConfig;
  tasks: Task[];
}) {
  const { t } = useI18n();
  const { setNodeRef, isOver } = useDroppable({ id: raw.key });

  return (
    <div
      ref={setNodeRef}
      className="quadrant-card"
      style={
        isOver
          ? {
              outline: `2px dashed var(--${raw.dotColor})`,
              outlineOffset: -2,
            }
          : undefined
      }
    >
      <div className="quadrant-header">
        <div className="quadrant-title-row">
          <span className={`quadrant-dot ${raw.dotColor}`} />
          <div>
            <h3 className="quadrant-title">{t(raw.titleKey)}</h3>
            <p className="quadrant-subtitle">{t(raw.subtitleKey)}</p>
          </div>
        </div>
        <button className={`quadrant-add-btn ${raw.bgColor}`}>+ Add</button>
      </div>
      <div className={`drop-zone ${isOver ? "drag-over" : ""}`}>
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <DraggableTaskCard task={task} />
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div className="empty-tip">
            {raw.key === "not-urgent-not-important"
              ? t("quadrant.empty")
              : t("quadrant.drop")}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function QuadrantView() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const tasksByPriority = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (!map[t.priority]) map[t.priority] = [];
      map[t.priority].push(t);
    }
    return map;
  }, [tasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = event.active.data.current?.task as Task | undefined;
      setActiveTask(task ?? null);
    },
    [],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const targetPriority = over.id as Priority;

      const task = active.data.current?.task as Task | undefined;
      if (!task || task.priority === targetPriority) return;

      await updateTask(taskId, { priority: targetPriority });
    },
    [updateTask],
  );

  return (
    <section className="view-panel">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="quadrant-grid">
          {QUADRANT_CONFIGS.map((raw) => (
            <QuadrantColumn
              key={raw.key}
              raw={raw}
              tasks={tasksByPriority[raw.key] || []}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? <DragOverlayContent task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
