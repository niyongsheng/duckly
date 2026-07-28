import { useCallback, useRef, useState } from "react";

export type ToastType = "success" | "error" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let nextId = 1;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message, type }]);

      const timer = setTimeout(() => {
        removeToast(id);
      }, 2500);

      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  return { toasts, showToast, removeToast };
}
