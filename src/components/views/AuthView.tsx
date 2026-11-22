'use client';

import React, { useState } from 'react';
import { AppLogo } from '@/components/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, UserCheck } from 'lucide-react';

interface AuthViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AuthView({ onBack, onSuccess }: AuthViewProps) {
  const { signIn, signUp, signInAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await signUp(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setInfoMsg(res.message || 'Account created successfully!');
          onSuccess();
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          onSuccess();
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    await signInAsGuest('Demo', 'demo@example.com');
    setLoading(false);
    onSuccess();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 48,
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    padding: '0 16px',
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 150ms, box-shadow 150ms',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 6,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'inherit',
      }}
    >
      {/* ── Top-left Back button ── */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          height: 38,
          padding: '0 16px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid #e2e8f0',
          backdropFilter: 'blur(12px)',
          color: '#334155',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
          transition: 'all 150ms',
          zIndex: 10,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'var(--logo-gradient, linear-gradient(135deg, hsl(173,58%,39%), hsl(215,40%,22%)))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px hsl(var(--primary) / 0.30)',
            }}
          >
            <AppLogo size={22} color="#ffffff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 22, color: '#0f172a', letterSpacing: '-0.4px' }}>
            ClearOwe
          </span>
        </div>

        {/* Glass Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(40px)',
            border: '1px solid #e2e8f0',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 12px 36px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04)',
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
              textAlign: 'center',
              marginBottom: 4,
              letterSpacing: '-0.4px',
            }}
          >
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            {isSignUp
              ? 'Start tracking loans, debts, and payoff schedules'
              : 'Sign in to access your dashboard'}
          </p>

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="auth-email" style={labelStyle}>
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                  e.currentTarget.style.boxShadow = '0 0 0 3px hsl(var(--primary) / 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label htmlFor="auth-password" style={labelStyle}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                    e.currentTarget.style.boxShadow = '0 0 0 3px hsl(var(--primary) / 0.12)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 46,
                borderRadius: 12,
                backgroundColor: loading ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--primary))',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 150ms',
                fontFamily: 'inherit',
                marginTop: 4,
                boxShadow: '0 4px 14px hsl(var(--primary) / 0.25)',
              }}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '14px 0',
                color: '#94a3b8',
                fontSize: 12,
              }}
            >
              <div style={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} />
            </div>

            <button
              type="button"
              onClick={handleGuestLogin}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 12,
                backgroundColor: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                color: '#334155',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <UserCheck size={16} color="hsl(var(--primary))" />
              Continue as Guest / Demo
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setInfoMsg('');
              }}
              style={{
                fontSize: 13,
                color: '#475569',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {isSignUp ? (
                <span>
                  Already have an account?{' '}
                  <strong style={{ color: 'hsl(var(--primary))' }}>Sign in</strong>
                </span>
              ) : (
                <span>
                  Don&apos;t have an account?{' '}
                  <strong style={{ color: 'hsl(var(--primary))' }}>Sign up free</strong>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
