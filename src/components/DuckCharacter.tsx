import { useEffect } from "react";
import { useI18n } from "../i18n/config";
import { useTaskStore } from "../stores/useTaskStore";
import { useUIStore } from "../stores/useUIStore";

const DUCK_EMOJIS = {
  happy: "🦆✨",
  neutral: "🦆",
  sad: "🦆💧",
};

export default function DuckCharacter() {
  const { t } = useI18n();
  const tasks = useTaskStore((s) => s.tasks);
  const { duckMood, setDuckMood } = useUIStore();

  useEffect(() => {
    if (tasks.length === 0) {
      setDuckMood("neutral");
    } else {
      const doneCount = tasks.filter((t) => t.status === "done").length;
      const ratio = doneCount / tasks.length;
      if (ratio >= 0.7) setDuckMood("happy");
      else if (ratio >= 0.3) setDuckMood("neutral");
      else setDuckMood("sad");
    }
  }, [tasks, setDuckMood]);

  return (
    <div className="flex flex-col items-center py-6">
      <div className="text-6xl mb-2 transition-all duration-300 hover:scale-110 cursor-pointer select-none">
        {DUCK_EMOJIS[duckMood]}
      </div>
      <p className="text-cartoon-text/70 text-lg">{t(`duck.${duckMood}`)}</p>
    </div>
  );
}
