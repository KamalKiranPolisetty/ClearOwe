import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Loan, Payment } from '@/types';

const LOCAL_LOANS_KEY = (uid: string) => `clearowe_loans_${uid}`;
const LOCAL_PAYMENTS_KEY = (uid: string) => `clearowe_payments_${uid}`;

const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// ── Profiles ──
export async function getProfile(userId: string) {
  if (!isSupabaseConfigured || !supabase || !isUuid(userId)) return null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return data;
  } catch (err) {
    console.warn('getProfile exception:', err);
    return null;
  }
}

export async function updateProfile(userId: string, updates: { display_name?: string; primary_currency?: string }) {
  if (!isSupabaseConfigured || !supabase || !isUuid(userId)) return;
  try {
    await supabase.from('profiles').upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('updateProfile error:', err);
  }
}

// ── Loans ──
export async function fetchLoans(userId: string): Promise<Loan[]> {
  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Loan[];
      }
    } catch (err) {
      console.warn('fetchLoans supabase error, falling back to local storage:', err);
    }
  }

  // Fallback to localStorage for guest or offline mode
  try {
    const raw = localStorage.getItem(LOCAL_LOANS_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addLoan(userId: string, loanData: Partial<Loan>): Promise<Loan> {
  const newLoan: Loan = {
    id: loanData.id || crypto.randomUUID(),
    user_id: userId,
    lender_name: loanData.lender_name || 'Unnamed Lender',
    lender_type: loanData.lender_type || 'bank',
    currency: loanData.currency || 'INR',
    original_amount: Number(loanData.original_amount) || 0,
    remaining_principal: Number(loanData.remaining_principal) || 0,
    interest_type: loanData.interest_type || 'percentage_monthly',
    interest_rate: Number(loanData.interest_rate) || 0,
    start_date: loanData.start_date || new Date().toISOString().slice(0, 10),
    interest_due_day: Number(loanData.interest_due_day) || 1,
    overdue_rule: loanData.overdue_rule || 'carry_forward',
    priority: loanData.priority || 'high',
    sort_order: loanData.sort_order || 0,
    is_pinned: loanData.is_pinned || false,
    is_archived: false,
    notes: loanData.notes || '',
    reminder_days_before: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    version: 1,
  };

  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      // Exclude client-only fields that do not exist in DB schema
      const { version, ...dbPayload } = newLoan;

      const { data, error } = await supabase
        .from('loans')
        .insert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        return { ...data, version: 1 } as Loan;
      }
      if (error) {
        console.warn('addLoan supabase insert error:', error.message);
      }
    } catch (err) {
      console.warn('addLoan supabase error, saving locally:', err);
    }
  }

  // Local storage save
  try {
    const existing = await fetchLoans(userId);
    const updated = [newLoan, ...existing.filter((l) => l.id !== newLoan.id)];
    localStorage.setItem(LOCAL_LOANS_KEY(userId), JSON.stringify(updated));
  } catch {}

  return newLoan;
}

export async function updateLoan(id: string, userId: string, updates: Partial<Loan>): Promise<void> {
  const { version, id: _id, ...cleanUpdates } = updates;
  const payload = {
    ...cleanUpdates,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      const { error } = await supabase
        .from('loans')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.warn('updateLoan supabase error:', error.message);
      }
    } catch (err) {
      console.warn('updateLoan supabase error, updating locally:', err);
    }
  }

  try {
    const existing = await fetchLoans(userId);
    const updated = existing.map((l) => (l.id === id ? { ...l, ...payload } : l));
    localStorage.setItem(LOCAL_LOANS_KEY(userId), JSON.stringify(updated));
  } catch {}
}

export async function deleteLoan(id: string, userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      await supabase.from('loans').delete().eq('id', id).eq('user_id', userId);
    } catch (err) {
      console.warn('deleteLoan supabase error:', err);
    }
  }

  try {
    const existing = await fetchLoans(userId);
    const updated = existing.filter((l) => l.id !== id);
    localStorage.setItem(LOCAL_LOANS_KEY(userId), JSON.stringify(updated));
  } catch {}
}

// ── Payments ──
export async function fetchPayments(userId: string): Promise<Payment[]> {
  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('payment_date', { ascending: false });

      if (!error && data) {
        return data as Payment[];
      }
    } catch (err) {
      console.warn('fetchPayments supabase error, falling back to local storage:', err);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_PAYMENTS_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addPayment(userId: string, paymentData: Partial<Payment>): Promise<Payment> {
  const newPayment: Payment = {
    id: paymentData.id || crypto.randomUUID(),
    loan_id: paymentData.loan_id || '',
    user_id: userId,
    amount: Number(paymentData.amount) || 0,
    payment_date: paymentData.payment_date || new Date().toISOString().slice(0, 10),
    destination: paymentData.destination || 'split',
    principal_portion: Number(paymentData.principal_portion) || 0,
    interest_portion: Number(paymentData.interest_portion) || 0,
    overdue_portion: Number(paymentData.overdue_portion) || 0,
    notes: paymentData.notes || '',
    running_balance: Number(paymentData.running_balance) || 0,
    created_at: new Date().toISOString(),
    created_by: 'You',
    version: 1,
  };

  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      // Exclude client-only fields that do not exist in DB schema
      const { version, created_by, ...dbPayload } = newPayment;

      const { data, error } = await supabase
        .from('payments')
        .insert(dbPayload)
        .select()
        .single();

      if (!error && data) {
        return { ...data, created_by: 'You', version: 1 } as Payment;
      }
      if (error) {
        console.warn('addPayment supabase error:', error.message);
      }
    } catch (err) {
      console.warn('addPayment supabase error, saving locally:', err);
    }
  }

  try {
    const existing = await fetchPayments(userId);
    const updated = [newPayment, ...existing.filter((p) => p.id !== newPayment.id)];
    localStorage.setItem(LOCAL_PAYMENTS_KEY(userId), JSON.stringify(updated));
  } catch {}

  return newPayment;
}

export async function deletePayment(id: string, userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      await supabase.from('payments').delete().eq('id', id).eq('user_id', userId);
    } catch (err) {
      console.warn('deletePayment supabase error:', err);
    }
  }

  try {
    const existing = await fetchPayments(userId);
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(LOCAL_PAYMENTS_KEY(userId), JSON.stringify(updated));
  } catch {}
}

export async function resetAllUserData(userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase && isUuid(userId)) {
    try {
      await supabase.from('payments').delete().eq('user_id', userId);
      await supabase.from('loans').delete().eq('user_id', userId);
    } catch (err) {
      console.warn('resetAllUserData supabase error:', err);
    }
  }

  try {
    localStorage.removeItem(LOCAL_LOANS_KEY(userId));
    localStorage.removeItem(LOCAL_PAYMENTS_KEY(userId));
  } catch {}
}
