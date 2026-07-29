import { useEffect, useRef } from "react";
import Modal from "./Modal";
import { useI18n } from "../i18n/config";

export type ConfirmVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

const VARIANT_BUTTON_CLASS: Record<ConfirmVariant, string> = {
  danger: "btn-danger",
  warning: "btn-warning",
  info: "btn-primary",
};

const VARIANT_ICON_COLOR: Record<ConfirmVariant, string> = {
  danger: "var(--coral)",
  warning: "var(--yellow)",
  info: "var(--blue)",
};

function VariantIcon({ variant }: { variant: ConfirmVariant }) {
  const color = VARIANT_ICON_COLOR[variant];
  if (variant === "danger") {
    return (
      <svg className="icon icon-24" viewBox="0 0 24 24" fill="none" style={{ color }}>
        <path
          d="M5 7h14M10 7V4h4v3M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg className="icon icon-24" viewBox="0 0 24 24" fill="none" style={{ color }}>
        <path
          d="M12 9v4M12 17h0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M10.29 3.86l-8.1 14c-.6 1.04.15 2.14 1.21 2.14h16.2c1.06 0 1.81-1.1 1.21-2.14l-8.1-14c-.6-1.04-1.82-1.04-2.42 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className="icon icon-24" viewBox="0 0 24 24" fill="none" style={{ color }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4M12 16h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
}: ConfirmDialogProps) {
  const { t } = useI18n();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const resolvedConfirmText = confirmText ?? t("task.confirm");
  const resolvedCancelText = cancelText ?? t("task.cancel");
  const variantClass = VARIANT_BUTTON_CLASS[variant];

  // Auto-focus confirm button when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the DOM is ready after animation
      const timer = setTimeout(() => confirmRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Enter key to confirm
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        onConfirm();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px" compact>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "var(--space-3)",
            marginBottom: "var(--space-4)",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--dark-gray)",
              background: "var(--bg-page)",
            }}
          >
            <VariantIcon variant={variant} />
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.5, flex: 1, margin: 0, paddingTop: 4 }}>
            {message}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <button className="btn btn-small" onClick={onClose}>
            {resolvedCancelText}
          </button>
          <button
            ref={confirmRef}
            className={`btn btn-small ${variantClass}`}
            onClick={onConfirm}
          >
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
