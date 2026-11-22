'use client';

import { useState, useEffect } from "react";
import type { Loan } from "@/types";
import { Modal } from "@/components/Modal";
import { CurrencyToggle } from "@/components/CurrencyToggle";
import { getCurrencyDisplayMode } from "@/lib/currency";
import { getUsdToInr } from "@/lib/exchange-rate";
import { FORM_INPUT, FORM_LABEL } from "@/lib/styles";
import { ArrowLeftRight, Percent } from "lucide-react";
import { CustomSelect, type SelectOption } from "@/components/CustomSelect";

const INTEREST_TYPE_OPTIONS: SelectOption<Loan["interest_type"]>[] = [
  { value: "percentage_monthly", label: "% Per Month" },
  { value: "percentage_yearly", label: "% Per Year (p.a.)" },
  { value: "fixed_monthly", label: "Fixed Amount / Month" },
];

interface LoanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Partial<Loan>) => void;
  initialLoan?: Loan | null;
  activeCurrency: "INR" | "USD";
}

export function LoanFormModal({
  isOpen,
  onClose,
  onSave,
  initialLoan,
  activeCurrency,
}: LoanFormModalProps) {
  const [lenderName, setLenderName] = useState("");
  const [currency, setCurrency] = useState<"INR" | "USD">(activeCurrency);
  const [originalAmount, setOriginalAmount] = useState("");
  const [remainingPrincipal, setRemainingPrincipal] = useState("");
  const [hasInterest, setHasInterest] = useState(false);
  const [interestType, setInterestType] = useState<Loan["interest_type"]>("percentage_monthly");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [fxRate, setFxRate] = useState<number | null>(null);
  const [fxLoading, setFxLoading] = useState(true);

  useEffect(() => {
    getUsdToInr()
      .then((r) => {
        setFxRate(r);
        setFxLoading(false);
      })
      .catch(() => setFxLoading(false));
  }, []);

  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);
  const currentKey = isOpen ? `${initialLoan?.id || 'new'}_${initialLoan?.updated_at || ''}_${activeCurrency}` : null;
  if (currentKey !== prevOpenKey) {
    setPrevOpenKey(currentKey);
    if (initialLoan) {
      setLenderName(initialLoan.lender_name || "");
      setCurrency(initialLoan.currency || activeCurrency);
      setOriginalAmount(String(initialLoan.original_amount || ""));
      setRemainingPrincipal(String(initialLoan.remaining_principal || ""));
      const isWithInterest = initialLoan.interest_type !== "no_interest" && Number(initialLoan.interest_rate || 0) > 0;
      setHasInterest(isWithInterest);
      setInterestType(initialLoan.interest_type === "no_interest" ? "percentage_monthly" : initialLoan.interest_type || "percentage_monthly");
      setInterestRate(String(initialLoan.interest_rate || ""));
      setStartDate(initialLoan.start_date ? initialLoan.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setNotes(initialLoan.notes || "");
    } else {
      setLenderName("");
      setCurrency(activeCurrency);
      setOriginalAmount("");
      setRemainingPrincipal("");
      setHasInterest(false);
      setInterestType("percentage_monthly");
      setInterestRate("");
      setStartDate(new Date().toISOString().slice(0, 10));
      setNotes("");
    }
  }

  const convertAmt = (val: string, cur: "INR" | "USD" = currency) => {
    const n = parseFloat(val);
    if (!n || !fxRate) return null;
    if (getCurrencyDisplayMode() !== "both") return null;
    return cur === "INR"
      ? `≈ $${(n / fxRate).toFixed(2)}`
      : `≈ ₹${Math.round(n * fxRate).toLocaleString("en-IN")}`;
  };

  const handleConvertAll = () => {
    if (!fxRate) return;
    const flip: "INR" | "USD" = currency === "INR" ? "USD" : "INR";
    const convert = (v: string) => {
      const n = parseFloat(v);
      if (!n) return v;
      return flip === "USD" ? (n / fxRate).toFixed(2) : String(Math.round(n * fxRate));
    };

    setCurrency(flip);
    setOriginalAmount((prev) => convert(prev));
    setRemainingPrincipal((prev) => convert(prev));
    if (hasInterest && interestType === "fixed_monthly") {
      setInterestRate((prev) => convert(prev));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lenderName.trim()) return;

    const orig = parseFloat(originalAmount) || 0;
    const rem = remainingPrincipal.trim() === "" ? orig : parseFloat(remainingPrincipal) || 0;

    onSave({
      id: initialLoan?.id,
      lender_name: lenderName.trim(),
      lender_type: initialLoan?.lender_type || "bank",
      currency,
      original_amount: orig,
      remaining_principal: rem,
      interest_type: hasInterest ? interestType : "no_interest",
      interest_rate: hasInterest ? parseFloat(interestRate) || 0 : 0,
      start_date: startDate,
      interest_due_day: initialLoan?.interest_due_day || 1,
      overdue_rule: initialLoan?.overdue_rule || "carry_forward",
      priority: initialLoan?.priority || "high",
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={initialLoan ? "Edit Loan" : "Add Loan"}
      maxWidth={460}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Loan Name */}
        <div>
          <label style={FORM_LABEL}>Loan Name / Lender *</label>
          <input
            type="text"
            required
            placeholder="e.g. Car Loan, Dad, HDFC, Rahul"
            value={lenderName}
            onChange={(e) => setLenderName(e.target.value)}
            style={FORM_INPUT}
            autoFocus
          />
        </div>

        {/* Currency & Live Convert All */}
        {getCurrencyDisplayMode() === "both" && (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={FORM_LABEL}>Currency</label>
                <CurrencyToggle value={currency} onChange={(val) => setCurrency(val)} />
              </div>
              {(originalAmount || remainingPrincipal) && fxRate && (
                <button
                  type="button"
                  onClick={handleConvertAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 38,
                    padding: "0 14px",
                    borderRadius: 10,
                    border: "1.5px solid hsl(var(--primary) / 0.25)",
                    background: "hsl(var(--primary) / 0.06)",
                    color: "hsl(var(--primary))",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  <ArrowLeftRight size={13} />
                  Convert to {currency === "INR" ? "USD" : "INR"}
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, margin: "-8px 0 0", fontWeight: 500, color: fxRate ? "#94a3b8" : "#f59e0b" }}>
              {fxLoading ? "Fetching live rate..." : fxRate ? `1 USD = ₹${fxRate.toFixed(2)} · live rate` : "Rate unavailable"}
            </p>
          </>
        )}

        {/* Original Amount & Remaining Balance */}
        <div className="modal-form-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={FORM_LABEL}>Total Amount *</label>
            <input
              type="number"
              required
              min="0"
              step="any"
              placeholder="e.g. 500000"
              value={originalAmount}
              onChange={(e) => {
                setOriginalAmount(e.target.value);
                if (!initialLoan && remainingPrincipal === "") {
                  setRemainingPrincipal(e.target.value);
                }
              }}
              style={FORM_INPUT}
            />
            {convertAmt(originalAmount) && (
              <p style={{ fontSize: 11, color: "hsl(var(--primary))", margin: "3px 0 0 2px", fontWeight: 600 }}>
                {convertAmt(originalAmount)}
              </p>
            )}
          </div>
          <div>
            <label style={FORM_LABEL}>Remaining Balance *</label>
            <input
              type="number"
              required
              min="0"
              step="any"
              placeholder="e.g. 500000"
              value={remainingPrincipal}
              onChange={(e) => setRemainingPrincipal(e.target.value)}
              style={FORM_INPUT}
            />
            {convertAmt(remainingPrincipal) && (
              <p style={{ fontSize: 11, color: "hsl(var(--primary))", margin: "3px 0 0 2px", fontWeight: 600 }}>
                {convertAmt(remainingPrincipal)}
              </p>
            )}
          </div>
        </div>

        {/* Simple Optional Interest Toggle */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 12,
            backgroundColor: hasInterest ? "hsl(var(--primary) / 0.04)" : "#f8fafc",
            border: hasInterest ? "1.5px solid hsl(var(--primary) / 0.2)" : "1px solid #e2e8f0",
            transition: "all 150ms ease",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              cursor: "pointer",
              userSelect: "none",
              margin: 0,
            }}
          >
            <input
              type="checkbox"
              checked={hasInterest}
              onChange={(e) => setHasInterest(e.target.checked)}
              style={{
                width: 17,
                height: 17,
                accentColor: "hsl(var(--primary))",
                cursor: "pointer",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Percent size={14} color={hasInterest ? "hsl(var(--primary))" : "#64748b"} />
              <span style={{ fontSize: 13, fontWeight: 700, color: hasInterest ? "hsl(var(--primary))" : "#334155" }}>
                This loan has interest
              </span>
            </div>
          </label>

          {hasInterest && (
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 10 }}>
              <div>
                <label style={{ ...FORM_LABEL, fontSize: 11 }}>Interest Type</label>
                <CustomSelect<Loan["interest_type"]>
                  value={interestType}
                  onChange={(val) => setInterestType(val)}
                  options={INTEREST_TYPE_OPTIONS}
                />
              </div>
              <div>
                <label style={{ ...FORM_LABEL, fontSize: 11 }}>
                  {interestType === "percentage_monthly"
                    ? "Rate (% / mo)"
                    : interestType === "percentage_yearly"
                    ? "Rate (% p.a.)"
                    : `Amount (${currency === "INR" ? "₹" : "$"})`}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required={hasInterest}
                  placeholder={interestType === "fixed_monthly" ? "2000" : "1.5"}
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  style={FORM_INPUT}
                />
              </div>
            </div>
          )}
        </div>

        {/* Start Date & Notes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={FORM_LABEL}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={FORM_INPUT}
            />
          </div>
          <div>
            <label style={FORM_LABEL}>Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Return by Diwali"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={FORM_INPUT}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            height: 46,
            borderRadius: 12,
            backgroundColor: "hsl(var(--primary))",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
            marginTop: 6,
            fontFamily: "inherit",
            boxShadow: "0 4px 14px hsl(var(--primary) / 0.25)",
          }}
        >
          {initialLoan ? "Save Changes" : "Add Loan"}
        </button>
      </form>
    </Modal>
  );
}
