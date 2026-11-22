const CACHE_KEY = "clearowe_fx_usd_inr";

interface CachedRate {
  rate: number;
  date: string; // YYYY-MM-DD
}

function todayYMD(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readRawCache(): CachedRate | null {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(CACHE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw) as CachedRate;
  } catch {
    return null;
  }
}

function readCache(): number | null {
  const cached = readRawCache();
  if (!cached) return null;
  return cached.date === todayYMD() ? cached.rate : null;
}

export function writeCache(rate: number) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, date: todayYMD() }));
    }
  } catch {
    /* ignore */
  }
}

export async function getUsdToInr(): Promise<number> {
  const cached = readCache();
  if (cached) return cached;

  try {
    const res = await fetch("/api/exchange-rate");
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.rate === "number" && data.rate > 0) {
        writeCache(data.rate);
        return data.rate;
      }
    }
  } catch {
    /* ignore network failure */
  }

  const stale = readRawCache();
  if (stale && stale.rate > 0) return stale.rate;

  return 86.5; // Reasonable fallback rate if offline
}
