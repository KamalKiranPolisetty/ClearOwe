'use client';

import { useState, useEffect } from "react";
import { CURRENCIES, getCurrencyDisplayMode, type CurrencyDisplayMode } from "@/lib/currency";

interface Props {
  value: string;
  onChange: (val: "INR" | "USD") => void;
  variant?: "default" | "onColor";
}

export function CurrencyToggle({ value, onChange, variant = "default" }: Props) {
  const [displayMode, setDisplayMode] = useState<CurrencyDisplayMode>(() => getCurrencyDisplayMode());

  useEffect(() => {
    const sync = () => setDisplayMode(getCurrencyDisplayMode());
    sync();
    window.addEventListener("ss_currency_mode_changed", sync);
    return () => window.removeEventListener("ss_currency_mode_changed", sync);
  }, []);

  if (displayMode !== "both") {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="Currency"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        maxWidth: "100%",
        alignSelf: "flex-start",
        gap: 3,
        height: 38,
        boxSizing: "border-box",
        border: variant === "onColor" ? "1.5px solid rgba(255,255,255,0.38)" : "1.5px solid #e2e8f0",
        background: variant === "onColor" ? "rgba(255,255,255,0.14)" : "#f1f5f9",
        backdropFilter: variant === "onColor" ? "blur(8px)" : "none",
        WebkitBackdropFilter: variant === "onColor" ? "blur(8px)" : "none",
        borderRadius: 999,
        padding: 3,
        flexShrink: 0,
      }}
    >
      {CURRENCIES.map((c) => {
        const active = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(c.value as "INR" | "USD")}
            style={{
              height: 32,
              minHeight: "unset",
              paddingLeft: 15,
              paddingRight: 15,
              borderRadius: 999,
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? "#ffffff" : "transparent",
              boxShadow: active ? "0 1px 6px rgba(0,0,0,0.12)" : "none",
              color: active
                ? "hsl(var(--primary, 215 40% 22%))"
                : variant === "onColor"
                ? "rgba(255,255,255,0.85)"
                : "#64748b",
              fontWeight: active ? 700 : 500,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.04em",
              transition: "background-color 200ms, box-shadow 200ms, color 200ms",
              whiteSpace: "nowrap",
            }}
          >
            {c.value}
          </button>
        );
      })}
    </div>
  );
}
