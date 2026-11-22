import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyInterest,
  getEffectiveAnnualRate,
  suggestPaymentSplit,
  recalculateLoanBalances,
  computeLoanTimeline,
  sortLoansForPayOrder,
  planMonthlyBudget,
} from './calculations';
import { Loan, Payment } from '@/types';

describe('Interest Calculations Engine', () => {
  it('correctly calculates percentage per month interest', () => {
    // 100,000 at 2% per month = 2,000
    const interest = calculateMonthlyInterest(100000, 'percentage_monthly', 2);
    expect(interest).toBe(2000);
  });

  it('correctly calculates percentage per year interest', () => {
    // 120,000 at 12% per year = 1,200 per month
    const interest = calculateMonthlyInterest(120000, 'percentage_yearly', 12);
    expect(interest).toBe(1200);
  });

  it('handles fixed monthly interest amount', () => {
    // Fixed 500 per month
    const interest = calculateMonthlyInterest(50000, 'fixed_monthly', 500);
    expect(interest).toBe(500);
  });

  it('handles zero interest loans', () => {
    const interest = calculateMonthlyInterest(50000, 'no_interest', 0);
    expect(interest).toBe(0);

    const zeroInterestLoan: Loan = {
      id: 'z1',
      household_id: 'h1',
      lender_name: 'Friend',
      lender_type: 'friend',
      original_amount: 1000,
      remaining_principal: 1000,
      interest_type: 'no_interest',
      interest_rate: 0,
      start_date: '2026-11-01',
      interest_due_day: 1,
      overdue_rule: 'carry_forward',
      priority: 'medium',
      sort_order: 1,
      is_pinned: false,
      is_archived: false,
      reminder_days_before: 3,
      currency: 'INR',
      created_at: '2026-11-01T00:00:00Z',
      updated_at: '2026-11-01T00:00:00Z',
      version: 1,
    };
    const timeline = computeLoanTimeline(zeroInterestLoan, [], new Date(2026, 10, 20));
    expect(timeline.currentMonthDue).toBe(0);
    expect(timeline.currentOverdue).toBe(0);
    expect(timeline.currentStatus).toBe('paid');
  });

  it('normalizes effective annual rates for comparison', () => {
    // 2% monthly = 24% annual
    expect(getEffectiveAnnualRate(10000, 'percentage_monthly', 2)).toBe(24);
    // 15% yearly = 15% annual
    expect(getEffectiveAnnualRate(10000, 'percentage_yearly', 15)).toBe(15);
    // 0% = 0%
    expect(getEffectiveAnnualRate(10000, 'no_interest', 0)).toBe(0);
  });

  it('auto-suggests payment split correctly (overdue -> interest -> principal)', () => {
    // Overdue: 300, Current Interest: 200, Total Paid: 800
    // Expected: 300 to overdue, 200 to interest, 300 to principal
    const split1 = suggestPaymentSplit(800, 300, 200);
    expect(split1.overduePortion).toBe(300);
    expect(split1.interestPortion).toBe(200);
    expect(split1.principalPortion).toBe(300);

    // Partial payment covering partial overdue
    const split2 = suggestPaymentSplit(200, 300, 200);
    expect(split2.overduePortion).toBe(200);
    expect(split2.interestPortion).toBe(0);
    expect(split2.principalPortion).toBe(0);

    // Partial payment covering all overdue + part of interest
    const split3 = suggestPaymentSplit(400, 300, 200);
    expect(split3.overduePortion).toBe(300);
    expect(split3.interestPortion).toBe(100);
    expect(split3.principalPortion).toBe(0);
  });

  it('ensures interest payments do NOT reduce principal and principal payments reduce principal', () => {
    const original = 50000;
    const payments: Payment[] = [
      {
        id: 'p1',
        loan_id: 'l1',
        household_id: 'h1',
        amount: 1000,
        payment_date: '2026-01-10',
        destination: 'interest',
        interest_portion: 1000,
        principal_portion: 0,
        overdue_portion: 0,
        running_balance: 50000,
        created_at: '2026-01-10T00:00:00Z',
        updated_at: '2026-01-10T00:00:00Z',
        created_by: 'test@example.com',
        version: 1,
      },
      {
        id: 'p2',
        loan_id: 'l1',
        household_id: 'h1',
        amount: 5000,
        payment_date: '2026-02-10',
        destination: 'principal',
        interest_portion: 0,
        principal_portion: 5000,
        overdue_portion: 0,
        running_balance: 45000,
        created_at: '2026-02-10T00:00:00Z',
        updated_at: '2026-02-10T00:00:00Z',
        created_by: 'test@example.com',
        version: 1,
      },
    ];

    const result = recalculateLoanBalances(original, payments);
    expect(result.updatedPayments[0].running_balance).toBe(50000);
    expect(result.updatedPayments[1].running_balance).toBe(45000);
    expect(result.remainingPrincipal).toBe(45000);
  });

  it('handles missed months and carries forward overdue interest', () => {
    const loan: Loan = {
      id: 'l_missed',
      household_id: 'h1',
      lender_name: 'Personal Loan',
      lender_type: 'bank',
      currency: 'INR',
      original_amount: 100000,
      remaining_principal: 100000,
      interest_type: 'percentage_monthly',
      interest_rate: 2, // 2,000 per month
      start_date: '2026-01-01',
      interest_due_day: 5,
      overdue_rule: 'carry_forward',
      priority: 'high',
      sort_order: 1,
      is_pinned: false,
      is_archived: false,
      reminder_days_before: 3,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: 1,
    };

    // As of 2026-03-10: Jan interest = 2000, Feb interest = 2000 (both missed => overdue = 4000).
    // Mar interest due = 2000.
    const asOf = new Date(2026, 2, 10); // March 10, 2026 local time
    const timeline = computeLoanTimeline(loan, [], asOf);

    expect(timeline.currentMonthDue).toBe(2000);
    expect(timeline.currentOverdue).toBe(4000);
  });

  it('compounds unpaid interest into principal when overdue_rule is compound', () => {
    const loan: Loan = {
      id: 'l_compound',
      household_id: 'h1',
      lender_name: 'Private Lender',
      lender_type: 'private_lender',
      currency: 'INR',
      original_amount: 100000,
      remaining_principal: 100000,
      interest_type: 'percentage_monthly',
      interest_rate: 2, // 2% per month
      start_date: '2026-01-01',
      interest_due_day: 5,
      overdue_rule: 'compound',
      priority: 'top',
      sort_order: 1,
      is_pinned: false,
      is_archived: false,
      reminder_days_before: 3,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      version: 1,
    };

    // Jan interest: 2000 unpaid -> compounds into principal for Feb (102,000).
    // Feb interest: 2% of 102,000 = 2040 unpaid -> compounds into principal for Mar (104,040).
    // In March (as of March 1), principal is 104,040.
    const asOf = new Date(2026, 2, 1); // March 1, 2026
    const timeline = computeLoanTimeline(loan, [], asOf);

    expect(timeline.remainingPrincipal).toBe(104040);
    expect(timeline.currentMonthDue).toBe(Math.round(104040 * 0.02 * 100) / 100);
  });

  it('sorts loans by avalanche (highest interest rate first) with pinned loans first', () => {
    const loans: Loan[] = [
      {
        id: '1',
        household_id: 'h1',
        lender_name: 'Low rate relative',
        lender_type: 'relative',
        currency: 'USD',
        original_amount: 10000,
        remaining_principal: 10000,
        interest_type: 'percentage_yearly',
        interest_rate: 4, // 4%
        start_date: '2026-01-01',
        interest_due_day: 1,
        overdue_rule: 'carry_forward',
        priority: 'low',
        sort_order: 3,
        is_pinned: false,
        is_archived: false,
        reminder_days_before: 3,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        version: 1,
      },
      {
        id: '2',
        household_id: 'h1',
        lender_name: 'High rate bank',
        lender_type: 'bank',
        currency: 'USD',
        original_amount: 5000,
        remaining_principal: 5000,
        interest_type: 'percentage_yearly',
        interest_rate: 18, // 18%
        start_date: '2026-01-01',
        interest_due_day: 1,
        overdue_rule: 'carry_forward',
        priority: 'high',
        sort_order: 1,
        is_pinned: false,
        is_archived: false,
        reminder_days_before: 3,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        version: 1,
      },
      {
        id: '3',
        household_id: 'h1',
        lender_name: 'Special Pinned Friend',
        lender_type: 'friend',
        currency: 'USD',
        original_amount: 2000,
        remaining_principal: 2000,
        interest_type: 'no_interest',
        interest_rate: 0,
        start_date: '2026-01-01',
        interest_due_day: 1,
        overdue_rule: 'carry_forward',
        priority: 'medium',
        sort_order: 2,
        is_pinned: true, // PINNED!
        is_archived: false,
        reminder_days_before: 3,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        version: 1,
      },
    ];

    const sorted = sortLoansForPayOrder(loans, 'highest_rate');
    // Pinned comes first even with 0% interest
    expect(sorted[0].id).toBe('3');
    // Then 18%
    expect(sorted[1].id).toBe('2');
    // Then 4%
    expect(sorted[2].id).toBe('1');
  });

  it('plans monthly budget allocation correctly across loans', () => {
    const loans: Loan[] = [
      {
        id: 'loan_a',
        household_id: 'h1',
        lender_name: 'Loan A',
        lender_type: 'bank',
        currency: 'USD',
        original_amount: 1000,
        remaining_principal: 1000,
        interest_type: 'percentage_yearly',
        interest_rate: 12, // $10/mo interest
        start_date: '2026-01-01',
        interest_due_day: 1,
        overdue_rule: 'carry_forward',
        priority: 'top',
        sort_order: 1,
        is_pinned: false,
        is_archived: false,
        reminder_days_before: 3,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        version: 1,
      },
    ];

    // As of Jan 2026: Budget: $210. Interest due = $10. Surplus $200 goes to principal on Loan A.
    const asOfJan = new Date(2026, 0, 15);
    const plan = planMonthlyBudget(loans, [], 210, 'USD', 'highest_rate', asOfJan);
    expect(plan.totalMinimumDue).toBe(10);
    expect(plan.allocations[0].extraPrincipalAllocated).toBe(200);
    expect(plan.allocations[0].totalAllocated).toBe(210);
    expect(plan.allocations[0].projectedMonthsToPayoff).toBe(5); // 1000 / 200 = 5 months
  });
});
