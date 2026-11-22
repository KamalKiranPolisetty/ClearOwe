'use client';

import React, { useEffect, useRef } from "react";
import { formatCurrency, type Currency } from "@/lib/currency";
import { ArrowRight, X, Building2 } from "lucide-react";
import { PRIMARY_BTN } from "@/lib/styles";

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lenderName: string;
  originalAmount: number;
  currency: Currency;
  onViewCompleted?: () => void;
}

export function CelebrationModal({
  isOpen,
  onClose,
  lenderName,
  originalAmount,
  currency,
  onViewCompleted,
}: CelebrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play a soft, resonant acoustic chime via Web Audio API
  useEffect(() => {
    if (!isOpen) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Warm acoustic chime progression: F5, A5, C6, E6
      const chord = [698.46, 880.0, 1046.5, 1318.51];
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07);

        // Soft harmonic overtone
        overtone.type = "sine";
        overtone.frequency.setValueAtTime(freq * 2, ctx.currentTime + i * 0.07);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + i * 0.07 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.07 + 0.85);

        osc.connect(gain);
        overtone.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.07);
        overtone.start(ctx.currentTime + i * 0.07);
        osc.stop(ctx.currentTime + i * 0.07 + 0.9);
        overtone.stop(ctx.currentTime + i * 0.07 + 0.9);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }, [isOpen]);

  // High-fidelity Canvas Confetti Physics Simulation
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", handleResize);

    // Refined ClearOwe brand palette: Emeralds, Teals, Golds, and Silver Shimmer
    const colors = [
      "#059669", "#10b981", "#34d399", // Emeralds & Mint
      "#0d9488", "#14b8a6",            // ClearOwe Teals
      "#d97706", "#f59e0b", "#fbbf24", // Champagne & Warm Golds
      "#94a3b8", "#cbd5e1",            // Silver & Slate shimmer
    ];

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
      wobble: number;
      wobbleSpeed: number;
      opacity: number;
      decay: number;
      shape: "foil" | "dot";
    }

    const particles: Particle[] = [];

    const spawnBurst = (count: number, velocityMult = 1) => {
      for (let i = 0; i < count; i++) {
        const isLeft = i % 2 === 0;
        const originX = isLeft ? width * 0.1 : width * 0.9;
        const angle = isLeft
          ? -Math.PI / 4 + (Math.random() - 0.5) * 0.55
          : -Math.PI * 0.75 + (Math.random() - 0.5) * 0.55;
        const speed = (Math.random() * 20 + 26) * dpr * velocityMult;

        particles.push({
          x: originX,
          y: height * 0.88,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: (Math.random() * 8 + 6) * dpr,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          wobble: Math.random() * 10,
          wobbleSpeed: Math.random() * 0.08 + 0.04,
          opacity: 1,
          decay: Math.random() * 0.005 + 0.0035,
          shape: Math.random() > 0.35 ? "foil" : "dot",
        });
      }
    };

    // Stage 1: Dual cannon launch
    spawnBurst(160, 1.0);

    // Stage 2: Secondary flutter wave for rich depth
    const secondaryTimer = setTimeout(() => {
      spawnBurst(70, 0.75);
    }, 160);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      let aliveCount = 0;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.52 * dpr; // Gravity
        p.vx *= 0.965;      // Air resistance
        p.vy *= 0.965;
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;
        p.opacity -= p.decay;

        if (p.opacity > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(Math.cos(p.wobble), 1);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          if (p.shape === "foil") {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.62);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.38, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      clearTimeout(secondaryTimer);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Fullscreen Canvas Confetti */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10000,
        }}
      />

      {/* Backdrop with frosted blur */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "modalFadeIn 220ms ease forwards",
        }}
      />

      {/* Main Celebration Card Dialog */}
      <div
        style={{
          position: "relative",
          zIndex: 10001,
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#ffffff",
          borderRadius: 28,
          padding: "36px 26px 28px",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(15, 23, 42, 0.07)",
          textAlign: "center",
          animation: "modalSpringEntrance 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 32,
            height: 32,
            borderRadius: 100,
            border: "none",
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e2e8f0";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f1f5f9";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <X size={16} />
        </button>

        {/* Emerald Checkmark with Radiant Concentric Halo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            boxShadow: "0 0 0 8px rgba(16, 185, 129, 0.14), 0 12px 28px -6px rgba(16, 185, 129, 0.4)",
            animation: "checkPulse 500ms ease-out forwards",
          }}
        >
          <svg
            width="42"
            height="42"
            viewBox="0 0 52 52"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M14 27l8 8 16-17"
              strokeDasharray="42"
              strokeDashoffset="0"
              style={{
                animation: "checkPathDraw 450ms ease-out forwards",
              }}
            />
          </svg>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}
        >
          Debt Cleared
        </h2>

        {/* Subtitle */}
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 22px", lineHeight: 1.45 }}>
          You have successfully settled all remaining balance for this loan.
        </p>

        {/* Refined Financial Settlement Card */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: "16px 18px",
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          {/* Header Row: Lender */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 12,
              borderBottom: "1px solid #edf2f7",
            }}
          >
            <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>Lender</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Building2 size={15} color="#475569" />
              <span style={{ color: "#0f172a", fontWeight: 700, fontSize: 14 }}>
                {lenderName}
              </span>
            </div>
          </div>

          {/* Metric Columns: Amount Cleared & Balance */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              paddingTop: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 500, marginBottom: 2 }}>
                Amount Cleared
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {formatCurrency(originalAmount, currency)}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 500, marginBottom: 2 }}>
                Remaining Balance
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#059669",
                }}
              >
                {formatCurrency(0, currency)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {onViewCompleted && (
            <button
              onClick={() => {
                onClose();
                onViewCompleted();
              }}
              style={{
                ...PRIMARY_BTN,
                width: "100%",
                height: 48,
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 6px 20px hsl(var(--primary) / 0.35)",
              }}
            >
              View in Completed Loans <ArrowRight size={16} />
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 14,
              backgroundColor: "#f8fafc",
              color: "#475569",
              border: "1px solid #e2e8f0",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#0f172a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#475569";
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSpringEntrance {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(14px);
          }
          65% {
            transform: scale(1.015) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes checkPulse {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          60% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes checkPathDraw {
          0% {
            stroke-dashoffset: 42;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
