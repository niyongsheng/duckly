import { useState } from "react";
import { useI18n } from "../i18n/config";

export default function TagManagement() {
  const { t } = useI18n();
  const [addedTags, setAddedTags] = useState<Array<{ name: string; color: string }>>([]);
  const [newTagName, setNewTagName] = useState("");

  const presetColors = ["var(--blue)", "var(--coral)", "var(--yellow)", "var(--cyan)"];
  const presetTags = t("tag.presets").split(",").map((name: string, i: number) => ({
    name: name.trim(),
    color: presetColors[i] || "var(--blue)",
  }));
  const allTags = [...presetTags, ...addedTags];

  const handleCreate = () => {
    const name = newTagName.trim();
    if (!name) return;
    const extraColors = ["var(--pink)", "var(--orange-primary)"];
    const color = extraColors[addedTags.length % extraColors.length];
    setAddedTags([...addedTags, { name, color }]);
    setNewTagName("");
  };

  return (
    <div className="card">
      <h3
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: "var(--space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <svg className="icon icon-20" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L3 13V3h10l8.59 8.59a2 2 0 0 1 0 2.82z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="7" r="1.5" fill="currentColor" />
        </svg>
        {t("tag.management")}
      </h3>
      <div className="tag-group" style={{ marginBottom: "var(--space-6)" }}>
        {allTags.map((tag) => (
          <span key={tag.name} className="tag tag-pill" style={{ background: tag.color }}>
            {tag.name}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <input
          className="form-input"
          placeholder={t("tag.placeholder")}
          style={{ flex: 1 }}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
        />
        <button className="btn btn-small" onClick={handleCreate}>
          {t("tag.create")}
        </button>
      </div>
    </div>
  );
}
