import { useEffect, useState } from "react";
import type { Toast as ToastType } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: number) => void;
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: number) => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setShow(true));
    const hideTimer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 2200);
    return () => {
      cancelAnimationFrame(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast.id, onRemove]);

  const icons: Record<string, string> = {
    success:
      '<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error:
      '<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    warning:
      '<svg class="icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 8v4M12 16h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  return (
    <div
      className={`toast ${toast.type} ${show ? "show" : ""}`}
      dangerouslySetInnerHTML={{
        __html: (icons[toast.type] || icons.success) + toast.message,
      }}
    />
  );
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
