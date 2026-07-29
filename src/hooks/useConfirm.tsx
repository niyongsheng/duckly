import { useCallback, useRef, useState } from "react";
import { useI18n } from "../i18n/config";
import ConfirmDialog, { type ConfirmVariant } from "../components/ConfirmDialog";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export function useConfirm() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
      setIsOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const ConfirmDialogComponent = useCallback(() => {
    if (!options) return null;
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title ?? t("task.confirm")}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant ?? "danger"}
      />
    );
  }, [isOpen, options, handleCancel, handleConfirm, t]);

  return [confirm, ConfirmDialogComponent] as const;
}
