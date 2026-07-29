import { setAIPermission, setChannelActive } from "../ai/channel";
import { useI18n } from "../i18n/config";
import { useUIStore } from "../stores/useUIStore";

export default function AIChannelToggle() {
  const { t } = useI18n();
  const { aiChannelOpen, aiPermission, setAIChannel } = useUIStore();

  const handleToggle = () => {
    const newOpen = !aiChannelOpen;
    setChannelActive(newOpen);
    setAIChannel(newOpen, aiPermission);
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const perm = e.target.value as "readonly" | "readwrite";
    setAIChannel(true, perm);
    setAIPermission(perm);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-cartoon-text/50">{t("ai.title")}</span>
      <button
        onClick={handleToggle}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          aiChannelOpen ? "bg-cartoon-mint" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            aiChannelOpen ? "translate-x-5" : ""
          }`}
        />
      </button>
      {aiChannelOpen && (
        <select
          value={aiPermission}
          onChange={handlePermissionChange}
          className="text-xs border border-gray-200 rounded-lg px-1 py-0.5 bg-white text-cartoon-text"
        >
          <option value="readonly">{t("ai.readonly")}</option>
          <option value="readwrite">{t("ai.readwrite")}</option>
        </select>
      )}
    </div>
  );
}
