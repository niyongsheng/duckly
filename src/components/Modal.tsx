import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  compact?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = "1152px", compact = false }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ overflowY: "auto" }}
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0"
            style={{ background: "rgba(56,56,56,0.5)" }}
            onClick={onClose}
          />
          {/* Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative"
            style={{
              background: "var(--bg-card)",
              border: "var(--border-default)",
              maxWidth,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between"
              style={{
                padding: compact ? "var(--space-3) var(--space-4)" : "var(--space-8) var(--space-8) var(--space-6)",
                background: "var(--bg-card)",
                borderBottom: "var(--border-default)",
              }}
            >
              <h2 style={compact ? { fontSize: 20, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--dark-gray)" } : undefined} className={compact ? undefined : "modal-title"}>{title}</h2>
              <button onClick={onClose} className="modal-close" aria-label="Close">
                <svg className="icon icon-24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: compact ? "var(--space-4) var(--space-5) var(--space-5)" : "var(--space-8)" }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
