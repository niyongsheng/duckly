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

// Setup message listener
export function initAIChannel(): void {
  window.addEventListener("message", (event: MessageEvent) => {
    if (!channelActive) return;

    const data = event.data as AIRequest;
    if (data?.jsonrpc !== "2.0") return;

    const response = handleAIRequest(data);

    // Send response back to the same origin
    if (event.source) {
      (event.source as Window).postMessage(response, {
        targetOrigin: event.origin,
      });
    }
  });

  channelActive = true;
}
