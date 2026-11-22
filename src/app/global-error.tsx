'use client';

import { useEffect } from 'react';
import { AppLogo } from '@/components/AppLogo';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: 'linear-gradient(180deg, #090d16 0%, #0c1a2e 100%)',
          color: '#f8fafc',
          minHeight: '100vh',
          fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440, padding: 20, textAlign: 'center' }}>
          {/* Logo Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, hsl(215 40% 22%), hsl(173 58% 42%))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(80, 60, 180, 0.25)',
              }}
            >
              <AppLogo size={24} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: '#0f172a', letterSpacing: '-0.4px' }}>
              ClearOwe
            </span>
          </div>

          {/* Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: '36px 28px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
              color: '#0f172a',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'rgba(220, 38, 38, 0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <AlertCircle size={28} color="#dc2626" />
            </div>

            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 8px',
                letterSpacing: '-0.01em',
              }}
            >
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.55, margin: '0 0 24px' }}>
              We hit an unexpected error. Reload to recover your session.
            </p>

            <button
              onClick={() => {
                reset();
                if (typeof window !== 'undefined') window.location.reload();
              }}
              style={{
                height: 46,
                padding: '0 24px',
                borderRadius: 100,
                background: 'hsl(173 58% 39%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px hsl(173 58% 39% / 0.35)',
              }}
            >
              <RotateCcw size={15} /> Reload ClearOwe
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
