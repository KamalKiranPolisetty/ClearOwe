'use client';

import { useState, useEffect } from "react";
import type { Loan, LoanWithStatus, Payment } from "@/types";
import { formatCurrency, type Currency } from "@/lib/currency";
import { monthsToPayoff, totalInterestRemaining } from "@/lib/calculations";
import {
  Pencil,
  Trash2,
  ArrowDownLeft,
  History,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface LoanCardProps {
  loan: LoanWithStatus;
  payments: Payment[];
  onOpenPaymentModal: (loan: Loan) => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (loanId: string) => void;
  onTogglePin?: (loanId: string) => void;
  onDeletePayment?: (payment: Payment) => void;
  isCollapsedControlled?: boolean;
}

export function LoanCard({
  loan,
  payments,
  onOpenPaymentModal,
  onEditLoan,
  onDeleteLoan,
  onDeletePayment,
  isCollapsedControlled,
}: LoanCardProps) {
  const balance = Number(loan.remaining_principal || 0);
  const original = Number(loan.original_amount || 0);
  const currency = (loan.currency || "INR") as Currency;
  const isPaidOff = balance <= 0;

  // Collapsed by default for paid-off loans; active loans start expanded or follow control
  const [isCardCollapsed, setIsCardCollapsed] = useState(isPaidOff);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (isCollapsedControlled !== undefined) {
      setIsCardCollapsed(isCollapsedControlled);
    }
  }, [isCollapsedControlled]);

  const principalPaidTotal =
    loan.total_principal_paid !== undefined && loan.total_principal_paid > 0
      ? loan.total_principal_paid
      : Math.max(0, original - balance);

  const pctRepaid =
    original > 0 ? Math.max(0, Math.min(100, (principalPaidTotal / original) * 100)) : isPaidOff ? 100 : 0;

  const dueDay = loan.interest_due_day || 1;
  const dueSuffix =
    dueDay === 1 || dueDay === 21 || dueDay === 31
      ? "st"
      : dueDay === 2 || dueDay === 22
      ? "nd"
      : dueDay === 3 || dueDay === 23
      ? "rd"
      : "th";

  // Rate display
  let rateLabel = "0%";
  if (loan.interest_type === "percentage_monthly") {
    rateLabel = `${loan.interest_rate}%/mo`;
  } else if (loan.interest_type === "percentage_yearly") {
    rateLabel = `${loan.interest_rate}% p.a.`;
  } else if (loan.interest_type === "fixed_monthly") {
    rateLabel = `${formatCurrency(loan.interest_rate, currency)}/mo`;
  } else {
    rateLabel = "No interest";
  }

  // Monthly obligation
  const monthlyInterest = loan.interest_due_this_month || 0;
  const overdueInterest = loan.overdue_interest || 0;

  // Payoff calculations
  const now = new Date();
  const monthsRemaining = monthsToPayoff(balance, loan.interest_rate, loan.interest_type);
  const approxInterestLeft = totalInterestRemaining(balance, loan.interest_rate, loan.interest_type, 12);
  const payoffDate = new Date(now.getFullYear(), now.getMonth() + (monthsRemaining || 12), 1).toLocaleDateString(
    "en-US",
    { month: "short", year: "numeric" }
  );

  const loanPayments = payments.filter((p) => p.loan_id === loan.id);
  const hasInterest = loan.interest_type !== "no_interest" && Number(loan.interest_rate || 0) > 0;

  return (
    <div
      className="glass-card loan-card"
      style={{
        overflow: "hidden",
        padding: 0,
        transition: "all 150ms ease",
      }}
    >
      <div
        className="loan-card-content"
        style={{
          padding: isCardCollapsed ? "16px 20px" : "20px 22px",
        }}
      >
        {/* ── Card Header: Clickable to expand/collapse ── */}
        <div
          onClick={() => setIsCardCollapsed(!isCardCollapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            userSelect: "none",
            gap: 12,
            marginBottom: isCardCollapsed ? 0 : 16,
          }}
        >
          {/* Left: Lender Name + Currency + Status Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flexWrap: "wrap" }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: 17.5,
                color: "#0f172a",
                letterSpacing: "-0.3px",
                whiteSpace: "nowrap",
              }}
            >
              {loan.lender_name}
            </span>

            {/* Currency badge */}
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                backgroundColor: "hsl(var(--primary2) / 0.08)",
                color: "hsl(var(--primary2))",
                padding: "2px 8px",
                borderRadius: 100,
                border: "1.5px solid hsl(var(--primary2) / 0.25)",
                letterSpacing: "0.3px",
              }}
            >
              {currency}
            </span>

            {/* Status badges */}
            {isPaidOff && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: "#f0fdf4",
                  color: "#16a34a",
                  padding: "2px 8px",
                  borderRadius: 100,
                  border: "1px solid #bbf7d0",
                }}
              >
                Paid Off
              </span>
            )}

            {!isPaidOff && loan.status === "overdue" && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  padding: "2px 8px",
                  borderRadius: 100,
                  border: "1px solid #fecaca",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <AlertTriangle size={10} /> Overdue
              </span>
            )}
          </div>

          {/* Right Header Area */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {/* If Collapsed: Show compact remaining balance & quick Pay button */}
            {isCardCollapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: isPaidOff ? "#059669" : "#0f172a",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCurrency(balance, currency)}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: "#94a3b8", marginLeft: 4 }}>
                    remaining
                  </span>
                </div>

                {!isPaidOff && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPaymentModal(loan);
                    }}
                    style={{
                      height: 32,
                      padding: "0 12px",
                      borderRadius: 9,
                      backgroundColor: "hsl(var(--primary))",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 12,
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontFamily: "inherit",
                      boxShadow: "0 2px 6px hsl(var(--primary) / 0.2)",
                    }}
                  >
                    <ArrowDownLeft size={13} /> Pay
                  </button>
                )}
              </div>
            )}

            {/* When Expanded: Show Edit and Delete buttons */}
            {!isCardCollapsed && (
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLoan(loan);
                  }}
                  aria-label="Edit loan"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#94a3b8",
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.color = "#475569";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLoan(loan.id);
                  }}
                  aria-label="Delete loan"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#cbd5e1",
                    transition: "all 150ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#cbd5e1";
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Collapse / Expand Chevron Icon Button */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: isCardCollapsed ? "#f1f5f9" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                transition: "all 150ms",
              }}
            >
              {isCardCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
          </div>
        </div>

        {/* ── Expanded Content (Hidden when Collapsed) ── */}
        {!isCardCollapsed && (
          <div style={{ animation: "fadeIn 150ms ease" }}>
            {/* Large balance */}
            <div style={{ marginBottom: 20 }}>
              <p
                style={{
                  fontSize: "clamp(28px, 7vw, 36px)",
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.6px",
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.15,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {formatCurrency(balance, currency)}
                <span style={{ fontSize: 14, fontWeight: 500, color: "#94a3b8" }}>
                  remaining
                </span>
              </p>
            </div>

            {/* Key stats row */}
            <div className={hasInterest ? "loan-terms-grid" : "loan-terms-grid-no-interest"}>
              {hasInterest ? (
                <>
                  <div>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px", fontWeight: 500 }}>Monthly Int.</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      {Number(monthlyInterest) > 0 ? formatCurrency(monthlyInterest, currency) : "—"}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px", fontWeight: 500 }}>Rate</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, whiteSpace: "nowrap" }}>{rateLabel}</p>
                  </div>
                  <div className="loan-term-due">
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px", fontWeight: 500 }}>Due {dueDay}{dueSuffix}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, whiteSpace: "nowrap" }}>
                      each month
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px", fontWeight: 500 }}>Original</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(original, currency)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px", fontWeight: 500 }}>Interest</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", margin: 0 }}>None</p>
                  </div>
                </>
              )}
            </div>

            {/* Overdue alert */}
            {!isPaidOff && overdueInterest > 0 && (
              <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", margin: "-12px 0 14px", display: "flex", alignItems: "center", gap: 4 }}>
                <AlertTriangle size={13} /> {formatCurrency(overdueInterest, currency)} overdue interest
              </p>
            )}

            {/* Progress: X% paid off · payoff date, then bar, then sub-text */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
                  {isPaidOff ? "100% paid off" : `${Math.round(pctRepaid)}% paid off`}
                </span>
                <span style={{ fontSize: 12.5, color: "#94a3b8" }}>{payoffDate}</span>
              </div>
              <div style={{ backgroundColor: "#e8eef4", borderRadius: 100, height: 4, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${pctRepaid}%`,
                    height: 4,
                    borderRadius: 100,
                    background: isPaidOff
                      ? "linear-gradient(90deg, #86efac, #16a34a)"
                      : "linear-gradient(90deg, hsl(var(--primary2)), hsl(var(--primary)))",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              {/* Sub-text below bar */}
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "6px 0 0" }}>
                {principalPaidTotal > 0
                  ? `${formatCurrency(principalPaidTotal, currency)} repaid`
                  : "No payments yet"}
                {hasInterest && approxInterestLeft > 0 && (
                  <span style={{ color: "#d97706" }}> · ~{formatCurrency(approxInterestLeft, currency)} est. interest left</span>
                )}
              </p>
            </div>

            {/* Buttons: wide Record Payment + light History */}
            {isPaidOff ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <CheckCircle2 size={15} color="#16a34a" /> Fully Paid Off
                </span>
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  style={{ marginLeft: "auto", height: 40, padding: "0 14px", borderRadius: 10, background: "transparent", border: "none", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", color: "#64748b", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}
                >
                  <History size={14} /> History ({loanPayments.length}) {isHistoryOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            ) : (
              <div className="loan-actions-row">
                <button
                  onClick={() => onOpenPaymentModal(loan)}
                  style={{
                    flex: 1,
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: "hsl(var(--primary))",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 14,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 10px hsl(var(--primary) / 0.28)",
                    transition: "opacity 150ms",
                  }}
                >
                  <ArrowDownLeft size={16} /> Record Payment
                </button>
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  style={{
                    height: 46,
                    padding: "0 14px",
                    borderRadius: 12,
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "all 150ms",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#0f172a";
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <History size={15} /> History {loanPayments.length > 0 ? `(${loanPayments.length})` : ""} {isHistoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded History drawer */}
      {!isCardCollapsed && isHistoryOpen && (
        <div className="loan-expanded-content">
          {/* Notes */}
          {loan.notes && (
            <p style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic", margin: "0 0 16px", padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #e8eef4" }}>
              &ldquo;{loan.notes}&rdquo;
            </p>
          )}

          {/* PAYOFF SUMMARY */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 14px" }}>
            Payoff Summary
          </p>
          <div className="loan-payoff-grid">
            <div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px" }}>Est. 1-yr Interest</p>
              {hasInterest && approxInterestLeft > 0 ? (
                <p style={{ fontSize: 17, fontWeight: 700, color: "#d97706", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                  ~{formatCurrency(approxInterestLeft, currency)}
                </p>
              ) : (
                <p style={{ fontSize: 15, fontWeight: 700, color: "#16a34a", margin: 0 }}>None</p>
              )}
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px" }}>Est. Payoff</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {isPaidOff ? "Paid in full" : payoffDate}
              </p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 4px" }}>Repaid to Date</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(principalPaidTotal, currency)}
              </p>
            </div>
          </div>

          {/* PAYMENT HISTORY LIST */}
          <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", margin: "18px 0 10px" }}>
            Payment History ({loanPayments.length})
          </p>

          {loanPayments.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "16px 0", margin: 0 }}>
              No payments recorded yet.
            </p>
          ) : (
            <div>
              {loanPayments.map((p) => {
                const pAmt = Number(p.amount || 0);
                const pPrincipal = Number(p.principal_portion || 0);
                const pInterest = Number(p.interest_portion || 0);
                const pOverdue = Number(p.overdue_portion || 0);
                const formattedDate = p.payment_date
                  ? new Date(p.payment_date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #f1f5f9",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ArrowDownLeft size={14} color="#16a34a" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
                            {formatCurrency(pAmt, currency)}
                          </span>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{formattedDate}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
                          {pInterest > 0
                            ? `${formatCurrency(pPrincipal, currency)} principal + ${formatCurrency(pInterest, currency)} interest`
                            : `${formatCurrency(pPrincipal, currency)} principal reduction`}
                          {pOverdue > 0 && ` (${formatCurrency(pOverdue, currency)} overdue)`}
                          {p.notes && ` · ${p.notes}`}
                        </p>
                      </div>
                    </div>
                    {onDeletePayment && (
                      <button
                        onClick={() => onDeletePayment(p)}
                        title="Delete payment"
                        aria-label="Delete payment"
                        style={{ width: 28, height: 28, borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#cbd5e1", flexShrink: 0, transition: "all 150ms" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#cbd5e1"; }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
