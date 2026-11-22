'use client';

import React from 'react';
import { Loan, Payment } from '@/types';
import { formatCurrency, type Currency } from '@/lib/currency';

interface ChartsProps {
  loans: Loan[];
  payments: Payment[];
  currency: Currency;
  language?: string;
}

export function Charts({ loans, payments, currency }: ChartsProps) {
  const activeLoans = loans.filter((l) => (l.currency || 'INR') === currency);
  const relevantLoanIds = new Set(activeLoans.map((l) => l.id));
  const relevantPayments = payments.filter((p) => relevantLoanIds.has(p.loan_id));

  // 1. Calculate Monthly Interest Paid for last 6 months
  const now = new Date();
  const monthsData: { monthKey: string; label: string; interestPaid: number; principalPaid: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `${monthNames[m]} '${String(y).slice(2)}`;

    // Sum payments in this month
    const thisMonthPayments = relevantPayments.filter((p) => {
      const pParts = p.payment_date.split('-');
      return parseInt(pParts[0], 10) === y && parseInt(pParts[1], 10) - 1 === m;
    });

    const interestSum = thisMonthPayments.reduce(
      (acc, p) => acc + (p.interest_portion || 0) + (p.overdue_portion || 0),
      0
    );
    const principalSum = thisMonthPayments.reduce((acc, p) => acc + (p.principal_portion || 0), 0);

    monthsData.push({
      monthKey,
      label,
      interestPaid: Math.round(interestSum),
      principalPaid: Math.round(principalSum),
    });
  }

  const maxInterest = Math.max(1, ...monthsData.map((d) => d.interestPaid));

  // 2. Principal progress overview
  const totalOriginal = activeLoans.reduce((sum, l) => sum + Number(l.original_amount || 0), 0);
  const totalRemaining = activeLoans.reduce((sum, l) => sum + Number(l.remaining_principal || 0), 0);
  const totalRepaid = Math.max(0, totalOriginal - totalRemaining);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, margin: '20px 0' }}>
      {/* Chart 1: Interest Paid per Month (SVG Bar Chart) */}
      <div className="glass-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Interest Paid Per Month ({currency})
          </h4>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Last 6 Months</span>
        </div>

        <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, padding: '16px 8px 4px' }}>
          {monthsData.map((item) => {
            const heightPct = Math.max(8, Math.round((item.interestPaid / maxInterest) * 80));
            return (
              <div key={item.monthKey} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                  {item.interestPaid > 0 ? formatCurrency(item.interestPaid, currency) : '₹0'}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 34,
                    height: `${heightPct}%`,
                    background: item.interestPaid > 0
                      ? 'linear-gradient(180deg, hsl(var(--primary2)) 0%, hsl(var(--primary)) 100%)'
                      : '#e2e8f0',
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'all 200ms ease',
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Total Principal Remaining vs Repaid */}
      <div className="glass-card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Total Principal Remaining ({currency})
            </h4>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Portfolio Status</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                Remaining
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totalRemaining, currency)}
              </span>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: 12, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                Repaid
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(totalRepaid, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Stacked Progress Bar */}
        <div>
          <div style={{ width: '100%', height: 12, backgroundColor: '#f1f5f9', borderRadius: 100, overflow: 'hidden', display: 'flex', marginBottom: 8 }}>
            <div
              style={{
                width: `${totalOriginal > 0 ? (totalRepaid / totalOriginal) * 100 : 0}%`,
                height: '100%',
                backgroundColor: '#16a34a',
                transition: 'width 300ms ease',
              }}
            />
            <div
              style={{
                width: `${totalOriginal > 0 ? (totalRemaining / totalOriginal) * 100 : 100}%`,
                height: '100%',
                backgroundColor: 'hsl(var(--primary))',
                transition: 'width 300ms ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
              <span>{Math.round(totalOriginal > 0 ? (totalRepaid / totalOriginal) * 100 : 0)}% Repaid</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'hsl(var(--primary))', display: 'inline-block' }} />
              <span>Original: {formatCurrency(totalOriginal, currency)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
