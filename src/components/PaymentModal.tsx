'use client';

import React, { useState } from "react";
import type { LoanWithStatus, Currency } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { Modal } from "@/components/Modal";
import { FORM_LABEL, FORM_INPUT, PRIMARY_BTN } from "@/lib/styles";
import { ArrowDownLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanWithStatus | null;
  onRecordPayment: (payment: {
    loan_id: string;
    amount: number;
    payment_date: string;
    type: "interest" | "principal" | "split";
    principal_paid: number;
    interest_paid: number;
    overdue_paid: number;
    notes?: string;
  }) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  loan,
  onRecordPayment,
}: PaymentModalProps) {
  const [amountInput, setAmountInput] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const currency = (loan?.currency || "INR") as Currency;
  const overdueOwed = loan?.overdue_interest || 0;
  const monthlyOwed = loan?.interest_due_this_month || 0;
  const totalInterestDue = overdueOwed + monthlyOwed;
  const balance = loan?.remaining_principal || 0;
  const fullPayoffAmount = balance + totalInterestDue;

  // Initialize or reset form on open
  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);
  const currentKey = isOpen && loan ? `${loan.id}_${loan.updated_at || ''}` : null;
  if (currentKey !== prevOpenKey) {
    setPrevOpenKey(currentKey);
    if (isOpen && loan) {
      setAmountInput("");
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setNotes("");
    }
  }

  const numAmount = parseFloat(amountInput) || 0;

  // Smart allocation: Overdue -> Monthly Interest -> Principal
  let overduePaid = 0;
  let interestPaid = 0;
  let principalPaid = 0;

  if (numAmount > 0) {
    if (totalInterestDue > 0) {
      overduePaid = Math.min(numAmount, overdueOwed);
      const remAfterOverdue = Math.max(0, numAmount - overduePaid);
      interestPaid = Math.min(remAfterOverdue, monthlyOwed);
      principalPaid = Math.min(balance, Math.max(0, remAfterOverdue - interestPaid));
    } else {
      principalPaid = Math.min(balance, numAmount);
    }
  }

  const newBalance = Math.max(0, balance - principalPaid);
  const isFullyPaidOff = balance <= 0 && totalInterestDue <= 0;
  const isOverpaying = numAmount > fullPayoffAmount + 0.01 && fullPayoffAmount > 0;
  const isPaymentBlocked = numAmount <= 0 || isOverpaying || isFullyPaidOff;

  let destinationType: "interest" | "principal" | "split" = "principal";
  if (principalPaid > 0 && (interestPaid > 0 || overduePaid > 0)) {
    destinationType = "split";
  } else if (interestPaid > 0 || overduePaid > 0) {
    destinationType = "interest";
  } else {
    destinationType = "principal";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan || isPaymentBlocked) return;

    onRecordPayment({
      loan_id: loan.id,
      amount: numAmount,
      payment_date: paymentDate,
      type: destinationType,
      principal_paid: principalPaid,
      interest_paid: interestPaid,
      overdue_paid: overduePaid,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  if (!loan) return null;

  return (
    <Modal open={isOpen} onClose={onClose} title={`Record Payment - ${loan.lender_name}`} maxWidth={460}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Fully Paid Off Banner */}
        {isFullyPaidOff && (
          <div
            style={{
              padding: "16px",
              borderRadius: 14,
              backgroundColor: "#f0fdf4",
              border: "1.5px solid #86efac",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#15803d" }}>
                Loan is Paid in Full!
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#166534" }}>
                All principal and dues have been settled.
              </p>
            </div>
          </div>
        )}

        {/* Loan Balance & Dues Summary */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "hsl(var(--primary) / 0.05)",
            border: "1px solid hsl(var(--primary) / 0.15)",
            padding: "12px 16px",
            borderRadius: 14,
          }}
        >
          <div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>{loan.lender_name}</span>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              Remaining Principal: <strong style={{ color: "#0f172a" }}>{formatCurrency(balance, currency)}</strong>
            </p>
          </div>
          {totalInterestDue > 0 && (
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Interest Due</span>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#d97706", margin: 0 }}>
                {formatCurrency(totalInterestDue, currency)}
              </p>
            </div>
          )}
        </div>

        {/* 1-Tap Quick Fill Shortcuts */}
        {!isFullyPaidOff && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {totalInterestDue > 0 && (
              <button
                type="button"
                onClick={() => setAmountInput(String(totalInterestDue))}
                style={{
                  height: 28,
                  padding: "0 10px",
                  borderRadius: 100,
                  backgroundColor: numAmount === totalInterestDue ? "hsl(var(--primary) / 0.15)" : "#f1f5f9",
                  color: numAmount === totalInterestDue ? "hsl(var(--primary))" : "#475569",
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Pay Interest Only ({formatCurrency(totalInterestDue, currency)})
              </button>
            )}

            <button
              type="button"
              onClick={() => setAmountInput(String(fullPayoffAmount))}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 100,
                backgroundColor: numAmount === fullPayoffAmount ? "hsl(var(--primary) / 0.15)" : "#f1f5f9",
                color: numAmount === fullPayoffAmount ? "hsl(var(--primary))" : "#475569",
                border: "none",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Pay Off in Full ({formatCurrency(fullPayoffAmount, currency)})
            </button>
          </div>
        )}

        {/* Payment Amount Field */}
        <div>
          <label style={FORM_LABEL}>Payment Amount *</label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                fontWeight: 700,
                color: "#64748b",
              }}
            >
              {currency === "INR" ? "₹" : "$"}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              disabled={isFullyPaidOff}
              required
              placeholder="e.g. 20000"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              style={{
                ...FORM_INPUT,
                paddingLeft: 36,
                fontSize: 17,
                fontWeight: 700,
              }}
              autoFocus
            />
          </div>
          {isOverpaying && (
            <p style={{ fontSize: 11, color: "#dc2626", margin: "4px 0 0 2px", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertCircle size={12} /> Payment cannot exceed total payoff amount ({formatCurrency(fullPayoffAmount, currency)})
            </p>
          )}
        </div>

        {/* Smart Allocation Preview */}
        {numAmount > 0 && !isOverpaying && (
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#64748b" }}>Principal Reduction:</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#94a3b8", textDecoration: principalPaid > 0 ? "line-through" : "none" }}>
                  {formatCurrency(balance, currency)}
                </span>
                {principalPaid > 0 && (
                  <>
                    <ArrowRight size={12} color="#16a34a" />
                    <strong style={{ color: newBalance <= 0 ? "#16a34a" : "#0f172a" }}>
                      {newBalance <= 0 ? "Paid Off" : formatCurrency(newBalance, currency)}
                    </strong>
                  </>
                )}
              </div>
            </div>

            {(interestPaid > 0 || overduePaid > 0) && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#d97706", fontWeight: 600 }}>
                <span>Interest Covered:</span>
                <span>{formatCurrency(interestPaid + overduePaid, currency)}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment Date & Note */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={FORM_LABEL}>Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              style={FORM_INPUT}
            />
          </div>
          <div>
            <label style={FORM_LABEL}>Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. UPI / Cash"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={FORM_INPUT}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPaymentBlocked}
          style={{
            ...PRIMARY_BTN,
            width: "100%",
            height: 46,
            marginTop: 4,
            opacity: isPaymentBlocked ? 0.5 : 1,
            cursor: isPaymentBlocked ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {isFullyPaidOff ? (
            <>
              <CheckCircle2 size={16} /> Loan Fully Paid Off
            </>
          ) : (
            <>
              <ArrowDownLeft size={16} /> Record {numAmount > 0 && !isOverpaying ? formatCurrency(numAmount, currency) : ""} Payment
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
