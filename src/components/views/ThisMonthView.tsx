'use client';

import { useState, useMemo } from "react";
import type { Loan, LoanWithStatus, Payment } from "@/types";
import { formatCurrency, type Currency } from "@/lib/currency";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { computeLoansWithStatus } from "@/lib/calculations";
import { useSelectedMonth } from "@/contexts/SelectedMonthContext";
import {
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface ThisMonthViewProps {
  loans: Loan[];
  payments: Payment[];
  activeCurrency: "INR" | "USD";
  onCurrencyChange: (c: "INR" | "USD") => void;
  onOpenPaymentModal: (loan: Loan) => void;
}

export function ThisMonthView({
  loans,
  payments,
  activeCurrency,
  onCurrencyChange,
  onOpenPaymentModal,
}: ThisMonthViewProps) {
  const [filterMode, setFilterMode] = useState<"all" | "unpaid" | "paid">("all");

  const {
    selYear,
    selMonth,
    isCurrentMonth,
    viewDate,
    monthName,
    monthShort,
  } = useSelectedMonth();

  // Recompute dues, overdue, and status for the chosen global month
  const monthlyLoans: LoanWithStatus[] = useMemo(() => {
    return computeLoansWithStatus(loans, payments, viewDate);
  }, [loans, payments, viewDate]);

  const currencyLoans = monthlyLoans.filter(
    (l) => (l.currency || "INR") === activeCurrency && Number(l.remaining_principal || 0) > 0
  );

  const totalDueThisMonth = currencyLoans.reduce((sum, l) => sum + Number(l.interest_due_this_month || 0), 0);
  const totalOverdue = currencyLoans.reduce((sum, l) => sum + Number(l.overdue_interest || 0), 0);
  const totalObligations = totalDueThisMonth + totalOverdue;

  // Payments recorded in this specific month
  const thisMonthPayments = payments.filter((p) => {
    const d = new Date(p.payment_date);
    return d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const totalPaidThisMonth = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filteredLoans = currencyLoans.filter((l) => {
    if (filterMode === "unpaid") return l.status !== "paid";
    if (filterMode === "paid") return l.status === "paid";
    return true;
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.4px", margin: 0 }}>
              Monthly Dues
            </h1>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: isCurrentMonth ? "#0f172a" : "hsl(var(--primary))",
                backgroundColor: isCurrentMonth ? "#f1f5f9" : "hsl(var(--primary) / 0.10)",
                padding: "3px 10px",
                borderRadius: 100,
                letterSpacing: "-0.1px",
              }}
            >
              {monthName}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "2px 0 0" }}>
            Monthly interest dues and repayments for {monthName}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <CurrencyToggle value={activeCurrency} onChange={onCurrencyChange} />
        </div>
      </div>

      {/* ── Mobile Hero Banner matching SimpleSpend ── */}
      <div className="mobile-only mobile-hero">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                opacity: 0.9,
              }}
            >
              {monthName} Dues
            </span>
            <p
              style={{
                fontSize: "clamp(26px, 7vw, 34px)",
                fontWeight: 800,
                color: "#ffffff",
                margin: "4px 0 0",
                letterSpacing: "-0.6px",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(totalObligations, activeCurrency)}
            </p>
          </div>

          <CurrencyToggle value={activeCurrency} onChange={onCurrencyChange} variant="onColor" />
        </div>

        <div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0, fontWeight: 500 }}>
            {totalOverdue > 0 ? (
              <>
                Includes <strong style={{ color: "#fecaca" }}>{formatCurrency(totalOverdue, activeCurrency)}</strong> overdue
              </>
            ) : (
              "All overdue cleared ✓"
            )}
          </p>
        </div>
      </div>

      {/* ── Content Body wrapped for mobile spacing ── */}
      <div className="mobile-page-content">
        {/* ── Summary Metrics ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 4px" }}>
            Interest Due ({monthShort})
          </p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(totalDueThisMonth, activeCurrency)}
          </p>
        </div>

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 4px" }}>
            Overdue Carry Forward
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: totalOverdue > 0 ? "#dc2626" : "#16a34a",
              margin: 0,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatCurrency(totalOverdue, activeCurrency)}
          </p>
        </div>

        <div className="glass-card" style={{ padding: "16px 18px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 4px" }}>
            Paid in {monthShort}
          </p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#16a34a", margin: 0, fontVariantNumeric: "tabular-nums" }}>
            {formatCurrency(totalPaidThisMonth, activeCurrency)}
          </p>
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "unpaid", "paid"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: filterMode === mode ? "1.5px solid hsl(var(--primary))" : "1px solid #e2e8f0",
              backgroundColor: filterMode === mode ? "hsl(var(--primary) / 0.10)" : "#ffffff",
              color: filterMode === mode ? "hsl(var(--primary))" : "#64748b",
              fontWeight: filterMode === mode ? 700 : 500,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {mode === "all" ? `All (${currencyLoans.length})` : mode}
          </button>
        ))}
      </div>

      {/* ── Loans List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredLoans.length === 0 ? (
          <div
            className="glass-card"
            style={{
              textAlign: "center",
              padding: "48px 24px",
              borderRadius: 20,
            }}
          >
            <CheckCircle2 size={32} color="#16a34a" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
              {filterMode === "unpaid" ? `All Loans Paid for ${monthName}!` : "No Loans Found"}
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              {filterMode === "unpaid"
                ? `You have settled all interest dues for ${monthName}.`
                : `No ${activeCurrency} loans match the selected filter.`}
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const currency = (loan.currency || "INR") as Currency;
            const dueDay = loan.interest_due_day || 1;
            const monthlyDue = loan.interest_due_this_month || 0;
            const overdueDue = loan.overdue_interest || 0;
            const totalDue = monthlyDue + overdueDue;
            const isPaid = loan.status === "paid";
            const isOverdue = loan.status === "overdue";

            return (
              <div
                key={loan.id}
                className="glass-card"
                style={{
                  padding: "20px 22px",
                  borderRadius: 18,
                  borderLeft: isOverdue ? "4px solid #ef4444" : isPaid ? "4px solid #22c55e" : "4px solid #e8eef4",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>{loan.lender_name}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          backgroundColor:
                            loan.currency === "INR" ? "hsl(var(--primary) / 0.08)" : "hsl(var(--primary2) / 0.10)",
                          color: loan.currency === "INR" ? "hsl(var(--primary))" : "hsl(var(--primary2))",
                          padding: "2px 8px",
                          borderRadius: 100,
                        }}
                      >
                        {loan.currency}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                      Due on day {dueDay} of every month · Principal: {formatCurrency(loan.remaining_principal || 0, currency)}
                    </p>
                  </div>

                  {isPaid ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "#f0fdf4",
                        color: "#16a34a",
                        padding: "3px 10px",
                        borderRadius: 100,
                        border: "1px solid #bbf7d0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <CheckCircle2 size={12} /> Paid
                    </span>
                  ) : isOverdue ? (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "#fef2f2",
                        color: "#dc2626",
                        padding: "3px 10px",
                        borderRadius: 100,
                        border: "1px solid #fecaca",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <AlertTriangle size={12} /> Overdue
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "#fffbeb",
                        color: "#d97706",
                        padding: "3px 10px",
                        borderRadius: 100,
                        border: "1px solid #fef3c7",
                      }}
                    >
                      Due Soon
                    </span>
                  )}
                </div>

                {/* Dues Details */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    margin: "12px 0 16px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 2px", fontWeight: 600 }}>Amount Due</p>
                    <p
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: isOverdue ? "#dc2626" : "#0f172a",
                        margin: 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatCurrency(totalDue, currency)}
                    </p>
                    {overdueDue > 0 && (
                      <p style={{ fontSize: 11, color: "#dc2626", margin: "2px 0 0", fontWeight: 600 }}>
                        Includes {formatCurrency(overdueDue, currency)} overdue interest
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenPaymentModal(loan)}
                    style={{
                      height: 42,
                      padding: "0 18px",
                      borderRadius: 10,
                      backgroundColor: isPaid ? "#f8fafc" : "hsl(var(--primary))",
                      color: isPaid ? "#64748b" : "#ffffff",
                      border: isPaid ? "1px solid #e2e8f0" : "none",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "inherit",
                      boxShadow: isPaid ? "none" : "0 2px 8px hsl(var(--primary) / 0.25)",
                    }}
                  >
                    <ArrowDownLeft size={14} /> {isPaid ? "Pay Again" : "Mark as Paid"}
                  </button>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
