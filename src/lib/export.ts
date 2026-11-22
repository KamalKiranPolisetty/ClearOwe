import { Loan, Payment } from '@/types';

/**
 * Exports loans and payments as an Excel-compatible CSV file with UTF-8 BOM.
 */
export function exportToCSV(loans: Loan[], payments: Payment[]): void {
  const BOM = '\uFEFF';
  let csvContent = BOM;

  // 1. Loans Section
  csvContent += 'LOANS SUMMARY\n';
  csvContent += 'ID,Lender Name,Lender Type,Currency,Original Amount,Remaining Principal,Interest Type,Interest Rate,Start Date,Due Day,Overdue Rule,Archived,Notes\n';

  loans.forEach((l) => {
    const row = [
      `"${l.id}"`,
      `"${l.lender_name.replace(/"/g, '""')}"`,
      `"${l.lender_type}"`,
      `"${l.currency}"`,
      l.original_amount,
      l.remaining_principal,
      `"${l.interest_type}"`,
      l.interest_rate,
      `"${l.start_date}"`,
      l.interest_due_day,
      `"${l.overdue_rule}"`,
      l.is_archived ? 'YES' : 'NO',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\n\n';

  // 2. Payments Section
  csvContent += 'PAYMENTS HISTORY\n';
  csvContent += 'Payment ID,Loan ID,Lender Name,Payment Date,Total Amount,Destination,Interest Portion,Principal Portion,Overdue Portion,Running Balance,Logged By,Notes\n';

  const loanMap = new Map(loans.map((l) => [l.id, l]));

  payments.forEach((p) => {
    const loan = loanMap.get(p.loan_id);
    const row = [
      `"${p.id}"`,
      `"${p.loan_id}"`,
      `"${(loan?.lender_name || '').replace(/"/g, '""')}"`,
      `"${p.payment_date}"`,
      p.amount,
      `"${p.destination}"`,
      p.interest_portion,
      p.principal_portion,
      p.overdue_portion,
      p.running_balance,
      `"${(p.created_by || '').replace(/"/g, '""')}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ];
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ClearOwe_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const exportLoansToCSV = exportToCSV;
