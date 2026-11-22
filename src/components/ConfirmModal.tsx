'use client';

import React, { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  icon?: "trash" | "alert" | "undo";
  itemSummary?: unknown;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const subscribe = () => () => {};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  const titleId = useId();
  const descId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  // Escape cancels + Focus trap inside dialog
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
        return;
      }
      if (e.key === "Tab" && cardRef.current) {
        const nodes = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, isLoading]);

  // Safe default focus (Cancel button auto-focused for danger)
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      (isDestructive ? cancelRef.current : confirmRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, isDestructive]);

  if (!isOpen || !mounted) return null;

  const displayMessage = message || description || "This cannot be undone.";

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "inherit",
        boxSizing: "border-box",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isLoading) onClose();
        }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          transition: "opacity 150ms ease",
        }}
      />

      {/* Card matching SimpleSpend ConfirmDialog */}
      <div
        ref={cardRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 24px 60px rgba(0,0,0,0.20)",
          padding: 24,
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              flexShrink: 0,
              background: isDestructive ? "rgba(220, 38, 38, 0.10)" : "hsl(var(--primary) / 0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={20} color={isDestructive ? "#dc2626" : "hsl(var(--primary))"} />
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            <h2
              id={titleId}
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#0c1a2e",
                margin: 0,
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
            {displayMessage && (
              <div
                id={descId}
                style={{
                  fontSize: 14,
                  color: "#475569",
                  margin: "8px 0 0",
                  lineHeight: 1.55,
                }}
              >
                {displayMessage}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              height: 42,
              padding: "0 18px",
              borderRadius: 10,
              background: "#f1f5f9",
              color: "#374151",
              border: "1px solid #e2e8f0",
              fontWeight: 600,
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#f1f5f9";
            }}
          >
            {cancelText}
          </button>

          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              height: 42,
              padding: "0 20px",
              borderRadius: 10,
              background: isDestructive ? "#dc2626" : "hsl(var(--primary))",
              color: "#ffffff",
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              boxShadow: isDestructive ? "0 4px 14px rgba(220, 38, 38, 0.35)" : "0 4px 14px hsl(var(--primary) / 0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "transform 150ms, box-shadow 150ms",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
