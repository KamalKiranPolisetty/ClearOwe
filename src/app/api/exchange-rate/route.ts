import { NextResponse } from 'next/server';

export async function GET() {
  const sources = [
    async () => {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR', {
        next: { revalidate: 3600 }, // Cache 1 hour
      });
      if (!res.ok) throw new Error('Frankfurter failed');
      const data = await res.json();
      return Number(data.rates?.INR);
    },
    async () => {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        next: { revalidate: 3600 },
      });
      if (!res.ok) throw new Error('ExchangeRate-API failed');
      const data = await res.json();
      return Number(data.rates?.INR);
    },
  ];

  for (const source of sources) {
    try {
      const rate = await source();
      if (rate && rate > 0) {
        return NextResponse.json({ rate, source: 'live' });
      }
    } catch {
      // try next
    }
  }

  // Fallback rate
  return NextResponse.json({ rate: 86.5, source: 'fallback' });
}
