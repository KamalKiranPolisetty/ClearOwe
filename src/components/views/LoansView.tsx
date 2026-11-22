'use client';

import { useState, useEffect, useRef } from "react";
import type { Loan, LoanWithStatus, Payment } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { getEffectiveAnnualRate } from "@/lib/calculations";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { LoanCard } from "@/components/LoanCard";
import {
  Plus,
  Building2,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Check,
  X,
} from "lucide-react";

export type LoanSortOption =
  | "name_asc"
  | "name_desc"
  | "balance_desc"
  | "balance_asc"
  | "rate_desc"
  | "newest"
  | "oldest";

const SORT_OPTIONS: { id: LoanSortOption; label: string; shortLabel: string }[] = [
  { id: "balance_desc", label: "Highest Balance", shortLabel: "Balance ↓" },
  { id: "balance_asc", label: "Lowest Balance (Snowball)", shortLabel: "Balance ↑" },
  { id: "name_asc", label: "Lender: A → Z", shortLabel: "Name A–Z" },
  { id: "name_desc", label: "Lender: Z → A", shortLabel: "Name Z–A" },
  { id: "rate_desc", label: "Highest Interest Rate", shortLabel: "Rate ↓" },
  { id: "newest", label: "Newest Added", shortLabel: "Newest" },
  { id: "oldest", label: "Oldest Added", shortLabel: "Oldest" },
];

interface LoansViewProps {
  loans: LoanWithStatus[];
  payments: Payment[];
  activeCurrency: "INR" | "USD";
  onCurrencyChange: (c: "INR" | "USD") => void;
  onOpenAddModal: () => void;
  onOpenPaymentModal: (loan: Loan) => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (loanId: string) => void;
  onTogglePin?: (loanId: string) => void;
  onDeletePayment?: (payment: Payment) => void;
  initialStatusTab?: "active" | "completed" | "all";
}

export function LoansView({
  loans,
  payments,
  activeCurrency,
  onCurrencyChange,
  onOpenAddModal,
  onOpenPaymentModal,
  onEditLoan,
  onDeleteLoan,
  onTogglePin,
  onDeletePayment,
  initialStatusTab,
}: LoansViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"active" | "completed" | "all">(initialStatusTab || "active");
  const [isAllCollapsed, setIsAllCollapsed] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<LoanSortOption>("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Load saved sort preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("clearowe_loans_sort") as LoanSortOption;
      if (saved && SORT_OPTIONS.some((o) => o.id === saved)) {
        setSortBy(saved);
      }
    } catch {}
  }, []);

  // Close sort menu on click outside
  useEffect(() => {
    if (!isSortOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSortOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSortOpen]);

  useEffect(() => {
    if (initialStatusTab) {
      setStatusTab(initialStatusTab);
    }
  }, [initialStatusTab]);

  // Filter by currency
  const currencyLoans = loans.filter((l) => (l.currency || "INR") === activeCurrency);

  const activeLoans = currencyLoans.filter((l) => Number(l.remaining_principal || 0) > 0);
  const completedLoans = currencyLoans.filter((l) => Number(l.remaining_principal || 0) <= 0);

  const totalBalance = activeLoans.reduce((sum, l) => sum + Number(l.remaining_principal || 0), 0);
  const totalMonthlyInterest = activeLoans.reduce((sum, l) => sum + Number(l.interest_due_this_month || 0), 0);

  // Determine current tab base loans
  const currentTabLoans =
    statusTab === "active"
      ? activeLoans
      : statusTab === "completed"
      ? completedLoans
      : currencyLoans;

  // Apply stable sorting: Pinned loans always remain first, then sorted by chosen strategy
  const sortedLoans = [...currentTabLoans].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) {
      return a.is_pinned ? -1 : 1;
    }

    switch (sortBy) {
      case "name_asc":
        return a.lender_name.localeCompare(b.lender_name, undefined, { sensitivity: "base" });
      case "name_desc":
        return b.lender_name.localeCompare(a.lender_name, undefined, { sensitivity: "base" });
      case "balance_desc":
        return Number(b.remaining_principal || 0) - Number(a.remaining_principal || 0);
      case "balance_asc":
        return Number(a.remaining_principal || 0) - Number(b.remaining_principal || 0);
      case "rate_desc": {
        const rateA = getEffectiveAnnualRate(a.remaining_principal, a.interest_type, a.interest_rate);
        const rateB = getEffectiveAnnualRate(b.remaining_principal, b.interest_type, b.interest_rate);
        return rateB - rateA;
      }
      case "oldest":
        return new Date(a.created_at || a.start_date || 0).getTime() - new Date(b.created_at || b.start_date || 0).getTime();
      case "newest":
      default:
        return new Date(b.created_at || b.start_date || 0).getTime() - new Date(a.created_at || a.start_date || 0).getTime();
    }
  });

  // Apply search filter to sorted loans
  const displayedLoans = sortedLoans.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.lender_name.toLowerCase().includes(q) ||
      (l.notes && l.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* ── Desktop Header ── */}
      <div
        className="desktop-only"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px", margin: 0 }}>
            All Loans &amp; Debts
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
            {activeLoans.length} active borrowings · Total {formatCurrency(totalBalance, activeCurrency)}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CurrencyToggle value={activeCurrency} onChange={onCurrencyChange} />
          <button
            onClick={onOpenAddModal}
            style={{
              height: 42,
              padding: "0 18px",
              borderRadius: 11,
              backgroundColor: "hsl(var(--primary))",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "inherit",
              boxShadow: "0 2px 8px hsl(var(--primary) / 0.25)",
            }}
          >
            <Plus size={16} /> Add Loan
          </button>
        </div>
      </div>

      {/* ── Mobile Hero Banner matching SimpleSpend ── */}
      <div className="mobile-only mobile-hero">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
                margin: "0 0 4px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Active Debt
            </p>
            <p
              style={{
                fontSize: "clamp(26px, 7vw, 34px)",
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.6px",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(totalBalance, activeCurrency)}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <CurrencyToggle value={activeCurrency} onChange={onCurrencyChange} variant="onColor" />
            <button
              onClick={onOpenAddModal}
              aria-label="Add loan"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(255,255,255,0.28)",
                border: "1.5px solid rgba(255,255,255,0.55)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <Plus size={18} color="#ffffff" />
            </button>
          </div>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0, fontWeight: 500 }}>
          {formatCurrency(totalMonthlyInterest, activeCurrency)}/mo interest · {activeLoans.length} active
        </p>
      </div>

      {/* ── Content Body wrapped for mobile spacing ── */}
      <div className="mobile-page-content">
        {/* ── Status Tabs (Active / Completed / All) ── */}
        <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f1f5f9",
            padding: 4,
            borderRadius: 12,
            gap: 4,
            border: "1px solid #e2e8f0",
            maxWidth: 400,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <button
            type="button"
            onClick={() => setStatusTab("active")}
            style={{
              flex: 1,
              padding: "7px 12px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              backgroundColor: statusTab === "active" ? "#ffffff" : "transparent",
              color: statusTab === "active" ? "#0f172a" : "#64748b",
              boxShadow: statusTab === "active" ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 150ms",
            }}
          >
            Active
            <span
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 100,
                backgroundColor: statusTab === "active" ? "hsl(var(--primary) / 0.12)" : "#e2e8f0",
                color: statusTab === "active" ? "hsl(var(--primary))" : "#64748b",
                fontWeight: 800,
              }}
            >
              {activeLoans.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab("completed")}
            style={{
              flex: 1,
              padding: "7px 12px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              backgroundColor: statusTab === "completed" ? "#ffffff" : "transparent",
              color: statusTab === "completed" ? "#16a34a" : "#64748b",
              boxShadow: statusTab === "completed" ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 150ms",
            }}
          >
            <CheckCircle2 size={13} color={statusTab === "completed" ? "#16a34a" : "#64748b"} />
            Completed
            <span
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 100,
                backgroundColor: statusTab === "completed" ? "#dcfce7" : "#e2e8f0",
                color: statusTab === "completed" ? "#16a34a" : "#64748b",
                fontWeight: 800,
              }}
            >
              {completedLoans.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusTab("all")}
            style={{
              flex: 1,
              padding: "7px 12px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              backgroundColor: statusTab === "all" ? "#ffffff" : "transparent",
              color: statusTab === "all" ? "#0f172a" : "#64748b",
              boxShadow: statusTab === "all" ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 150ms",
            }}
          >
            All
            <span
              style={{
                fontSize: 11,
                padding: "1px 7px",
                borderRadius: 100,
                backgroundColor: statusTab === "all" ? "#e2e8f0" : "#e2e8f0",
                color: statusTab === "all" ? "#0f172a" : "#64748b",
                fontWeight: 800,
              }}
            >
              {currencyLoans.length}
            </span>
          </button>
        </div>

        {statusTab === "completed" && completedLoans.length > 0 && (
          <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <CheckCircle2 size={13} /> {completedLoans.length} loan{completedLoans.length > 1 ? "s" : ""} paid in full
          </span>
        )}
      </div>

      {/* ── Search Bar & Custom Sort Dropdown ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", marginBottom: 16 }}>
        {/* Search input with clean magnifying glass icon & clear button */}
        <div style={{ position: "relative", flex: 1 }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search loans or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: 42,
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              paddingLeft: 38,
              paddingRight: searchQuery ? 34 : 14,
              fontSize: 13.5,
              color: "#0f172a",
              outline: "none",
              backgroundColor: "#ffffff",
              fontFamily: "inherit",
              boxSizing: "border-box",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 22,
                height: 22,
                borderRadius: 100,
                backgroundColor: "#f1f5f9",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Custom Sort UI Dropdown */}
        <div style={{ position: "relative" }} ref={sortRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            style={{
              height: 42,
              padding: "0 13px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              backgroundColor: isSortOpen ? "#f8fafc" : "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#0f172a",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              transition: "all 150ms",
            }}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
          >
            <ArrowUpDown size={14} color="#64748b" />
            <span className="desktop-only" style={{ color: "#64748b", fontWeight: 500 }}>Sort:</span>
            <span style={{ fontWeight: 700 }}>
              {SORT_OPTIONS.find((o) => o.id === sortBy)?.shortLabel || "Sort"}
            </span>
            <ChevronDown
              size={13}
              color="#94a3b8"
              style={{
                transform: isSortOpen ? "rotate(180deg)" : "none",
                transition: "transform 150ms",
              }}
            />
          </button>

          {/* Floating Custom Sort Menu */}
          {isSortOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: 215,
                backgroundColor: "#ffffff",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                boxShadow: "0 14px 34px -4px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.05)",
                padding: "6px",
                zIndex: 100,
                animation: "fadeIn 120ms ease forwards",
              }}
            >
              <div
                style={{
                  padding: "6px 10px 4px",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                }}
              >
                Sort Loans
              </div>

              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id);
                      setIsSortOpen(false);
                      try {
                        localStorage.setItem("clearowe_loans_sort", opt.id);
                      } catch {}
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 9,
                      border: "none",
                      backgroundColor: isSelected ? "hsl(var(--primary) / 0.08)" : "transparent",
                      color: isSelected ? "hsl(var(--primary))" : "#334155",
                      fontSize: 13,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      transition: "background 120ms",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check size={14} strokeWidth={2.5} color="hsl(var(--primary))" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── List Header: Count & Collapse All Toggle ── */}
      {displayedLoans.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
            {displayedLoans.length} {displayedLoans.length === 1 ? "loan" : "loans"}
          </span>

          <button
            type="button"
            onClick={() => setIsAllCollapsed(isAllCollapsed ? false : true)}
            style={{
              background: "transparent",
              border: "none",
              color: "hsl(var(--primary))",
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
              padding: "4px 8px",
              borderRadius: 8,
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "hsl(var(--primary) / 0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {isAllCollapsed ? (
              <>
                <ChevronDown size={14} /> Expand All
              </>
            ) : (
              <>
                <ChevronUp size={14} /> Collapse All
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Loan Cards List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {displayedLoans.length === 0 ? (
          <div
            className="glass-card"
            style={{
              width: "100%",
              margin: "0 0 24px",
              background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1.5px solid rgba(255,255,255,0.9)",
              borderRadius: 24,
              padding: "56px 32px",
              textAlign: "center",
              boxShadow: "0 20px 48px -12px rgba(80, 60, 180, 0.09), 0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            {statusTab === "active" && currencyLoans.length > 0 && activeLoans.length === 0 ? (
              // All loans paid in full celebratory card
              <>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 18,
                    background: "linear-gradient(135deg, rgba(22, 163, 74, 0.15), rgba(34, 197, 94, 0.25))",
                    border: "1.5px solid rgba(34, 197, 94, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    color: "#16a34a",
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.4px" }}>
                  All {activeCurrency} Loans Paid in Full
                </h3>
                <p style={{ fontSize: 14, color: "#475569", margin: "0 auto 24px", maxWidth: 460, lineHeight: 1.55 }}>
                  Congratulations! You currently have zero active debt. All your {completedLoans.length} loan{completedLoans.length > 1 ? "s" : ""} have been 100% paid off.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setStatusTab("completed")}
                    style={{
                      height: 44,
                      padding: "0 20px",
                      borderRadius: 12,
                      backgroundColor: "#16a34a",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13.5,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    <CheckCircle2 size={16} /> View Completed Loans ({completedLoans.length})
                  </button>
                  <button
                    onClick={onOpenAddModal}
                    style={{
                      height: 44,
                      padding: "0 20px",
                      borderRadius: 12,
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      fontWeight: 700,
                      fontSize: 13.5,
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Plus size={16} /> Add New Loan
                  </button>
                </div>
              </>
            ) : statusTab === "completed" && completedLoans.length === 0 ? (
              // No completed loans yet
              <>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 18,
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary2) / 0.15))",
                    border: "1.5px solid hsl(var(--primary) / 0.20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    color: "hsl(var(--primary))",
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.4px" }}>
                  No Completed Loans Yet
                </h3>
                <p style={{ fontSize: 14, color: "#475569", margin: "0 auto 24px", maxWidth: 460, lineHeight: 1.55 }}>
                  When you finish paying off a loan in full, it will move here so your active borrowings list stays focused and clean.
                </p>
                <button
                  onClick={() => setStatusTab("active")}
                  style={{
                    height: 44,
                    padding: "0 24px",
                    borderRadius: 12,
                    backgroundColor: "hsl(var(--primary))",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13.5,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    boxShadow: "0 4px 14px hsl(var(--primary) / 0.25)",
                  }}
                >
                  View Active Loans ({activeLoans.length})
                </button>
              </>
            ) : (
              // Standard search empty state or no loans created yet
              <>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 18,
                    background: "linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--primary2) / 0.15))",
                    border: "1.5px solid hsl(var(--primary) / 0.20)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                    color: "hsl(var(--primary))",
                  }}
                >
                  <Building2 size={28} />
                </div>
                <h3 style={{ fontWeight: 800, color: "#0f172a", fontSize: 21, margin: "0 0 8px", letterSpacing: "-0.4px" }}>
                  {searchQuery ? "No matching loans found" : `No ${activeCurrency} loans yet`}
                </h3>
                <p style={{ fontSize: 14, color: "#475569", margin: "0 auto 24px", maxWidth: 460, lineHeight: 1.55 }}>
                  {searchQuery
                    ? "Try searching with a different lender name or note keyword."
                    : `Add your first ${activeCurrency} loan to start tracking balances and monthly interest.`}
                </p>
                {!searchQuery && (
                  <button
                    onClick={onOpenAddModal}
                    style={{
                      height: 44,
                      padding: "0 24px",
                      borderRadius: 12,
                      backgroundColor: "hsl(var(--primary))",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13.5,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      boxShadow: "0 4px 14px hsl(var(--primary) / 0.25)",
                    }}
                  >
                    <Plus size={16} /> Add First {activeCurrency} Loan
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          displayedLoans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              payments={payments}
              onOpenPaymentModal={onOpenPaymentModal}
              onEditLoan={onEditLoan}
              onDeleteLoan={onDeleteLoan}
              onTogglePin={onTogglePin}
              onDeletePayment={onDeletePayment}
              isCollapsedControlled={isAllCollapsed}
            />
          ))
        )}
        </div>
      </div>
    </div>
  );
}
