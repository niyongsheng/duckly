export interface AIRequest {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface AIResponse {
  jsonrpc: "2.0";
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

export type AIPermission = "readonly" | "readwrite";

export interface DucklyAI {
  queryTasks: (params: { status?: string; priority?: string }) => Promise<unknown>;
  createTask: (params: Record<string, unknown>) => Promise<unknown>;
  updateTask: (params: Record<string, unknown>) => Promise<unknown>;
  deleteTask: (params: { id: string }) => Promise<unknown>;
  getTags: () => Promise<unknown>;
}

declare global {
  interface Window {
    __DucklyAI?: DucklyAI;
  }
}
