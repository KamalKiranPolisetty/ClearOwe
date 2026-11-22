import { Currency } from '@/types';

/**
 * Formats a number with Indian grouping for INR (e.g. 1,50,000) or standard grouping for USD (150,000).
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  includeDecimals: boolean = false
): string {
  const rounded = includeDecimals 
    ? Math.round(amount * 100) / 100 
    : Math.round(amount);

  if (currency === 'INR') {
    // Format using en-IN locale
    const formatted = rounded.toLocaleString('en-IN', {
      minimumFractionDigits: includeDecimals ? 2 : 0,
      maximumFractionDigits: includeDecimals ? 2 : 0,
    });
    return `₹${formatted}`;
  }

  // USD
  const formatted = rounded.toLocaleString('en-US', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  return `$${formatted}`;
}

/**
 * Converts an amount from one currency to another using the manual USD-to-INR exchange rate.
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  usdToInrRate: number = 83.5
): number {
  if (from === to) return amount;
  if (from === 'USD' && to === 'INR') {
    return Math.round(amount * usdToInrRate * 100) / 100;
  }
  if (from === 'INR' && to === 'USD') {
    return Math.round((amount / (usdToInrRate || 83.5)) * 100) / 100;
  }
  return amount;
}

/**
 * Formats a date string (YYYY-MM-DD) into a human friendly format (e.g., "15 Oct 2026").
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2].slice(0, 2), 10);

    const monthNamesEn = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return `${day} ${monthNamesEn[month]} ${year}`;
  }
  return dateStr;
}

/**
 * Formats a month key (YYYY-MM) into e.g. "October 2026"
 */
export function formatMonthName(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const year = parseInt(yearStr, 10);

  const fullMonthsEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return `${fullMonthsEn[monthIdx]} ${year}`;
}

/**
 * Formats a Date object to YYYY-MM-DD local date string.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date object to YYYY-MM local month string.
 */
export function formatLocalMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

