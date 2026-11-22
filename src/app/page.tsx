'use client';

import React, { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import type { Loan, Payment, NavTab, LoanWithStatus } from '@/types';
import {
  fetchLoans,
  addLoan,
  updateLoan,
  deleteLoan,
  fetchPayments,
  addPayment,
  deletePayment,
  resetAllUserData,
} from '@/lib/supabase-queries';
import { computeLoansWithStatus } from '@/lib/calculations';
import { getCurrencyDisplayMode, formatCurrency, type Currency } from '@/lib/currency';
import { getUsdToInr } from '@/lib/exchange-rate';

import { Navigation } from '@/components/Navigation';
import { HomeView } from '@/components/views/HomeView';
import { LoansView } from '@/components/views/LoansView';
import { SettingsView } from '@/components/views/SettingsView';
import { LandingView } from '@/components/views/LandingView';
import { AuthView } from '@/components/views/AuthView';
import { PaymentModal } from '@/components/PaymentModal';
import { LoanFormModal } from '@/components/LoanFormModal';
import { PaymentHistoryModal } from '@/components/PaymentHistoryModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { CelebrationModal } from '@/components/CelebrationModal';
import { SelectedMonthProvider, useSelectedMonth } from '@/contexts/SelectedMonthContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { UniversalPageSkeleton } from '@/components/Skeleton';

const VALID_TABS: NavTab[] = ['home', 'this-month', 'loans', 'settings'];

function getInitialTab(): NavTab {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace('#', '') as NavTab;
    if (VALID_TABS.includes(hash)) {
      document.documentElement.setAttribute('data-tab', hash);
      return hash;
    }
    const docTab = document.documentElement.getAttribute('data-tab') as NavTab;
    if (docTab && VALID_TABS.includes(docTab)) {
      return docTab;
    }
    try {
      const saved = localStorage.getItem('clearowe_active_tab') as NavTab;
      if (VALID_TABS.includes(saved)) {
        document.documentElement.setAttribute('data-tab', saved);
        return saved;
      }
    } catch {}
  }
  return 'home';
}

const emptySubscribe = () => () => {};

function AppContent() {
  const { user, displayName, greeting, loading: authLoading, signOut, signInAsGuest } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'auth' | 'app'>('landing');

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  // Keep initial tab 'home' identical between SSR and client initial hydration to prevent mismatch
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // Hydration-safe tab synchronization after mount
  useEffect(() => {
    const initial = getInitialTab();
    if (initial !== 'home') {
      const timer = setTimeout(() => setCurrentTab(initial), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTabChange = useCallback((tab: NavTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-tab', tab);
      try {
        localStorage.setItem('clearowe_active_tab', tab);
        window.history.replaceState(null, '', `#${tab}`);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (VALID_TABS.includes(hash)) {
        document.documentElement.setAttribute('data-tab', hash);
        setCurrentTab(hash);
        try {
          localStorage.setItem('clearowe_active_tab', hash);
        } catch {}
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Independent Currency State per view (matching SimpleSpend)
  const [homeCurrency, setHomeCurrency] = useState<'INR' | 'USD'>('INR');
  const [thisMonthCurrency, setThisMonthCurrency] = useState<'INR' | 'USD'>('INR');
  const [loansCurrency, setLoansCurrency] = useState<'INR' | 'USD'>('INR');
  const [exchangeRate, setExchangeRate] = useState<number>(86.5);

  // Modals state
  const [paymentLoan, setPaymentLoan] = useState<LoanWithStatus | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  const [historyLoan, setHistoryLoan] = useState<Loan | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Celebration state for loan payoff
  const [celebrationData, setCelebrationData] = useState<{
    lenderName: string;
    originalAmount: number;
    currency: Currency;
  } | null>(null);
  const [loansStatusTab, setLoansStatusTab] = useState<'active' | 'completed' | 'all'>('active');

  // Confirmation dialogs state
  const [loanToDelete, setLoanToDelete] = useState<LoanWithStatus | Loan | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initial currency mode & live FX rate
  useEffect(() => {
    const syncMode = () => {
      const mode = getCurrencyDisplayMode();
      if (mode === 'usd_only') {
        setHomeCurrency('USD');
        setThisMonthCurrency('USD');
        setLoansCurrency('USD');
      } else if (mode === 'inr_only') {
        setHomeCurrency('INR');
        setThisMonthCurrency('INR');
        setLoansCurrency('INR');
      }
    };

    syncMode();
    if (typeof window !== 'undefined') {
      window.addEventListener('ss_currency_mode_changed', syncMode);
    }

    getUsdToInr()
      .then((rate) => {
        if (rate > 0) setExchangeRate(rate);
      })
      .catch(() => {});

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ss_currency_mode_changed', syncMode);
      }
    };
  }, []);

  const userId = user?.id;

  // Load data directly from Supabase (with guest fallback)
  const refreshData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [storedLoans, storedPayments] = await Promise.all([
        fetchLoans(userId),
        fetchPayments(userId),
      ]);
      setLoans(storedLoans);
      setPayments(storedPayments);
    } catch (err) {
      console.warn('Error fetching data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    const timer = setTimeout(() => {
      if (userId) {
        void refreshData();
      } else {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [authLoading, userId, refreshData]);

  const { viewDate } = useSelectedMonth();

  // Recalculate status, remaining balances, overdue amounts for the globally selected viewDate
  const loansWithStatus: LoanWithStatus[] = useMemo(() => {
    return computeLoansWithStatus(loans, payments, viewDate);
  }, [loans, payments, viewDate]);

  const currentViewCurrency = currentTab === 'loans' ? loansCurrency : currentTab === 'this-month' ? thisMonthCurrency : homeCurrency;

  // Count unpaid loans this month for tab badge
  const unpaidThisMonthCount = useMemo(() => {
    return loansWithStatus.filter(
      (l) =>
        (l.status === 'overdue' || l.status === 'unpaid' || l.status === 'partially_paid') &&
        Number(l.remaining_principal || 0) > 0 &&
        (Number(l.overdue_interest || 0) > 0 || Number(l.interest_due_this_month || 0) > 0) &&
        (l.currency || 'INR') === thisMonthCurrency
    ).length;
  }, [loansWithStatus, thisMonthCurrency]);

  // Handlers
  const handleSaveLoan = async (loanData: Partial<Loan>) => {
    if (!user?.id) return;
    try {
      if (editingLoan?.id) {
        await updateLoan(editingLoan.id, user.id, loanData);
      } else {
        await addLoan(user.id, {
          ...loanData,
          currency: loanData.currency || currentViewCurrency,
        });
      }
      await refreshData();
      setIsLoanModalOpen(false);
      setEditingLoan(null);
    } catch (err) {
      console.error('Failed to save loan:', err);
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    const target = loansWithStatus.find((l) => l.id === loanId) || loans.find((l) => l.id === loanId);
    if (target) {
      setLoanToDelete(target);
    }
  };

  const handleConfirmDeleteLoan = async () => {
    if (!user?.id || !loanToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLoan(loanToDelete.id, user.id);
      await refreshData();
      setLoanToDelete(null);
    } catch (err) {
      console.error('Failed to delete loan:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePin = async (loanId: string) => {
    if (!user?.id) return;
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;
    try {
      await updateLoan(loanId, user.id, { is_pinned: !loan.is_pinned });
      await refreshData();
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleRecordPayment = async (paymentData: {
    loan_id: string;
    amount: number;
    payment_date: string;
    type: 'interest' | 'principal' | 'split';
    principal_paid: number;
    interest_paid: number;
    overdue_paid: number;
    notes?: string;
  }) => {
    if (!user?.id) return;
    try {
      const targetLoan = loans.find((l) => l.id === paymentData.loan_id);
      if (!targetLoan) return;

      await addPayment(user.id, {
        loan_id: paymentData.loan_id,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        destination: paymentData.type,
        principal_portion: paymentData.principal_paid,
        interest_portion: paymentData.interest_paid,
        overdue_portion: paymentData.overdue_paid,
        notes: paymentData.notes || '',
        running_balance: Math.max(0, targetLoan.remaining_principal - paymentData.principal_paid),
      });

      // Deduct principal if principal was paid
      if (paymentData.principal_paid > 0) {
        const newPrincipal = Math.max(0, targetLoan.remaining_principal - paymentData.principal_paid);
        await updateLoan(targetLoan.id, user.id, {
          remaining_principal: newPrincipal,
        });

        if (newPrincipal <= 0) {
          setCelebrationData({
            lenderName: targetLoan.lender_name,
            originalAmount: targetLoan.original_amount,
            currency: (targetLoan.currency || 'INR') as Currency,
          });
        }
      }

      await refreshData();
      setIsPaymentModalOpen(false);
      setPaymentLoan(null);
    } catch (err) {
      console.error('Failed to record payment:', err);
    }
  };

  const handleDeletePayment = (payment: Payment) => {
    setPaymentToDelete(payment);
  };

  const handleConfirmDeletePayment = async () => {
    if (!user?.id || !paymentToDelete) return;
    setIsDeleting(true);
    try {
      await deletePayment(paymentToDelete.id, user.id);

      // Restore principal if principal portion was paid
      if (paymentToDelete.principal_portion > 0) {
        const targetLoan = loans.find((l) => l.id === paymentToDelete.loan_id);
        if (targetLoan) {
          await updateLoan(targetLoan.id, user.id, {
            remaining_principal: targetLoan.remaining_principal + paymentToDelete.principal_portion,
          });
        }
      }

      await refreshData();
      setPaymentToDelete(null);
    } catch (err) {
      console.error('Failed to delete payment:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetAllData = async () => {
    if (!user?.id) return;
    try {
      await resetAllUserData(user.id);
      setLoans([]);
      setPayments([]);
      await refreshData();
    } catch (err) {
      console.error('Failed to reset app data:', err);
    }
  };

  const handleOpenAddModal = () => {
    setEditingLoan(null);
    setIsLoanModalOpen(true);
  };

  const handleOpenEditModal = (loan: Loan) => {
    setEditingLoan(loan);
    setIsLoanModalOpen(true);
  };

  const handleOpenPaymentModal = (loan: Loan) => {
    const loanWithStatus = loansWithStatus.find((l) => l.id === loan.id) || (loan as LoanWithStatus);
    setPaymentLoan(loanWithStatus);
    setIsPaymentModalOpen(true);
  };

  // 1. Loading state during hydration, auth check, or initial data load
  if (!isClient || authLoading || (user && loading)) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }} suppressHydrationWarning>
        <Navigation
          currentTab={currentTab}
          onTabChange={handleTabChange}
          isOnline={true}
          unpaidThisMonthCount={0}
          user={user}
          displayName={displayName}
          onSignOut={async () => {
            await signOut();
            setAuthView('landing');
          }}
        />
        <main className="page-wrapper" suppressHydrationWarning>
          <div className="page-content" style={{ maxWidth: 1100, margin: '0 auto' }} suppressHydrationWarning>
            <UniversalPageSkeleton />
          </div>
        </main>
      </div>
    );
  }

  // 2. Unauthenticated: Show Landing Page or Login / Register page
  if (!user) {
    if (authView === 'auth') {
      return (
        <AuthView
          onBack={() => setAuthView('landing')}
          onSuccess={() => setAuthView('app')}
        />
      );
    }
    return (
      <LandingView
        onGetStarted={() => setAuthView('auth')}
        onSignIn={() => setAuthView('auth')}
        onExploreDemo={async () => {
          await signInAsGuest('Demo', 'demo@example.com');
          setAuthView('app');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* ── Desktop & Mobile Navigation matching SimpleSpend ── */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isOnline={true}
        unpaidThisMonthCount={unpaidThisMonthCount}
        user={user}
        displayName={displayName}
        onSignOut={async () => {
          await signOut();
          setAuthView('landing');
        }}
      />

      {/* ── Main Content Page Wrapper matching SimpleSpend ── */}
      <main className="page-wrapper">
        <div className="page-content" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {(currentTab === 'home' || currentTab === 'this-month') && (
            <HomeView
              loans={loansWithStatus}
              payments={payments}
              activeCurrency={homeCurrency}
              onCurrencyChange={setHomeCurrency}
              exchangeRate={exchangeRate}
              greeting={greeting}
              displayName={displayName}
              onOpenAddModal={handleOpenAddModal}
              onOpenPaymentModal={handleOpenPaymentModal}
              onEditLoan={handleOpenEditModal}
              onDeleteLoan={handleDeleteLoan}
              onGoToLoans={() => handleTabChange('loans')}
            />
          )}

          {currentTab === 'loans' && (
            <LoansView
              loans={loansWithStatus}
              payments={payments}
              activeCurrency={loansCurrency}
              onCurrencyChange={setLoansCurrency}
              onOpenAddModal={handleOpenAddModal}
              onOpenPaymentModal={handleOpenPaymentModal}
              onEditLoan={handleOpenEditModal}
              onDeleteLoan={handleDeleteLoan}
              onTogglePin={handleTogglePin}
              onDeletePayment={handleDeletePayment}
              initialStatusTab={loansStatusTab}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              loans={loans}
              payments={payments}
              onResetAllData={handleResetAllData}
              defaultCurrency={homeCurrency}
              onUpdateDefaultCurrency={(c) => {
                setHomeCurrency(c);
                setThisMonthCurrency(c);
                setLoansCurrency(c);
              }}
            />
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      <LoanFormModal
        isOpen={isLoanModalOpen}
        onClose={() => {
          setIsLoanModalOpen(false);
          setEditingLoan(null);
        }}
        onSave={handleSaveLoan}
        initialLoan={editingLoan}
        activeCurrency={currentViewCurrency}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentLoan(null);
        }}
        loan={paymentLoan}
        onRecordPayment={handleRecordPayment}
      />

      {isHistoryModalOpen && historyLoan && (
        <PaymentHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setHistoryLoan(null);
          }}
          loan={historyLoan}
          payments={payments.filter((p) => p.loan_id === historyLoan.id)}
          onDeletePayment={async (paymentId: string) => {
            const p = payments.find((item) => item.id === paymentId);
            if (p) handleDeletePayment(p);
          }}
        />
      )}

      {/* ── Custom Deletion Confirmation Modals ── */}
      {loanToDelete && (
        <ConfirmModal
          isOpen={!!loanToDelete}
          onClose={() => {
            if (!isDeleting) setLoanToDelete(null);
          }}
          onConfirm={handleConfirmDeleteLoan}
          isLoading={isDeleting}
          title="Delete Loan?"
          confirmText="Delete Loan"
          icon="trash"
          itemSummary={{
            title: loanToDelete.lender_name,
            subtitle: `Loan Start Date: ${loanToDelete.start_date || 'N/A'}`,
            badge: loanToDelete.lender_type,
            details: [
              {
                label: 'Original Amount',
                value: formatCurrency(loanToDelete.original_amount, (loanToDelete.currency || 'INR') as Currency),
              },
              {
                label: 'Remaining Principal',
                value: formatCurrency(loanToDelete.remaining_principal, (loanToDelete.currency || 'INR') as Currency),
              },
            ],
          }}
        />
      )}

      {paymentToDelete && (
        <ConfirmModal
          isOpen={!!paymentToDelete}
          onClose={() => {
            if (!isDeleting) setPaymentToDelete(null);
          }}
          onConfirm={handleConfirmDeletePayment}
          isLoading={isDeleting}
          title="Delete Payment?"
          confirmText="Delete Payment"
          icon="trash"
          itemSummary={{
            title: formatCurrency(
              paymentToDelete.amount,
              (loans.find((l) => l.id === paymentToDelete.loan_id)?.currency || 'INR') as Currency
            ),
            subtitle: `Payment Date: ${paymentToDelete.payment_date}`,
            badge: paymentToDelete.destination || 'split',
            details: [
              {
                label: 'Principal Reduced',
                value: formatCurrency(
                  paymentToDelete.principal_portion || 0,
                  (loans.find((l) => l.id === paymentToDelete.loan_id)?.currency || 'INR') as Currency
                ),
              },
              {
                label: 'Interest Cleared',
                value: formatCurrency(
                  (paymentToDelete.interest_portion || 0) + (paymentToDelete.overdue_portion || 0),
                  (loans.find((l) => l.id === paymentToDelete.loan_id)?.currency || 'INR') as Currency
                ),
              },
            ],
          }}
        />
      )}

      {/* ── Loan Payoff Celebration Modal ── */}
      <CelebrationModal
        isOpen={!!celebrationData}
        onClose={() => setCelebrationData(null)}
        lenderName={celebrationData?.lenderName || ''}
        originalAmount={celebrationData?.originalAmount || 0}
        currency={celebrationData?.currency || 'INR'}
        onViewCompleted={() => {
          setCelebrationData(null);
          setLoansStatusTab('completed');
          handleTabChange('loans');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SelectedMonthProvider>
        <AppContent />
      </SelectedMonthProvider>
    </AuthProvider>
  );
}
