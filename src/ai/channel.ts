import type { AIPermission, AIRequest, AIResponse } from "../types/ai";
import { AI_METHODS, type AIMethodName } from "./methods";
import { checkMethodPermission, isMethodAvailable, logOperation } from "./security";

let currentPermission: AIPermission = "readonly";
let channelActive = false;

export function setAIPermission(permission: AIPermission): void {
  currentPermission = permission;
}

export function setChannelActive(active: boolean): void {
  channelActive = active;
}

export function isChannelActive(): boolean {
  return channelActive;
}

function handleAIRequest(request: AIRequest): AIResponse {
  const { jsonrpc, id, method, params } = request;

  if (jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid Request: must use jsonrpc 2.0" },
    };
  }

  if (!id) {
    return {
      jsonrpc: "2.0",
      id: "",
      error: { code: -32600, message: "Invalid Request: missing id" },
    };
  }

  // Check permission
  const permissionCheck = checkMethodPermission(method, currentPermission);
  if (!permissionCheck.allowed) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32001, message: permissionCheck.error ?? "Permission denied" },
    };
  }

  // Check if method exists
  if (!isMethodAvailable(method)) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method '${method}' not found` },
    };
  }

  // Execute method
  const methodFn = AI_METHODS[method as AIMethodName];

  // Use Promise.resolve to handle both sync and async methods
  return Promise.resolve(methodFn(params as never)).then(
    (result) => {
      if (result.success) {
        logOperation(method, params, "success");
        return {
          jsonrpc: "2.0",
          id,
          result: result.data,
        };
      } else {
        logOperation(method, params, "error");
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32000, message: result.error ?? "Unknown error" },
        };
      }
    },
    (err) => {
      logOperation(method, params, "error");
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: (err as Error).message },
      };
    },
  ) as unknown as AIResponse;
}

/**
 * Execute an AI method directly (used by window.__DucklyAI).
 * Returns the raw result data, or throws on error.
 */
async function executeMethod(method: string, params: Record<string, unknown>): Promise<unknown> {
  const permissionCheck = checkMethodPermission(method, currentPermission);
  if (!permissionCheck.allowed) {
    throw new Error(permissionCheck.error ?? "Permission denied");
  }

  if (!isMethodAvailable(method)) {
    throw new Error(`Method '${method}' not found`);
  }

  const methodFn = AI_METHODS[method as AIMethodName];
  const result = await Promise.resolve(methodFn(params as never));

  if (!result.success) {
    throw new Error(result.error ?? "Unknown error");
  }
  return result.data;
}

// Setup message listener
export function initAIChannel(): void {
  if (channelActive) return; // prevent double-init

  window.addEventListener("message", (event: MessageEvent) => {
    const data = event.data as AIRequest;
    if (data?.jsonrpc !== "2.0") return;

    // Don't respond to our own requests
    if (!event.source || event.source === window) return;

    const response = handleAIRequest(data);

    // Send response back
    (event.source as Window).postMessage(response, {
      targetOrigin: event.origin,
    });
  });

  // Expose global API for in-browser AI agents
  if (typeof window !== "undefined" && !window.__DucklyAI) {
    window.__DucklyAI = {
      queryTasks: (params) =>
        executeMethod("queryTasks", params as Record<string, unknown>) as never,
      createTask: (params) =>
        executeMethod("createTask", params as Record<string, unknown>) as never,
      updateTask: (params) =>
        executeMethod("updateTask", params as Record<string, unknown>) as never,
      deleteTask: (params) =>
        executeMethod("deleteTask", params as Record<string, unknown>) as never,
      getTags: () =>
        executeMethod("getTags", {}) as never,
    };
  }

  channelActive = true;
}
