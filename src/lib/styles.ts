import type React from "react";

export const GLASS_CARD: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e8eef4",
  borderRadius: "var(--app-radius, 20px)",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.04)",
  padding: "20px 24px",
};

export const FORM_LABEL: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#475569",
  display: "block",
  marginBottom: 6,
  letterSpacing: "0.2px",
};

export const FORM_INPUT: React.CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 12,
  border: "2px solid #e2e8f0",
  padding: "0 14px",
  fontSize: 14,
  color: "#0f172a",
  outline: "none",
  fontFamily: "inherit",
  backgroundColor: "#ffffff",
  boxSizing: "border-box" as const,
};

export const PRIMARY_BTN: React.CSSProperties = {
  height: 44,
  padding: "0 20px",
  borderRadius: 12,
  background: "linear-gradient(135deg, hsl(var(--primary, 215 40% 22%)), hsl(var(--primary2, 173 58% 42%)))",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: "0 4px 14px hsl(var(--primary, 215 40% 22%) / 0.25)",
  transition: "opacity 150ms ease, transform 150ms ease",
};
