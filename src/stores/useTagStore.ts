import { create } from "zustand";
import { initDatabase } from "../db/database";
import type { Tag } from "../db/schema";

const DEFAULT_TAGS = [
  { name: "💻 技术开发", color: "var(--blue)" },
  { name: "⚡ 紧急业务", color: "var(--coral)" },
  { name: "🌱 个人成长", color: "var(--yellow)" },
  { name: "📋 日常事务", color: "var(--cyan)" },
];

interface TagState {
  tags: Tag[];
  loading: boolean;

  loadTags: () => Promise<void>;
  createTag: (name: string, color: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  seedDefaults: () => Promise<void>;
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,

  loadTags: async () => {
    set({ loading: true });
    try {
      const db = await initDatabase();
      const tags = await db.getAllTags();
      set({ tags, loading: false });

      // Seed defaults if empty
      if (tags.length === 0) {
        await get().seedDefaults();
      }
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

  seedDefaults: async () => {
    const existing = get().tags;
    if (existing.length > 0) return;
    for (const preset of DEFAULT_TAGS) {
      const db = await initDatabase();
      // Check if tag already exists by name (avoid UNIQUE constraint error)
      const allTags = await db.getAllTags();
      if (allTags.some((t) => t.name === preset.name)) continue;
      await get().createTag(preset.name, preset.color);
    }
    // Re-fetch to get DB-generated state
    const db = await initDatabase();
    const fresh = await db.getAllTags();
    set({ tags: fresh, loading: false });
  },
}));
