'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/AppLogo';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Next.js error boundary caught:', error);
  }, [error]);

  const handleReload = () => {
    reset();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/#home');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
        {/* App Logo Header matching SimpleSpend */}
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

        {/* Card matching SimpleSpend ErrorBoundary */}
        <div
          className="glass-card"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 24,
            padding: '36px 28px',
            boxShadow: '0 20px 48px -12px rgba(15, 23, 42, 0.20)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(220, 38, 38, 0.10)',
              border: '1px solid rgba(220, 38, 38, 0.20)',
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
          <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.55, margin: '0 0 20px' }}>
            We hit an unexpected error rendering this view. Reload to try again or return to your dashboard.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={handleGoHome}
              style={{
                height: 42,
                padding: '0 18px',
                borderRadius: 10,
                background: '#f1f5f9',
                color: '#374151',
                border: '1px solid #e2e8f0',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'background 150ms',
              }}
            >
              <Home size={14} /> Back to Home
            </button>

            <button
              onClick={handleReload}
              style={{
                height: 42,
                padding: '0 20px',
                borderRadius: 10,
                background: 'hsl(var(--primary))',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px hsl(var(--primary) / 0.35)',
                transition: 'transform 150ms',
              }}
            >
              <RotateCcw size={14} /> Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
