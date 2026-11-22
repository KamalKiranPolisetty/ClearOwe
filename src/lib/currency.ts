export type Currency = 'INR' | 'USD';
export type CurrencyDisplayMode = 'both' | 'inr_only' | 'usd_only';

const CURRENCY_MODE_KEY = (userId?: string) => `ss_currency_mode_${userId ?? 'guest'}`;

const memoryCurrencyMode: Record<string, CurrencyDisplayMode> = {};
let memoryActiveMode: CurrencyDisplayMode | null = null;

export function getCurrencyDisplayMode(userId?: string): CurrencyDisplayMode {
  try {
    const targetId = userId || 'guest';
    if (memoryCurrencyMode[targetId]) return memoryCurrencyMode[targetId];
    if (!userId && memoryActiveMode) return memoryActiveMode;
    if (typeof localStorage !== "undefined") {
      const key = userId ? CURRENCY_MODE_KEY(userId) : 'ss_active_currency_mode';
      let val = localStorage.getItem(key);
      if (!val && userId) val = localStorage.getItem('ss_active_currency_mode');
      if (val === 'inr_only' || val === 'usd_only' || val === 'both') return val;
    }
  } catch { /* ignore */ }
  return memoryActiveMode || 'both';
}

export function setCurrencyDisplayMode(userId: string | undefined, mode: CurrencyDisplayMode) {
  try {
    const targetId = userId || 'guest';
    memoryCurrencyMode[targetId] = mode;
    memoryActiveMode = mode;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CURRENCY_MODE_KEY(targetId), mode);
      localStorage.setItem('ss_active_currency_mode', mode);
    }
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new Event('ss_currency_mode_changed'));
    }
  } catch { /* ignore */ }
}

export function formatCurrency(amount: number, currency: Currency | string): string {
  // USD shows cents; INR shows whole rupees with Indian comma grouping (e.g. 1,50,000).
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const NB = '\u00a0';
  if (currency === 'USD') {
    return '$' + NB + safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '₹' + NB + Math.round(safeAmount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
];
