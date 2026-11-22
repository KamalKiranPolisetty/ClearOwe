'use client';

import { useState, useMemo } from "react";
import type { Loan, Payment } from "@/types";
import { getCurrencyDisplayMode, setCurrencyDisplayMode, type CurrencyDisplayMode, type Currency } from "@/lib/currency";
import {
  Coins,
  CheckCircle2,
  RotateCcw,
  User as UserIcon,
  LogOut,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsViewProps {
  loans?: Loan[];
  payments?: Payment[];
  onResetAllData: () => Promise<void>;
  defaultCurrency?: "INR" | "USD";
  onUpdateDefaultCurrency?: (c: "INR" | "USD") => void;
}

export function SettingsView({
  onResetAllData,
  defaultCurrency = "INR",
  onUpdateDefaultCurrency,
}: SettingsViewProps) {
  const { user, displayName, signOut, updateDisplayName, updateEmail, updatePassword } = useAuth();
  const [currencyMode, setCurrencyMode] = useState<CurrencyDisplayMode>(() => getCurrencyDisplayMode());
  const [activeDefCurrency, setActiveDefCurrency] = useState<Currency>(defaultCurrency);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Account profile states matching SimpleSpend
  const [nameInput, setNameInput] = useState(() => displayName || user?.display_name || "Demo");
  const [prevDisplayName, setPrevDisplayName] = useState(displayName);
  if (displayName !== prevDisplayName) {
    setPrevDisplayName(displayName);
    setNameInput(displayName || "");
  }

  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const userInitials = useMemo(() => {
    const raw = displayName || user?.display_name || user?.email || "Demo";
    if (raw.includes("@")) {
      return raw.slice(0, 2).toUpperCase();
    }
    const parts = raw.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
  }, [displayName, user]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSavingName(true);
    const { error } = await updateDisplayName(nameInput.trim());
    setSavingName(false);
    if (error) {
      setFeedbackMsg("Failed to save name: " + error);
    } else {
      setNameSaved(true);
      setFeedbackMsg("Display name updated!");
      setTimeout(() => setNameSaved(false), 2000);
    }
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await updateEmail(newEmail.trim());
    setSavingEmail(false);
    if (error) {
      setFeedbackMsg(error);
    } else {
      setEmailSaved(true);
      setFeedbackMsg("Email updated successfully!");
      setNewEmail("");
      setTimeout(() => setEmailSaved(false), 2000);
    }
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    if (newPassword.length < 6) {
      setFeedbackMsg("Password must be at least 6 characters");
      setTimeout(() => setFeedbackMsg(""), 3000);
      return;
    }
    setSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    setSavingPassword(false);
    if (error) {
      setFeedbackMsg(error);
    } else {
      setPasswordSaved(true);
      setFeedbackMsg("Password updated successfully!");
      setNewPassword("");
      setTimeout(() => setPasswordSaved(false), 2000);
    }
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // Reset modal state matching SimpleSpend
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  const handleSelectDisplayMode = (mode: CurrencyDisplayMode) => {
    setCurrencyMode(mode);
    setCurrencyDisplayMode(undefined, mode);
    if (mode === "inr_only") {
      setActiveDefCurrency("INR");
      onUpdateDefaultCurrency?.("INR");
      setFeedbackMsg("Display mode set to INR Only (Default: INR)");
    } else if (mode === "usd_only") {
      setActiveDefCurrency("USD");
      onUpdateDefaultCurrency?.("USD");
      setFeedbackMsg("Display mode set to USD Only (Default: USD)");
    } else {
      setFeedbackMsg("Display mode set to Both (INR & USD)");
    }
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleSelectDefaultCurrency = (cur: Currency) => {
    if (currencyMode === "inr_only" && cur === "USD") return;
    if (currencyMode === "usd_only" && cur === "INR") return;
    setActiveDefCurrency(cur);
    onUpdateDefaultCurrency?.(cur);
    setFeedbackMsg(`Default operating currency set to ${cur}`);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  const handleConfirmReset = async () => {
    if (resetConfirmText.trim().toUpperCase() !== "RESET") return;
    setResetting(true);
    try {
      await onResetAllData();
      setShowResetModal(false);
      setResetConfirmText("");
      setFeedbackMsg("All app data has been reset to zero.");
    } catch {
      setFeedbackMsg("Failed to reset data. Please try again.");
    } finally {
      setResetting(false);
      setTimeout(() => setFeedbackMsg(""), 4000);
    }
  };

  return (
    <div>
      {/* ── Desktop Header ── */}
      <div className="desktop-only" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px", margin: 0 }}>
          Settings &amp; Preferences
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
          Currencies, preferences, and household data management
        </p>
      </div>

      {/* ── Mobile Hero Banner matching SimpleSpend ── */}
      <div className="mobile-only mobile-hero">
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.75)",
            fontWeight: 600,
            margin: "0 0 4px",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}
        >
          Preferences &amp; Household
        </p>
        <h1
          style={{
            fontSize: "clamp(26px, 7vw, 32px)",
            fontWeight: 800,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-0.6px",
          }}
        >
          Settings
        </h1>
      </div>

      {/* ── Content Body with mobile-page-content ── */}
      <div className="mobile-page-content">
        {feedbackMsg && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
              padding: "10px 16px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} /> {feedbackMsg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ── Section 0: Your Account matching SimpleSpend ── */}
          <div className="glass-card" style={{ padding: "24px 24px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserIcon size={16} color="#475569" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0c1a2e" }}>Your Account</span>
            </div>

            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #134e4a 0%, #0d9488 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#ffffff",
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(13, 148, 136, 0.35)",
                }}
              >
                {userInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#0c1a2e" }}>
                  {displayName || user?.display_name || "Demo"}
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 13,
                    color: "#64748b",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.email || "demo@example.com"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "0 0 20px" }} />

            {/* Form Fields */}
            {/* 1. DISPLAY NAME */}
            <label
              htmlFor="settings-display-name"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "block",
                marginBottom: 8,
              }}
            >
              DISPLAY NAME
            </label>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <input
                id="settings-display-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                style={{
                  flex: 1,
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(0,0,0,0.10)",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#0c1a2e",
                  background: "rgba(255,255,255,0.70)",
                  boxSizing: "border-box",
                }}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName || !nameInput.trim()}
                style={{
                  height: 44,
                  minWidth: 84,
                  padding: "0 22px",
                  borderRadius: 10,
                  border: "none",
                  background: "#1e293b",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: savingName || !nameInput.trim() ? "default" : "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  opacity: savingName || !nameInput.trim() ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 150ms ease",
                }}
              >
                {nameSaved ? (
                  <>
                    <Check size={14} /> Saved
                  </>
                ) : savingName ? (
                  "Saving…"
                ) : (
                  "Save"
                )}
              </button>
            </div>

            {/* 2. CHANGE EMAIL */}
            <label
              htmlFor="settings-email"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "block",
                marginBottom: 8,
              }}
            >
              CHANGE EMAIL
            </label>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <input
                id="settings-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={user?.email || "kamalkiranpolisetty@gmail.com"}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateEmail()}
                style={{
                  flex: 1,
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(0,0,0,0.10)",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#0c1a2e",
                  background: "rgba(255,255,255,0.70)",
                  boxSizing: "border-box",
                }}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleUpdateEmail}
                disabled={savingEmail || !newEmail.trim()}
                style={{
                  height: 44,
                  minWidth: 84,
                  padding: "0 20px",
                  borderRadius: 10,
                  border: "none",
                  background: newEmail.trim() ? "#1e293b" : "#94a3b8",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: savingEmail || !newEmail.trim() ? "default" : "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  opacity: savingEmail || !newEmail.trim() ? 0.85 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 150ms ease",
                }}
              >
                {emailSaved ? (
                  <>
                    <Check size={14} /> Sent
                  </>
                ) : savingEmail ? (
                  "Updating…"
                ) : (
                  "Update"
                )}
              </button>
            </div>

            {/* 3. NEW PASSWORD */}
            <label
              htmlFor="settings-password"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                display: "block",
                marginBottom: 8,
              }}
            >
              NEW PASSWORD
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  id="settings-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  onKeyDown={(e) => e.key === "Enter" && handleUpdatePassword()}
                  style={{
                    width: "100%",
                    height: 44,
                    padding: "0 40px 0 14px",
                    borderRadius: 10,
                    border: "1.5px solid rgba(0,0,0,0.10)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    color: "#0c1a2e",
                    background: "rgba(255,255,255,0.70)",
                    boxSizing: "border-box",
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={savingPassword || !newPassword}
                style={{
                  height: 44,
                  minWidth: 84,
                  padding: "0 20px",
                  borderRadius: 10,
                  border: "none",
                  background: newPassword ? "#1e293b" : "#94a3b8",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: savingPassword || !newPassword ? "default" : "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  opacity: savingPassword || !newPassword ? 0.85 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 150ms ease",
                }}
              >
                {passwordSaved ? (
                  <>
                    <Check size={14} /> Updated
                  </>
                ) : savingPassword ? (
                  "Updating…"
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>

        {/* ── Section 1: Currency & Financial Preferences matching SimpleSpend ── */}
        <div className="glass-card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Coins size={18} color="hsl(var(--primary))" />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
              Currency &amp; Financial Preferences
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
            Set your primary operating currency and choose which currency options appear across the app.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Default Currency row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Default Currency</span>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Pages and forms open in this currency by default</p>
              </div>

              <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.05)", borderRadius: 10, padding: 3, gap: 4 }}>
                {(["INR", "USD"] as const).map((cur) => {
                  const active = activeDefCurrency === cur;
                  const isDisabled =
                    (currencyMode === "inr_only" && cur === "USD") ||
                    (currencyMode === "usd_only" && cur === "INR");
                  return (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => handleSelectDefaultCurrency(cur)}
                      disabled={isDisabled}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? "#fff" : "transparent",
                        color: active ? "hsl(var(--primary))" : "#475569",
                        border: "none",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled && !active ? 0.35 : 1,
                        transition: "all 150ms",
                        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        fontFamily: "inherit",
                      }}
                    >
                      {cur === "INR" ? "₹ INR" : "$ USD"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />

            {/* Display Mode row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Display Preference</span>
                <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>Show both currencies with toggle pill, or restrict to a single currency</p>
              </div>

              <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.05)", borderRadius: 10, padding: 3, gap: 4, maxWidth: "100%", flexWrap: "wrap" }}>
                {[
                  { id: "both", label: "Both (INR & USD)" },
                  { id: "inr_only", label: "INR Only" },
                  { id: "usd_only", label: "USD Only" },
                ].map((opt) => {
                  const active = currencyMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectDisplayMode(opt.id as CurrencyDisplayMode)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        backgroundColor: active ? "#fff" : "transparent",
                        color: active ? "hsl(var(--primary))" : "#475569",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 150ms",
                        boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                        fontFamily: "inherit",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Reset App Data (Danger Zone matching SimpleSpend) ── */}
        <div className="glass-card" style={{ padding: "22px 24px", border: "1px solid #fed7aa" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: "rgba(245,158,11,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <RotateCcw size={20} color="#d97706" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Reset App Data
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
                  Clear all loans, payments, and history to start fresh with a clean slate
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setResetConfirmText("");
                setShowResetModal(true);
              }}
              style={{
                height: 42,
                padding: "0 20px",
                borderRadius: 10,
                backgroundColor: "#fff",
                border: "1.5px solid #d97706",
                color: "#d97706",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 7,
                transition: "all 150ms",
              }}
            >
              <RotateCcw size={14} /> Reset App Data
            </button>
          </div>
        </div>

        {/* ── Sign Out for Mobile (Cleanly placed at the bottom of Settings page matching SimpleSpend) ── */}
        <div className="mobile-only" style={{ marginTop: 14, paddingBottom: 32 }}>
          <button
            onClick={signOut}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 14,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.16)",
              color: "#ef4444",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.14)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>

      {/* ── Reset App Data Confirmation Modal matching SimpleSpend ── */}
      {showResetModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowResetModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-app-title"
            style={{
              width: "100%",
              maxWidth: 440,
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 28,
              boxShadow: "0 24px 80px rgba(0,0,0,0.20)",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "rgba(245,158,11,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <RotateCcw size={18} color="#d97706" />
              </div>
              <div>
                <p id="reset-app-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0c1a2e" }}>
                  Reset App Data
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Start fresh with a clean slate</p>
              </div>
            </div>

            <div
              style={{
                borderRadius: 10,
                backgroundColor: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                padding: "12px 14px",
                marginBottom: 20,
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
                This will delete all logged loans, repayments, and transaction history.
                <br />
                <br />
                <strong>Your user account will NOT be deleted</strong>, and you will stay logged in.
              </p>
            </div>

            <label
              htmlFor="reset-confirm-input"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                marginBottom: 7,
              }}
            >
              Type <span style={{ color: "#d97706" }}>RESET</span> to confirm
            </label>
            <input
              id="reset-confirm-input"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="RESET"
              autoComplete="off"
              autoFocus
              style={{
                width: "100%",
                height: 44,
                padding: "0 14px",
                borderRadius: 10,
                boxSizing: "border-box",
                border: "1.5px solid rgba(0,0,0,0.12)",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                color: "#0c1a2e",
                backgroundColor: "rgba(255,255,255,0.80)",
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  border: "1.5px solid rgba(0,0,0,0.10)",
                  backgroundColor: "rgba(0,0,0,0.04)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetting || resetConfirmText.trim().toUpperCase() !== "RESET"}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  border: "none",
                  backgroundColor:
                    resetConfirmText.trim().toUpperCase() === "RESET" ? "#d97706" : "rgba(245,158,11,0.35)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  cursor: resetting || resetConfirmText.trim().toUpperCase() !== "RESET" ? "default" : "pointer",
                  fontFamily: "inherit",
                  transition: "background 150ms",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {resetting ? (
                  "Resetting…"
                ) : (
                  <>
                    <RotateCcw size={14} /> Reset Everything
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
