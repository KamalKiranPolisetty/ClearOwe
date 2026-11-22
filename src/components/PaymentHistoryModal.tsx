'use client';

import React from 'react';
import type { Loan, Payment } from '@/types';
import { Modal } from '@/components/Modal';
import { formatCurrency } from '@/lib/currency';
import { Trash2, Edit3, CheckCircle2 } from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  loan: Loan | null;
  payments: Payment[];
  language?: string;
  onClose: () => void;
  onEditPayment?: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
}

export function PaymentHistoryModal({
  isOpen,
  loan,
  payments,
  onClose,
  onEditPayment,
  onDeletePayment,
}: PaymentHistoryModalProps) {
  if (!isOpen || !loan) return null;

  // Filter payments for this loan and sort chronological descending
  const loanPayments = [...payments]
    .filter((p) => p.loan_id === loan.id)
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

  return (
    <>
      <Modal open={isOpen} onClose={onClose} title={`Payment History - ${loan.lender_name}`} maxWidth={600}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Header summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'hsl(var(--primary) / 0.06)',
              borderRadius: 14,
              border: '1px solid hsl(var(--primary) / 0.15)',
            }}
          >
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {loanPayments.length} {loanPayments.length === 1 ? 'payment recorded' : 'payments recorded'}
              </span>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                Remaining Principal: {formatCurrency(loan.remaining_principal, loan.currency)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '60vh', overflowY: 'auto' }}>
            {loanPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                <CheckCircle2 size={36} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>No payments recorded yet</p>
              </div>
            ) : (
              loanPayments.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 14,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8eef4',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(p.amount, loan.currency)}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: 6,
                          backgroundColor: 'hsl(var(--primary) / 0.1)',
                          color: 'hsl(var(--primary))',
                        }}
                      >
                        {p.destination}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {onEditPayment && (
                        <button
                          onClick={() => onEditPayment(p)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeletePayment(p.id)}
                        title="Delete payment"
                        aria-label="Delete payment"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: 'transparent',
                          border: 'none',
                          color: '#cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#cbd5e1';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>
                    {p.payment_date} · Logged by {p.created_by || 'You'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, fontSize: 11, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Principal: </span>
                      <strong style={{ color: '#16a34a' }}>{formatCurrency(p.principal_portion || 0, loan.currency)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Interest: </span>
                      <strong style={{ color: '#d97706' }}>{formatCurrency(p.interest_portion || 0, loan.currency)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Overdue: </span>
                      <strong style={{ color: '#dc2626' }}>{formatCurrency(p.overdue_portion || 0, loan.currency)}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
