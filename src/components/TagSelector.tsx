import { useState } from "react";
import { TAG_COLORS } from "../constants";

interface TagSelectorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ tags, onChange }: TagSelectorProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-cartoon-warm text-cartoon-text/70"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-cartoon-accent ml-0.5"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 focus:border-cartoon-primary focus:ring-2 focus:ring-cartoon-primary/20 outline-none text-cartoon-text text-sm"
          placeholder="Type and press Enter"
        />
        <button
          type="button"
          onClick={addTag}
          className="btn-duck bg-cartoon-warm text-cartoon-text text-sm px-3"
        >
          +
        </button>
      </div>
      <div className="flex gap-1.5 mt-2">
        {TAG_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className="w-5 h-5 rounded-full transition-transform hover:scale-125"
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
