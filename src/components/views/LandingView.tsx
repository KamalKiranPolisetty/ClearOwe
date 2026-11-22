'use client';

import React from 'react';
import {
  ArrowRight,
  Building2,
  Coins,
  ShieldCheck,
  Smartphone,
  Flame,
} from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';

interface LandingViewProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreDemo: () => void;
}

export function LandingView({
  onGetStarted,
  onSignIn,
  onExploreDemo,
}: LandingViewProps) {
  const glass = {
    background: 'rgba(255,255,255,0.70)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.85)',
    borderRadius: 20,
    boxShadow: '0 4px 20px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
    transition: 'transform 200ms ease, box-shadow 200ms ease',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'inherit',
        color: '#0f172a',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* ── Top Navigation Bar ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: 'var(--logo-gradient, linear-gradient(135deg, hsl(173,58%,39%), hsl(215,40%,22%)))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px hsl(var(--primary) / 0.25)',
              }}
            >
              <AppLogo size={20} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.3px' }}>
                ClearOwe
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onSignIn}
              style={{
                height: 38,
                padding: '0 16px',
                borderRadius: 100,
                background: 'transparent',
                border: 'none',
                color: '#475569',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              style={{
                height: 38,
                padding: '0 18px',
                borderRadius: 100,
                background: 'hsl(var(--primary))',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 14px hsl(var(--primary) / 0.35)',
                transition: 'transform 150ms, box-shadow 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px hsl(var(--primary) / 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px hsl(var(--primary) / 0.35)';
              }}
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 20px 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 48,
            alignItems: 'center',
          }}
        >
          {/* Left Column: Heading & Value Prop */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 100,
                background: 'hsl(var(--primary) / 0.08)',
                color: 'hsl(var(--primary))',
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              <ShieldCheck size={14} />
              <span>Personal Loan & Debt Tracker</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(34px, 5vw, 54px)',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.1,
                letterSpacing: '-0.035em',
                margin: '0 0 20px',
              }}
            >
              All your loans and debts.
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary2, 173 58% 39%)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Clear and organized.
              </span>
            </h1>

            <p
              style={{
                fontSize: 16,
                color: '#475569',
                lineHeight: 1.65,
                maxWidth: 480,
                margin: '0 0 32px',
              }}
            >
              Track personal loans, bank debts, and lending with automatic interest calculations,
              monthly due breakdowns, and structured repayment schedules.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={onGetStarted}
                style={{
                  height: 48,
                  padding: '0 26px',
                  borderRadius: 100,
                  background: 'hsl(var(--primary))',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 14,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px hsl(var(--primary) / 0.35)',
                  transition: 'transform 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Start For Free <ArrowRight size={15} />
              </button>

              <button
                onClick={onExploreDemo}
                style={{
                  height: 48,
                  padding: '0 22px',
                  borderRadius: 100,
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(15,23,42,0.04)',
                  transition: 'background 150ms, border-color 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                Explore Demo As Guest
              </button>
            </div>

            {/* Trust strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                marginTop: 36,
                paddingTop: 24,
                borderTop: '1px solid rgba(226,232,240,0.8)',
              }}
            >
              {[
                ['No card needed', 'Free forever'],
                ['100% Private', 'Offline-first & encrypted'],
                ['₹ INR & $ USD', 'Independent currency views'],
              ].map(([head, sub]) => (
                <div key={head}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{head}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Layered Dashboard Preview */}
          <div style={{ position: 'relative' }}>
            {/* Ambient teal blur behind card */}
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 260,
                height: 260,
                borderRadius: '50%',
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.18), transparent 70%)',
                filter: 'blur(30px)',
                zIndex: 0,
              }}
            />

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                ...glass,
                padding: '24px 22px',
                border: '1.5px solid rgba(255,255,255,0.95)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                  paddingBottom: 14,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Dashboard Preview
                  </span>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', marginTop: 2 }}>
                    Active Loans & Debts
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 100,
                    background: 'hsl(var(--primary) / 0.10)',
                    color: 'hsl(var(--primary))',
                  }}
                >
                  ₹ INR Active
                </span>
              </div>

              {/* 3 Metric Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Principal Owed
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    ₹13,61,408
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Due This Month
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'hsl(var(--primary))', marginTop: 4 }}>
                    ₹16,745
                  </div>
                </div>
              </div>

              {/* Sample Loan Row */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'hsl(var(--primary) / 0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={16} color="hsl(var(--primary))" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Personal Loan</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>2.0% / mo · Monthly interest</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#ef4444',
                    background: '#fef2f2',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  Overdue: ₹6,029
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 20px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', margin: '0 0 8px' }}>
            Simple, transparent loan tracking
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Everything you need to track what you owe and what is owed to you.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {[
            {
              icon: Flame,
              title: 'Avalanche Payoff Order',
              desc: 'Prioritizes high-interest loans first so you can clear costly debt faster.',
            },
            {
              icon: Coins,
              title: 'Payment Allocation',
              desc: 'Logs payments and distributes them across overdue interest, current dues, and principal.',
            },
            {
              icon: Building2,
              title: 'Multi-Currency Support',
              desc: 'Track ₹ INR and $ USD loans independently with dedicated dashboards for each currency.',
            },
            {
              icon: Smartphone,
              title: 'Offline-First PWA',
              desc: 'Works completely offline on your device, with optional cloud backup and sync when connected.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  ...glass,
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'hsl(var(--primary) / 0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={20} color="hsl(var(--primary))" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
