import type { AIPermission } from "../types/ai";
import { AI_METHODS, type AIMethodName } from "./methods";

const WHITELIST_METHODS: Record<string, { permission: AIPermission }> = {
  queryTasks: { permission: "readonly" },
  getTags: { permission: "readonly" },
  createTask: { permission: "readwrite" },
  updateTask: { permission: "readwrite" },
  deleteTask: { permission: "readwrite" },
};

export interface SecurityCheckResult {
  allowed: boolean;
  error?: string;
}

export function checkMethodPermission(
  method: string,
  currentPermission: AIPermission,
): SecurityCheckResult {
  const methodDef = WHITELIST_METHODS[method];

  if (!methodDef) {
    return { allowed: false, error: `Method '${method}' is not in the whitelist` };
  }

  if (currentPermission === "readonly" && methodDef.permission === "readwrite") {
    return {
      allowed: false,
      error: `Method '${method}' requires readwrite permission, current: readonly`,
    };
  }

  return { allowed: true };
}

export function isMethodAvailable(method: string): method is AIMethodName {
  return method in AI_METHODS;
}

const OPERATION_LOG: Array<{
  timestamp: string;
  method: string;
  params: unknown;
  result: "success" | "error";
}> = [];

export function logOperation(method: string, params: unknown, result: "success" | "error"): void {
  OPERATION_LOG.push({
    timestamp: new Date().toISOString(),
    method,
    params,
    result,
  });

  // Keep only last 100 entries
  if (OPERATION_LOG.length > 100) {
    OPERATION_LOG.shift();
  }
}

export function getOperationLog() {
  return [...OPERATION_LOG];
}
