import { InterestType, Loan, Payment, LoanStatus, LoanWithStatus } from '@/types';

/**
 * Safely parses a YYYY-MM-DD string into a local Date without UTC offset drift.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2].slice(0, 2), 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Formats a Date to YYYY-MM-DD in local time.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date to YYYY-MM in local time.
 */
export function formatLocalMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Calculates monthly interest due on a given principal amount.
 */
export function calculateMonthlyInterest(
  principal: number,
  interestType: InterestType,
  rate: number
): number {
  if (principal <= 0) return 0;
  
  switch (interestType) {
    case 'percentage_monthly':
      // rate is in % per month (e.g. 2% = 0.02)
      return Math.round((principal * (rate / 100)) * 100) / 100;
    case 'percentage_yearly':
      // rate is in % per year (e.g. 12% per year = 1% per month)
      return Math.round(((principal * (rate / 100)) / 12) * 100) / 100;
    case 'fixed_monthly':
      // fixed amount per month
      return Math.max(0, rate);
    case 'no_interest':
      return 0;
    default:
      return 0;
  }
}

/**
 * Converts any interest type to an effective annual percentage rate for fair comparison.
 */
export function getEffectiveAnnualRate(
  principal: number,
  interestType: InterestType,
  rate: number
): number {
  if (interestType === 'no_interest') return 0;
  if (interestType === 'percentage_yearly') return rate;
  if (interestType === 'percentage_monthly') return rate * 12;
  if (interestType === 'fixed_monthly') {
    if (principal <= 0) return 0;
    return Math.round(((rate * 12) / principal) * 100 * 100) / 100;
  }
  return 0;
}

/**
 * Auto-suggests how a payment amount should be split:
 * 1. Clear overdue interest first
 * 2. Clear current month interest due
 * 3. Any excess goes directly to principal reduction
 */
export function suggestPaymentSplit(
  amount: number,
  overdueAmount: number,
  interestDue: number
): { overduePortion: number; interestPortion: number; principalPortion: number } {
  if (amount <= 0) {
    return { overduePortion: 0, interestPortion: 0, principalPortion: 0 };
  }

  const overduePortion = Math.min(amount, Math.max(0, overdueAmount));
  const remainingAfterOverdue = Math.max(0, amount - overduePortion);
  
  const interestPortion = Math.min(remainingAfterOverdue, Math.max(0, interestDue));
  const principalPortion = Math.max(0, remainingAfterOverdue - interestPortion);

  return {
    overduePortion: Math.round(overduePortion * 100) / 100,
    interestPortion: Math.round(interestPortion * 100) / 100,
    principalPortion: Math.round(principalPortion * 100) / 100,
  };
}

/**
 * Recalculates running balances for all payments of a loan in chronological order.
 * Interest payments do NOT reduce principal. Principal payments reduce remaining principal.
 */
export function recalculateLoanBalances(
  originalAmount: number,
  payments: Payment[]
): { updatedPayments: Payment[]; remainingPrincipal: number } {
  // Sort payments by date ascending
  const sorted = [...payments].sort((a, b) => {
    const dateDiff = parseLocalDate(a.payment_date).getTime() - parseLocalDate(b.payment_date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  let currentBalance = originalAmount;
  const updatedPayments = sorted.map((p) => {
    // Only principal portion reduces balance
    currentBalance = Math.max(0, currentBalance - (p.principal_portion || 0));
    return {
      ...p,
      running_balance: Math.round(currentBalance * 100) / 100,
    };
  });

  return {
    updatedPayments,
    remainingPrincipal: Math.round(currentBalance * 100) / 100,
  };
}

export interface LoanMonthState {
  monthKey: string; // YYYY-MM
  interestDue: number;
  overdueAmount: number;
  interestPaid: number;
  principalPaid: number;
  status: LoanStatus;
  isOverdue: boolean;
  dueDate: string; // YYYY-MM-DD
}

/**
 * Computes the month-by-month financial state for a loan from start date to target date.
 * Handles missed months, carrying forward overdue interest, or compounding into principal.
 */
export function computeLoanTimeline(
  loan: Loan,
  payments: Payment[],
  asOfDate: Date = new Date()
): {
  monthlyStates: Map<string, LoanMonthState>;
  currentMonthDue: number;
  currentOverdue: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  remainingPrincipal: number;
  currentStatus: LoanStatus;
} {
  const startDate = parseLocalDate(loan.start_date);
  let curYear = startDate.getFullYear();
  let curMonth = startDate.getMonth(); // 0-indexed

  const targetYear = asOfDate.getFullYear();
  const targetMonth = asOfDate.getMonth();
  const todayDay = asOfDate.getDate();

  let principal = loan.original_amount;
  let accumulatedOverdue = 0;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;

  const monthlyStates = new Map<string, LoanMonthState>();

  // Filter payments for this loan
  const loanPayments = payments.filter((p) => p.loan_id === loan.id);

  while (
    curYear < targetYear ||
    (curYear === targetYear && curMonth <= targetMonth)
  ) {
    const monthKey = `${curYear}-${String(curMonth + 1).padStart(2, '0')}`;
    const daysInThisMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const dueDay = Math.min(loan.interest_due_day || 1, daysInThisMonth);
    const dueDateStr = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

    // Interest due for this month on current principal
    const monthInterest = calculateMonthlyInterest(principal, loan.interest_type, loan.interest_rate);

    // Payments in this month
    const thisMonthPayments = loanPayments.filter((p) => {
      const pDate = parseLocalDate(p.payment_date);
      return pDate.getFullYear() === curYear && pDate.getMonth() === curMonth;
    });

    const monthPrincipalPaid = thisMonthPayments.reduce((acc, p) => acc + (p.principal_portion || 0), 0);
    const monthInterestPaid = thisMonthPayments.reduce(
      (acc, p) => acc + (p.interest_portion || 0) + (p.overdue_portion || 0),
      0
    );

    totalPrincipalPaid += monthPrincipalPaid;
    totalInterestPaid += monthInterestPaid;

    // Principal reduction from this month's payments
    principal = Math.max(0, principal - monthPrincipalPaid);

    // Total due in this month = this month's interest + accumulated overdue from previous months
    const totalDueThisMonth = monthInterest + accumulatedOverdue;
    const unpaidAmount = Math.max(0, totalDueThisMonth - monthInterestPaid);

    const isCurrent = curYear === targetYear && curMonth === targetMonth;
    const isPastDue = isCurrent ? todayDay > dueDay : true;

    let status: LoanStatus = 'unpaid';
    if (unpaidAmount <= 0.01) {
      // All monthly obligations (interest & overdue) are settled or zero
      status = 'paid';
    } else if (monthInterestPaid > 0) {
      status = 'partially_paid';
    } else if (isPastDue && totalDueThisMonth > 0) {
      status = 'overdue';
    } else {
      status = 'unpaid';
    }

    monthlyStates.set(monthKey, {
      monthKey,
      interestDue: monthInterest,
      overdueAmount: accumulatedOverdue,
      interestPaid: monthInterestPaid,
      principalPaid: monthPrincipalPaid,
      status,
      isOverdue: isPastDue && unpaidAmount > 0.01,
      dueDate: dueDateStr,
    });

    // Advance to next month: compounding or carry-forward only applies when moving past a closed month
    if (!isCurrent) {
      if (loan.overdue_rule === 'compound') {
        principal = Math.round((principal + unpaidAmount) * 100) / 100;
        accumulatedOverdue = 0;
      } else {
        accumulatedOverdue = Math.round(unpaidAmount * 100) / 100;
      }
    }

    curMonth++;
    if (curMonth > 11) {
      curMonth = 0;
      curYear++;
    }
  }

  const currentMonthKey = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
  const fallbackInterestDue = calculateMonthlyInterest(principal, loan.interest_type, loan.interest_rate);
  const currentMonthState = monthlyStates.get(currentMonthKey) || {
    monthKey: currentMonthKey,
    interestDue: fallbackInterestDue,
    overdueAmount: accumulatedOverdue,
    interestPaid: 0,
    principalPaid: 0,
    status: (fallbackInterestDue <= 0.01 && accumulatedOverdue <= 0.01 ? 'paid' : 'unpaid') as LoanStatus,
    isOverdue: false,
    dueDate: `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`,
  };

  return {
    monthlyStates,
    currentMonthDue: currentMonthState.interestDue,
    currentOverdue: currentMonthState.overdueAmount,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalPrincipalPaid: Math.round(totalPrincipalPaid * 100) / 100,
    remainingPrincipal: Math.round(principal * 100) / 100,
    currentStatus: currentMonthState.status,
  };
}

export type SortStrategy = 
  | 'my_priority'
  | 'highest_rate'
  | 'highest_amount'
  | 'largest_balance'
  | 'smallest_balance';

/**
 * Sorts loans according to pay order strategy with pinned loans always prioritized first.
 */
export function sortLoansForPayOrder(
  loans: Loan[],
  strategy: SortStrategy = 'highest_rate'
): Loan[] {
  const priorityRank: Record<string, number> = { top: 4, high: 3, medium: 2, low: 1 };

  return [...loans].sort((a, b) => {
    // 1. Pinned loans always come first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    switch (strategy) {
      case 'highest_rate': {
        const rateA = getEffectiveAnnualRate(a.remaining_principal, a.interest_type, a.interest_rate);
        const rateB = getEffectiveAnnualRate(b.remaining_principal, b.interest_type, b.interest_rate);
        return rateB - rateA;
      }
      case 'highest_amount': {
        const amtA = calculateMonthlyInterest(a.remaining_principal, a.interest_type, a.interest_rate);
        const amtB = calculateMonthlyInterest(b.remaining_principal, b.interest_type, b.interest_rate);
        return amtB - amtA;
      }
      case 'largest_balance':
        return b.remaining_principal - a.remaining_principal;
      case 'smallest_balance':
        return a.remaining_principal - b.remaining_principal;
      case 'my_priority':
      default: {
        const rankDiff = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        if (rankDiff !== 0) return rankDiff;
        return a.sort_order - b.sort_order;
      }
    }
  });
}

export interface BudgetAllocationItem {
  loanId: string;
  lenderName: string;
  remainingPrincipal: number;
  interestDue: number;
  overdueDue: number;
  minimumDue: number;
  extraPrincipalAllocated: number;
  totalAllocated: number;
  projectedMonthsToPayoff: number;
}

export interface BudgetPlanResult {
  currency: 'USD' | 'INR';
  totalBudget: number;
  totalMinimumDue: number;
  totalExtraAllocated: number;
  isBudgetDeficit: boolean;
  allocations: BudgetAllocationItem[];
  overallProjectedPayoffMonths: number;
}

/**
 * Allocates a family's monthly repayment budget across loans:
 * 1. Covers minimum interest + overdue across all loans first.
 * 2. Allocates any surplus budget to principal on the top priority loan (avalanche/pinned).
 * 3. Computes projected payoff timelines.
 */
export function planMonthlyBudget(
  loans: Loan[],
  payments: Payment[],
  monthlyBudget: number,
  currency: 'USD' | 'INR',
  strategy: SortStrategy = 'highest_rate',
  asOfDate: Date = new Date()
): BudgetPlanResult {
  const activeLoans = loans.filter((l) => !l.is_archived && l.currency === currency && l.remaining_principal > 0);
  const sortedLoans = sortLoansForPayOrder(activeLoans, strategy);

  // Compute dues for each loan
  const loanDues = sortedLoans.map((loan) => {
    const timeline = computeLoanTimeline(loan, payments, asOfDate);
    const minDue = Math.round((timeline.currentMonthDue + timeline.currentOverdue) * 100) / 100;
    return {
      loan,
      interestDue: timeline.currentMonthDue,
      overdueDue: timeline.currentOverdue,
      minDue,
    };
  });

  const totalMinimumDue = Math.round(loanDues.reduce((acc, item) => acc + item.minDue, 0) * 100) / 100;
  const isBudgetDeficit = monthlyBudget < totalMinimumDue;
  let remainingSurplus = Math.max(0, monthlyBudget - totalMinimumDue);

  const allocations: BudgetAllocationItem[] = [];

  // Allocate surplus to principal in priority order
  for (const item of loanDues) {
    let extraForThisLoan = 0;
    if (remainingSurplus > 0) {
      extraForThisLoan = Math.min(remainingSurplus, item.loan.remaining_principal);
      remainingSurplus -= extraForThisLoan;
    }

    const totalAllocated = Math.round((item.minDue + extraForThisLoan) * 100) / 100;

    // Estimate payoff months under this monthly principal reduction
    let projectedMonths = 0;
    if (extraForThisLoan > 0) {
      projectedMonths = Math.ceil(item.loan.remaining_principal / extraForThisLoan);
    } else {
      projectedMonths = 999; // Interest-only or underfunded
    }

    allocations.push({
      loanId: item.loan.id,
      lenderName: item.loan.lender_name,
      remainingPrincipal: item.loan.remaining_principal,
      interestDue: item.interestDue,
      overdueDue: item.overdueDue,
      minimumDue: item.minDue,
      extraPrincipalAllocated: Math.round(extraForThisLoan * 100) / 100,
      totalAllocated,
      projectedMonthsToPayoff: projectedMonths,
    });
  }

  // Calculate overall months until all loans in this currency are paid
  let overallProjectedPayoffMonths = 0;
  if (monthlyBudget > totalMinimumDue) {
    const totalPrincipal = activeLoans.reduce((sum, l) => sum + l.remaining_principal, 0);
    const monthlyPrincipalPower = monthlyBudget - totalMinimumDue;
    overallProjectedPayoffMonths = Math.ceil(totalPrincipal / monthlyPrincipalPower);
  }

  return {
    currency,
    totalBudget: monthlyBudget,
    totalMinimumDue,
    totalExtraAllocated: Math.round((monthlyBudget - totalMinimumDue - remainingSurplus) * 100) / 100,
    isBudgetDeficit,
    allocations,
    overallProjectedPayoffMonths,
  };
}

/**
 * Estimates the extra interest cost of manually pinning a lower-rate loan to the top.
 */
export function estimatePinningCost(
  pinnedLoan: Loan,
  allLoans: Loan[],
  monthlyBudget: number
): number {
  if (!pinnedLoan.is_pinned || pinnedLoan.remaining_principal <= 0) return 0;
  
  // Find highest rate loan that is not pinned
  const activeUnpinned = allLoans
    .filter((l) => !l.is_archived && l.currency === pinnedLoan.currency && !l.is_pinned && l.remaining_principal > 0)
    .sort((a, b) => {
      const rateA = getEffectiveAnnualRate(a.remaining_principal, a.interest_type, a.interest_rate);
      const rateB = getEffectiveAnnualRate(b.remaining_principal, b.interest_type, b.interest_rate);
      return rateB - rateA;
    });

  if (activeUnpinned.length === 0) return 0;

  const highestRateLoan = activeUnpinned[0];
  const pinnedAnnualRate = getEffectiveAnnualRate(pinnedLoan.remaining_principal, pinnedLoan.interest_type, pinnedLoan.interest_rate);
  const highestAnnualRate = getEffectiveAnnualRate(highestRateLoan.remaining_principal, highestRateLoan.interest_type, highestRateLoan.interest_rate);

  if (pinnedAnnualRate >= highestAnnualRate) return 0; // Pinned loan already has equal or higher rate

  // Rate difference in decimal per year
  const rateDiffAnnual = (highestAnnualRate - pinnedAnnualRate) / 100;
  // Estimate months pinned loan takes to pay off
  const monthlyExtra = Math.max(50, monthlyBudget * 0.4);
  const months = Math.min(24, Math.ceil(pinnedLoan.remaining_principal / monthlyExtra));
  
  // Extra interest incurred roughly on highest loan while waiting:
  const extraInterest = (pinnedLoan.remaining_principal / 2) * rateDiffAnnual * (months / 12);
  return Math.max(0, Math.round(extraInterest));
}

export function monthsToPayoff(principal: number, rate: number, interestType: InterestType): number {
  if (principal <= 0) return 0;
  const annualRate = getEffectiveAnnualRate(principal, interestType, rate);
  if (annualRate <= 0) return 12;
  // Estimate with a standard 10% monthly repayment
  return Math.max(1, Math.min(120, Math.ceil(principal / Math.max(principal * 0.08, 100))));
}

export function totalInterestRemaining(
  principal: number,
  rate: number,
  interestType: InterestType,
  months: number = 12
): number {
  if (principal <= 0) return 0;
  const monthlyInterest = calculateMonthlyInterest(principal, interestType, rate);
  return Math.round(monthlyInterest * months);
}

export function sortLoans(loans: (Loan | LoanWithStatus)[], option: string = 'avalanche'): (Loan | LoanWithStatus)[] {
  const strategyMap: Record<string, SortStrategy> = {
    avalanche: 'highest_rate',
    monthly_interest: 'highest_amount',
    largest_balance: 'largest_balance',
    smallest_balance: 'smallest_balance',
    my_priority: 'my_priority',
  };
  return sortLoansForPayOrder(loans, strategyMap[option] || 'highest_rate');
}

export function planBudgetWaterfall(loans: Loan[], budget: number) {
  const currency = loans[0]?.currency || 'INR';
  const res = planMonthlyBudget(loans, [], budget, currency);
  return {
    totalAllocated: res.totalBudget - (res.isBudgetDeficit ? res.totalMinimumDue - res.totalBudget : 0),
    allocations: res.allocations.map((a) => ({
      loanId: a.loanId,
      lenderName: a.lenderName,
      interestAllocated: a.minimumDue,
      principalAllocated: a.extraPrincipalAllocated,
      totalPayment: a.totalAllocated,
    })),
  };
}

export function computeLoansWithStatus(loans: Loan[], payments: Payment[], asOfDate: Date = new Date()): LoanWithStatus[] {
  if (!Array.isArray(loans)) return [];
  return loans.map((loan) => {
    const timeline = computeLoanTimeline(loan, payments, asOfDate);
    return {
      ...loan,
      remaining_principal: timeline.remainingPrincipal,
      interest_due_this_month: timeline.currentMonthDue,
      overdue_interest: timeline.currentOverdue,
      total_interest_paid: timeline.totalInterestPaid,
      total_principal_paid: timeline.totalPrincipalPaid,
      status: timeline.currentStatus,
    };
  });
}

