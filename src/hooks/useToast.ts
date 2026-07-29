import { useCallback } from "react";
import { useSyncExternalStore } from "react";

export type ToastType = "success" | "error" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Toast[] {
  return toasts;
}

/** Direct global showToast — works outside React hooks context */
export function showToast(message: string, type: ToastType = "success"): void {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emitChange();

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  }, 2500);
}

export function useToast() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const removeToast = useCallback((id: number) => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  }, []);

  return { toasts: currentToasts, showToast, removeToast };
}
