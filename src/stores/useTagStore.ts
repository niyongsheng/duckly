import { create } from "zustand";
import { initDatabase } from "../db/database";
import type { Tag } from "../db/schema";

const DEFAULT_TAGS: Array<{ name: string; color: string }> = [
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

// Fallback to localStorage when SQLite is unavailable
function loadFallback(): Tag[] {
  try {
    return JSON.parse(localStorage.getItem("duckly_tags") || "[]");
  } catch {
    return [];
  }
}

function saveFallback(tags: Tag[]) {
  try {
    localStorage.setItem("duckly_tags", JSON.stringify(tags));
  } catch { /* ignore */ }
}

let tagIdCounter = Date.now();

function makeFallbackTag(name: string, color: string): Tag {
  return {
    id: `tag_${++tagIdCounter}`,
    name,
    color,
    createdAt: new Date().toISOString(),
  };
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  loading: false,

  loadTags: async () => {
    if (get().tags.length > 0 && !get().loading) return;
    set({ loading: true });

    try {
      const db = await initDatabase();
      const tags = await db.getAllTags();

      if (tags.length === 0) {
        // Seed defaults
        for (const preset of DEFAULT_TAGS) {
          try {
            await db.exec(
              `INSERT OR IGNORE INTO tags (id, name, color, created_at) VALUES ('${crypto.randomUUID()}', '${preset.name.replace(/'/g, "''")}', '${preset.color}', '${new Date().toISOString()}')`,
            );
          } catch { /* ignore */ }
        }
        const refetched = await db.getAllTags();
        if (refetched.length > 0) {
          set({ tags: refetched, loading: false });
          return;
        }
      } else {
        set({ tags, loading: false });
        return;
      }
    } catch (e) {
      console.warn("[tags] DB unavailable, using localStorage:", e);
    }

    // Fallback: use localStorage
    let fallback = loadFallback();
    if (fallback.length === 0) {
      fallback = DEFAULT_TAGS.map((p) => makeFallbackTag(p.name, p.color));
      saveFallback(fallback);
    }
    set({ tags: fallback, loading: false });
  },

  createTag: async (name: string, color: string) => {
    const tag = makeFallbackTag(name, color);

    // Try DB first
    try {
      const db = await initDatabase();
      const dbTag = await db.createTag(name, color);
      set((state) => ({ tags: [...state.tags, dbTag] }));
      return dbTag;
    } catch {
      // Fallback to localStorage
      const current = get().tags;
      saveFallback([...current, tag]);
      set((state) => ({ tags: [...state.tags, tag] }));
      return tag;
    }
  },

  deleteTag: async (id: string) => {
    set((state) => ({ tags: state.tags.filter((t) => t.id !== id) }));
    // Try DB
    try {
      const db = await initDatabase();
      await db.deleteTag(id);
    } catch { /* ignore */ }
    // Also update localStorage fallback
    try {
      const current = get().tags;
      saveFallback(current);
    } catch { /* ignore */ }
  },
}));
