import { create } from "zustand";
import { initDatabase } from "../db/database";
import type { Tag } from "../db/schema";

const DEFAULT_TAGS = [
  { name: "💻 技术开发", color: "var(--blue)" },
  { name: "⚡ 紧急业务", color: "var(--coral)" },
  { name: "🌱 个人成长", color: "var(--yellow)" },
  { name: "📋 日常事务", color: "var(--cyan)" },
  { name: "📦 产品需求", color: "var(--orange-primary)" },
  { name: "📅 会议", color: "var(--pink)" },
];

interface TagState {
  tags: Tag[];
  loading: boolean;

  loadTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,

  loadTags: async () => {
    // Don't reload if already loaded
    if (get().tags.length > 0 && !get().loading) return;

    set({ loading: true });
    try {
      const db = await initDatabase();
      let tags = await db.getAllTags();
      console.log("[tags] loadTags: got", tags.length, "tags from DB");

      // Ensure default tags exist (runs every time but skips existing)
      const existingNames = new Set(tags.map((t) => t.name));
      let added = 0;
      for (const preset of DEFAULT_TAGS) {
        if (existingNames.has(preset.name)) continue;
        try {
          await db.createTag(preset.name, preset.color);
          existingNames.add(preset.name);
          added++;
        } catch {
          // Ignore UNIQUE constraint errors
        }
      }
      console.log("[tags] loadTags: added", added, "new defaults");

      // Re-fetch if we added any defaults or DB was empty
      if (added > 0 || tags.length === 0) {
        tags = await db.getAllTags();
        console.log("[tags] loadTags: re-fetched", tags.length, "tags");
      }

      console.log("[tags] loadTags: setting state with", tags.length, "tags");
      set({ tags, loading: false });
    } catch (err) {
      console.error("Failed to load tags:", err);
      set({ loading: false });
    }
  },

  createTag: async (name: string, color: string) => {
    const db = await initDatabase();
    const tag = await db.createTag(name, color);
    set((state) => ({ tags: [...state.tags, tag] }));
    return tag;
  },

  deleteTag: async (id: string) => {
    const db = await initDatabase();
    await db.deleteTag(id);
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
  },
}));
