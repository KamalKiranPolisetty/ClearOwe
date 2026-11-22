export type Currency = 'USD' | 'INR';

export type LenderType = 'bank' | 'relative' | 'friend' | 'private_lender' | 'other';

export type InterestType = 
  | 'percentage_monthly' 
  | 'percentage_yearly' 
  | 'fixed_monthly' 
  | 'no_interest';

export type OverdueRule = 'carry_forward' | 'compound';

export type PriorityLevel = 'top' | 'high' | 'medium' | 'low';

export type LoanStatus = 'paid' | 'unpaid' | 'partially_paid' | 'overdue';

export type NavTab = 'home' | 'this-month' | 'loans' | 'settings';
export type TabType = NavTab;

export type SortOption =
  | 'avalanche'
  | 'monthly_interest'
  | 'largest_balance'
  | 'smallest_balance'
  | 'my_priority';

export type LoanPriority = PriorityLevel;

export type PaymentDestination = 'interest' | 'principal' | 'split';

export interface Loan {
  id: string;
  user_id?: string;
  household_id?: string;
  lender_name: string;
  lender_type: LenderType;
  lender_phone?: string;
  currency: Currency;
  original_amount: number;
  remaining_principal: number;
  interest_type: InterestType;
  interest_rate: number; // monthly %, yearly %, or fixed amount per month
  start_date: string; // ISO string YYYY-MM-DD
  interest_due_day: number; // 1 to 31
  overdue_rule: OverdueRule;
  priority: PriorityLevel;
  sort_order: number;
  is_pinned: boolean;
  is_archived: boolean;
  notes?: string;
  reminder_days_before: number; // default e.g. 3 or 5
  created_at: string;
  updated_at: string;
  created_by?: string; // user email / id
  version: number; // for conflict resolution
}

export interface LoanWithStatus extends Loan {
  interest_due_this_month: number;
  overdue_interest: number;
  total_interest_paid: number;
  total_principal_paid: number;
  status: LoanStatus;
}

export interface Payment {
  id: string;
  user_id?: string;
  loan_id: string;
  household_id?: string;
  amount: number;
  payment_date: string; // ISO string YYYY-MM-DD
  destination: PaymentDestination;
  interest_portion: number;
  principal_portion: number;
  overdue_portion: number;
  notes?: string;
  running_balance: number; // remaining principal after this payment
  created_at: string;
  updated_at?: string;
  created_by: string; // user name/email who recorded it
  version: number;
}

export interface MonthDueRecord {
  monthKey: string; // YYYY-MM
  loanId: string;
  dueDate: string;
  interestDue: number;
  interestPaid: number;
  principalPaid: number;
  overdueAmount: number;
  status: LoanStatus;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
}

export interface Household {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  user_email: string;
  role: 'owner' | 'member';
  joined_at: string;
}

export interface UserSettings {
  language: 'en';
  theme: 'light' | 'dark' | 'system';
  usd_to_inr_rate: number;
  show_combined_currency: boolean;
  combined_currency_target: Currency;
  notifications_enabled: boolean;
  default_reminder_days: number;
  has_completed_onboarding: boolean;
  household_id?: string;
}

export interface SyncQueueItem {
  id: string;
  table: 'loans' | 'payments' | 'settings';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}
