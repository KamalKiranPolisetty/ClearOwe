'use client';

import { useState } from "react";
import type { Loan, LoanWithStatus, Payment } from "@/types";
import { formatCurrency, type Currency } from "@/lib/currency";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { Charts } from "@/components/Charts";
import { useSelectedMonth } from "@/contexts/SelectedMonthContext";
import { exportToCSV } from "@/lib/export";
import { Modal } from "@/components/Modal";
import {
  Plus,
  Download,
  ArrowDownLeft,
  CheckCircle2,
  Building2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  X,
  CreditCard,
} from "lucide-react";

interface HomeViewProps {
  loans: LoanWithStatus[];
  payments: Payment[];
  activeCurrency: "INR" | "USD";
  onCurrencyChange: (c: "INR" | "USD") => void;
  exchangeRate?: number;
  greeting?: string;
  displayName?: string;
  onOpenAddModal: () => void;
  onOpenPaymentModal: (loan: Loan) => void;
  onEditLoan?: (loan: Loan) => void;
  onDeleteLoan?: (loanId: string) => void;
  onGoToLoans: () => void;
}

export function HomeView({
  loans,
  payments,
  activeCurrency,
  onCurrencyChange,
  greeting,
  displayName,
  onOpenAddModal,
  onOpenPaymentModal,
  onGoToLoans,
}: HomeViewProps) {
  const {
    isCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToCurrentMonth,
    monthName,
    monthShort,
  } = useSelectedMonth();

  const [insightDismissed, setInsightDismissed] = useState(false);
  const [obligationsOpen, setObligationsOpen] = useState(false);

  // Filter loans by active currency
  const currencyLoans = loans.filter((l) => (l.currency || "INR") === activeCurrency);
  const activeLoans = currencyLoans.filter((l) => Number(l.remaining_principal || 0) > 0);
  const completedLoans = currencyLoans.filter((l) => Number(l.remaining_principal || 0) <= 0);
  const totalPrincipal = currencyLoans.reduce((sum, l) => sum + Number(l.remaining_principal || 0), 0);
  const totalOriginal = currencyLoans.reduce((sum, l) => sum + Number(l.original_amount || 0), 0);
  const totalDueThisMonth = currencyLoans.reduce((sum, l) => sum + Number(l.interest_due_this_month || 0), 0);
  const totalOverdue = currencyLoans.reduce((sum, l) => sum + Number(l.overdue_interest || 0), 0);

  // Total principal paid
  const totalPrincipalPaid = currencyLoans.reduce(
    (sum, l) => sum + Number(l.total_principal_paid !== undefined && l.total_principal_paid > 0 ? l.total_principal_paid : Math.max(0, l.original_amount - l.remaining_principal)),
    0
  );
  const pctRepaid = totalOriginal > 0 ? (totalPrincipalPaid / totalOriginal) * 100 : 0;

  // Due or overdue (only loans that have actual outstanding dues this month)
  const urgentLoans = currencyLoans.filter(
    (l) =>
      (l.status === "overdue" || l.status === "unpaid" || l.status === "partially_paid") &&
      Number(l.remaining_principal || 0) > 0 &&
      (Number(l.overdue_interest || 0) > 0 || Number(l.interest_due_this_month || 0) > 0)
  );

  return (
    <div>
      {/* ── Desktop Header ── */}
      <div
        className="desktop-only"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <p style={{ fontSize: 16, color: "#475569", margin: "0 0 5px", fontWeight: 500 }}>
            {greeting || "Good morning"}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.6px", margin: 0 }}>
            {displayName || "User"}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CurrencyToggle value={activeCurrency} onChange={onCurrencyChange} />
          <button
            onClick={() => exportToCSV(currencyLoans, payments)}
            style={{
              height: 42,
              padding: "0 16px",
              borderRadius: 11,
              border: "1.5px solid hsl(var(--primary) / 0.20)",
              backgroundColor: "hsl(var(--primary) / 0.06)",
              color: "hsl(var(--primary))",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 150ms",
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
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

      {/* ── Desktop Month Navigator matching SimpleSpend ── */}
      <div
        className="desktop-only"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <button
          onClick={goToPrevMonth}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms",
          }}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} color="#374151" />
        </button>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: isCurrentMonth ? "#0f172a" : "hsl(var(--primary))",
            minWidth: 140,
            textAlign: "center",
            letterSpacing: "-0.2px",
          }}
        >
          {monthName}
        </span>
        <button
          onClick={goToNextMonth}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 150ms",
          }}
          aria-label="Next month"
        >
          <ChevronRight size={16} color="#374151" />
        </button>
        {!isCurrentMonth && (
          <button
            onClick={goToCurrentMonth}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 12px",
              borderRadius: 100,
              backgroundColor: "hsl(var(--primary) / 0.10)",
              color: "hsl(var(--primary))",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <RotateCcw size={12} /> Current Month
          </button>
        )}
      </div>

      {/* ── Mobile Hero Banner matching SimpleSpend ── */}
      <div className="mobile-only mobile-hero">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 18 }}>
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.75)",
                margin: "0 0 2px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {greeting || "GOOD AFTERNOON"}
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.15 }}>
              {(displayName?.replace(/^Hello,?\s*/i, "").split(" ")[0] || "User").trim()}
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <CurrencyToggle value={activeCurrency} onChange={onCurrencyChange} variant="onColor" />
            <button
              onClick={onOpenAddModal}
              aria-label="Add loan"
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "rgba(255,255,255,0.18)",
                border: "1.5px solid rgba(255,255,255,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Plus size={18} color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Center Total Borrowed display */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "rgba(255,255,255,0.60)",
              margin: "0 0 6px",
              textTransform: "uppercase",
              letterSpacing: "1.4px",
            }}
          >
            Total Borrowed
          </p>
          <div
            style={{
              fontSize: "clamp(32px, 9vw, 44px)",
              fontWeight: 900,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-1.8px",
              lineHeight: 1.05,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            }}
          >
            {formatCurrency(totalPrincipal, activeCurrency)}
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", margin: "6px 0 0", fontWeight: 500 }}>
            {activeLoans.length > 0
              ? `${activeLoans.length} active loan${activeLoans.length !== 1 ? 's' : ''} obligation`
              : "All loans in good standing"}
          </p>
        </div>

        {/* Sleek integrated month pill matching SimpleSpend */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1.5px solid rgba(255,255,255,0.28)",
              borderRadius: 100,
              padding: "2px 6px",
            }}
          >
            <button
              onClick={goToPrevMonth}
              aria-label="Previous month"
              style={{
                width: 28,
                height: 28,
                borderRadius: 100,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={15} color="#fff" />
            </button>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#fff",
                padding: "0 8px",
                minWidth: 112,
                textAlign: "center",
                letterSpacing: "-0.2px",
              }}
            >
              {monthName}
            </span>
            <button
              onClick={goToNextMonth}
              aria-label="Next month"
              style={{
                width: 28,
                height: 28,
                borderRadius: 100,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronRight size={15} color="#fff" />
            </button>
          </div>
          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              style={{
                padding: "4px 12px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.22)",
                border: "1.5px solid rgba(255,255,255,0.32)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* ── Content Grid wrapped for mobile spacing ── */}
      <div className="mobile-page-content">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Mobile: 2x2 Unified Metrics Quadrants matching SimpleSpend */}
        <div
          className="mobile-only"
          style={{
            background: "#fff",
            borderRadius: 20,
            marginBottom: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9",
            overflow: "hidden",
          }}
        >
          {/* Row 1: Principal Owed | Interest Due */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ padding: "16px 18px", borderRight: "1px solid #f1f5f9", minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px" }}>
                Principal Owed
              </p>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formatCurrency(totalPrincipal, activeCurrency)}
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                {activeLoans.length} active loan{activeLoans.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div
              onClick={() => setObligationsOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="View obligations breakdown"
              style={{
                padding: "16px 18px",
                minWidth: 0,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
                transition: "background 150ms",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 6px" }}>
                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", margin: 0 }}>
                  Interest Due
                </p>
                <ChevronRight size={13} color="#94a3b8" />
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#8b5cf6", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formatCurrency(totalDueThisMonth, activeCurrency)}
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                {monthShort} obligation
              </p>
            </div>
          </div>

          {/* Row 2: Overdue Interest | Principal Repaid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ padding: "15px 18px 16px", borderRight: "1px solid #f1f5f9", minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px" }}>
                Overdue Interest
              </p>
              <div style={{ fontSize: 19, fontWeight: 800, color: totalOverdue > 0 ? "#dc2626" : "#10b981", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {formatCurrency(totalOverdue, activeCurrency)}
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                {totalOverdue > 0 ? "Past unpaid dues" : "Zero overdue dues"}
              </p>
            </div>

            <div style={{ padding: "15px 18px 16px", minWidth: 0 }}>
              <p style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px" }}>
                Principal Repaid
              </p>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#06b6d4", letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {Math.round(pctRepaid)}%
              </div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>
                {formatCurrency(totalPrincipalPaid, activeCurrency)} repaid
              </p>
            </div>
          </div>
        </div>

        {/* Mobile: AI Insight Card matching SimpleSpend */}
        {!insightDismissed && (
          <div
            className="mobile-only"
            style={{
              background: "#ffffff",
              borderRadius: 18,
              padding: "14px 16px",
              marginBottom: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: "hsl(var(--primary) / 0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={13} color="hsl(var(--primary))" />
            </div>
            <p style={{ fontSize: 13, color: "#374151", margin: 0, fontWeight: 500, flex: 1, lineHeight: 1.55 }}>
              {totalOverdue === 0
                ? `All monthly obligations are on track for ${monthShort}.`
                : `${formatCurrency(totalOverdue, activeCurrency)} overdue dues require attention.`}
            </p>
            <button
              onClick={() => setInsightDismissed(true)}
              aria-label="Dismiss insight"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: 4,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} color="#94a3b8" />
            </button>
          </div>
        )}

        {/* Desktop: 4 Separate Metric Cards */}
        <div className="desktop-only" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {/* Metric 1: Total Principal */}
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 6px" }}>
              Total Principal Owed
            </p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(totalPrincipal, activeCurrency)}
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              Across {activeLoans.length} active loans
            </p>
          </div>

          {/* Metric 2: Interest Due This Month */}
          <div
            className="glass-card"
            onClick={() => setObligationsOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="View obligations breakdown"
            style={{
              padding: "18px 20px",
              cursor: "pointer",
              transition: "transform 150ms, box-shadow 150ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 6px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: 0 }}>
                Interest Due ({monthShort})
              </p>
              <ChevronRight size={14} color="#94a3b8" />
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#8b5cf6", margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {formatCurrency(totalDueThisMonth, activeCurrency)}
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              Click for monthly breakdown
            </p>
          </div>

          {/* Metric 3: Total Overdue */}
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 6px" }}>
              Total Overdue Interest
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: totalOverdue > 0 ? "#dc2626" : "#10b981",
                margin: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatCurrency(totalOverdue, activeCurrency)}
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              {totalOverdue > 0 ? "Past unpaid interest" : "Zero overdue dues"}
            </p>
          </div>

          {/* Metric 4: Principal Repaid */}
          <div className="glass-card" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 6px" }}>
              Principal Repaid
            </p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#16a34a", margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(pctRepaid)}%
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
              {formatCurrency(totalPrincipalPaid, activeCurrency)} paid back
            </p>
          </div>
        </div>

        {/* When no loans exist in activeCurrency, render SimpleSpend empty state card */}
        {currencyLoans.length === 0 ? (
          <div
            className="glass-card"
            style={{
              width: "100%",
              margin: "10px 0 24px",
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
              No {activeCurrency} loans yet
            </h3>
            <p style={{ fontSize: 14, color: "#475569", margin: "0 auto 24px", maxWidth: 460, lineHeight: 1.55 }}>
              Add your first loan to start tracking balances, monthly interest obligations, and payoff schedules.
            </p>
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
          </div>
        ) : (
          <>
            {/* Portfolio Repayment Progress */}
            <div className="glass-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Portfolio Repayment Progress</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{Math.round(pctRepaid)}%</span>
              </div>
              <div style={{ width: "100%", height: 8, backgroundColor: "#f1f5f9", borderRadius: 100, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pctRepaid}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary2)) 100%)",
                    borderRadius: 100,
                    transition: "width 400ms ease",
                  }}
                />
              </div>
              <p style={{ fontSize: 11, color: "#64748b", margin: "8px 0 0" }}>
                {formatCurrency(totalPrincipalPaid, activeCurrency)} repaid out of {formatCurrency(totalOriginal, activeCurrency)} original
              </p>
            </div>

            {/* Immediate Action Needed */}
            {urgentLoans.length > 0 && (
              <div className="glass-card" style={{ padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={16} color="#d97706" />
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>
                      Action Needed in {monthShort} ({urgentLoans.length})
                    </span>
                  </div>
                  <button
                    onClick={onGoToLoans}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "hsl(var(--primary))",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "inherit",
                    }}
                  >
                    View in Loans <ArrowRight size={13} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {urgentLoans.slice(0, 3).map((loan) => (
                    <div
                      key={loan.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: 12,
                        backgroundColor: loan.status === "overdue" ? "#fef2f2" : "#fffbeb",
                        border: loan.status === "overdue" ? "1px solid #fecaca" : "1px solid #fef3c7",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{loan.lender_name}</span>
                        <p style={{ fontSize: 12, color: loan.status === "overdue" ? "#dc2626" : "#d97706", margin: "2px 0 0", fontWeight: 600 }}>
                          {loan.status === "overdue"
                            ? `Overdue: ${formatCurrency(loan.overdue_interest || 0, (loan.currency || "INR") as Currency)}`
                            : `Due soon: ${formatCurrency(loan.interest_due_this_month || 0, (loan.currency || "INR") as Currency)}`}
                        </p>
                      </div>
                      <button
                        onClick={() => onOpenPaymentModal(loan)}
                        style={{
                          height: 34,
                          padding: "0 14px",
                          borderRadius: 8,
                          backgroundColor: "hsl(var(--primary))",
                          color: "#ffffff",
                          border: "none",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "inherit",
                        }}
                      >
                        <ArrowDownLeft size={13} /> Pay Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts */}
            <Charts loans={loans} payments={payments} currency={activeCurrency} />

            {/* ── Active Loans Summary Card ── */}
            <div
              className="glass-card"
              style={{
                marginTop: 20,
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                  Loans Portfolio
                </span>
                <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0" }}>
                  {activeLoans.length} active borrowings · {completedLoans.length} completed
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={onOpenAddModal}
                  style={{
                    height: 38,
                    padding: "0 14px",
                    borderRadius: 10,
                    border: "1.5px solid hsl(var(--primary) / 0.25)",
                    background: "hsl(var(--primary) / 0.06)",
                    color: "hsl(var(--primary))",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "inherit",
                  }}
                >
                  <Plus size={14} /> Add Loan
                </button>
                <button
                  onClick={onGoToLoans}
                  style={{
                    height: 38,
                    padding: "0 18px",
                    borderRadius: 10,
                    backgroundColor: "hsl(var(--primary))",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "inherit",
                    boxShadow: "0 2px 8px hsl(var(--primary) / 0.20)",
                  }}
                >
                  View All Loans <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>

      {/* ── Obligations Breakdown Modal matching SimpleSpend ── */}
      <Modal open={obligationsOpen} onClose={() => setObligationsOpen(false)} title="Obligations Breakdown" maxWidth={440}>
        <div style={{ padding: "4px 0 8px" }}>
          {/* Total Commitment Summary Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Total Monthly Obligation
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(totalDueThisMonth, activeCurrency)}
              </div>
              {totalOverdue > 0 && (
                <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, marginTop: 4 }}>
                  + {formatCurrency(totalOverdue, activeCurrency)} overdue past dues
                </div>
              )}
            </div>
            <div
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                background: "hsl(var(--primary) / 0.10)",
                color: "hsl(var(--primary))",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {activeLoans.length} {activeLoans.length === 1 ? "Loan" : "Loans"}
            </div>
          </div>

          {/* Loan Items List */}
          {activeLoans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 16px", color: "#64748b", fontSize: 14 }}>
              No active loan obligations for {monthName}.
            </div>
          ) : (
            <div>
              {/* Section Header */}
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "#1e293b",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CreditCard size={13} color="#1e293b" />
                  <span>Loans · {monthShort}</span>
                </div>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalDueThisMonth, activeCurrency)}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeLoans.map((l) => {
                  const dueDay = Number(l.interest_due_day);
                  const dueSuffix = dueDay === 1 ? "st" : dueDay === 2 ? "nd" : dueDay === 3 ? "rd" : "th";
                  const isPaid = l.status === "paid";
                  const hasOverdue = Number(l.overdue_interest || 0) > 0;
                  const isPartiallyPaid = l.status === "partially_paid";

                  return (
                    <div
                      key={l.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: 12,
                        padding: "12px 14px",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {l.lender_name}
                        </div>
                        <div style={{ fontSize: 12, marginTop: 2 }}>
                          {isPaid ? (
                            <span style={{ color: "#16a34a", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                              Paid ✓
                            </span>
                          ) : isPartiallyPaid ? (
                            <span style={{ color: "#0284c7", fontWeight: 600 }}>
                              Partially paid · Due {dueDay}{dueSuffix}
                            </span>
                          ) : hasOverdue ? (
                            <span style={{ color: "#dc2626", fontWeight: 600 }}>
                              Overdue ({formatCurrency(l.overdue_interest || 0, activeCurrency)}) · Due {dueDay}{dueSuffix}
                            </span>
                          ) : (
                            <span style={{ color: "#64748b" }}>Due {dueDay}{dueSuffix}</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                            {formatCurrency(l.interest_due_this_month || 0, activeCurrency)}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            monthly interest
                          </div>
                        </div>

                        {!isPaid ? (
                          <button
                            type="button"
                            onClick={() => {
                              setObligationsOpen(false);
                              onOpenPaymentModal(l);
                            }}
                            style={{
                              height: 32,
                              padding: "0 12px",
                              borderRadius: 8,
                              backgroundColor: "hsl(var(--primary))",
                              color: "#ffffff",
                              border: "none",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontFamily: "inherit",
                              flexShrink: 0,
                            }}
                          >
                            <ArrowDownLeft size={12} /> Pay
                          </button>
                        ) : (
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 100,
                              background: "rgba(22, 163, 74, 0.10)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <CheckCircle2 size={16} color="#16a34a" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick link to Loans */}
          <div style={{ marginTop: 18, borderTop: "1px solid #f1f5f9", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Manage all borrowings?</span>
            <button
              type="button"
              onClick={() => {
                setObligationsOpen(false);
                onGoToLoans();
              }}
              style={{
                background: "none",
                border: "none",
                color: "hsl(var(--primary))",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                padding: "4px 8px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "inherit",
              }}
            >
              View Loans Page <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
