/**
 * JSON-RPC 2.0 style wrapper for Worker message passing.
 *
 * We use the @sqlite.org/sqlite-wasm built-in Worker promiser for DB operations.
 * This module provides an abstraction layer for the database operations exposed
 * to the rest of the app and to external AI agents.
 */

export interface RPCRequest {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params: Record<string, unknown>;
}

export interface RPCResponse {
  jsonrpc: "2.0";
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export function createRPCError(
  id: string,
  code: number,
  message: string,
  data?: unknown,
): RPCResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: { code, message, data },
  };
}

export function createRPCResult(id: string, result: unknown): RPCResponse {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}
