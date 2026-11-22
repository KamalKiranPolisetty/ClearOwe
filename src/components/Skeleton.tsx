'use client';

import type { CSSProperties } from "react";
import type { NavTab } from "@/types";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
  className?: string;
  translucent?: boolean;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
  className,
  translucent = false,
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: translucent
          ? "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.34) 50%, rgba(255,255,255,0.18) 100%)"
          : "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

// ── Reusable Micro-Components ──

export function SkeletonCard({
  height = 124,
  style,
  children,
}: {
  height?: number | string;
  style?: CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="glass-card"
      style={{
        background: "#ffffff",
        borderRadius: "var(--app-radius, 20px)",
        border: "1px solid #e8eef4",
        padding: "20px 22px",
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children || (
        <>
          <Skeleton width="45%" height={12} borderRadius={6} />
          <Skeleton width="65%" height={26} borderRadius={7} />
          <Skeleton width="55%" height={11} borderRadius={5} />
        </>
      )}
    </div>
  );
}

export function SkeletonLoanRow({ style }: { style?: CSSProperties }) {
  return (
    <div
      className="glass-card"
      style={{
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e8eef4",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Skeleton width={42} height={42} borderRadius={12} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width={140} height={15} borderRadius={6} />
            <Skeleton width={100} height={12} borderRadius={5} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <Skeleton width={90} height={18} borderRadius={6} />
          <Skeleton width={60} height={11} borderRadius={5} />
        </div>
      </div>
      <Skeleton width="100%" height={6} borderRadius={100} />
    </div>
  );
}

// ── Page 1: Dashboard Skeleton ──

export function DashboardSkeleton() {
  return (
    <div>
      {/* ── Desktop View ── */}
      <div className="desktop-only">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width={120} height={13} borderRadius={5} />
            <Skeleton width={210} height={26} borderRadius={8} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Skeleton width={96} height={42} borderRadius={11} />
            <Skeleton width={104} height={42} borderRadius={11} />
            <Skeleton width={122} height={42} borderRadius={11} />
          </div>
        </div>

        {/* Month Navigator */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Skeleton width={230} height={36} borderRadius={10} />
        </div>

        {/* 4 KPI Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 20 }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} height={118} />
          ))}
        </div>

        {/* Empty state / Main Loan content card */}
        <div
          className="glass-card"
          style={{
            background: "#ffffff",
            borderRadius: 24,
            border: "1px solid #e8eef4",
            padding: "52px 32px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Skeleton width={62} height={62} borderRadius={18} />
          <Skeleton width={240} height={22} borderRadius={8} />
          <Skeleton width={420} height={14} borderRadius={6} />
          <Skeleton width={190} height={44} borderRadius={12} style={{ marginTop: 8 }} />
        </div>
      </div>

      {/* ── Mobile View ── */}
      <div className="mobile-only">
        {/* Mobile Hero Banner */}
        <div className="mobile-hero" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Skeleton width={80} height={10} borderRadius={4} translucent />
              <Skeleton width={110} height={22} borderRadius={6} translucent />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Skeleton width={74} height={34} borderRadius={9} translucent />
              <Skeleton width={38} height={38} borderRadius={11} translucent />
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "4px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Skeleton width={100} height={10} borderRadius={4} translucent />
            <Skeleton width={180} height={34} borderRadius={8} translucent />
            <Skeleton width={150} height={12} borderRadius={5} translucent />
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Skeleton width={190} height={32} borderRadius={100} translucent />
          </div>
        </div>

        {/* Mobile Content Sheet */}
        <div className="mobile-page-content">
          {/* 2x2 Bento Card Skeleton */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              marginBottom: 16,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              border: "1px solid #f1f5f9",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ padding: "16px 18px", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton width="60%" height={10} borderRadius={5} />
                <Skeleton width="85%" height={20} borderRadius={6} />
                <Skeleton width="70%" height={9} borderRadius={4} />
              </div>
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton width="60%" height={10} borderRadius={5} />
                <Skeleton width="85%" height={20} borderRadius={6} />
                <Skeleton width="70%" height={9} borderRadius={4} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "16px 18px", borderRight: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton width="60%" height={10} borderRadius={5} />
                <Skeleton width="85%" height={20} borderRadius={6} />
                <Skeleton width="70%" height={9} borderRadius={4} />
              </div>
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton width="60%" height={10} borderRadius={5} />
                <Skeleton width="85%" height={20} borderRadius={6} />
                <Skeleton width="70%" height={9} borderRadius={4} />
              </div>
            </div>
          </div>

          {/* AI Insight Card Skeleton */}
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "14px 16px", marginBottom: 16, border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
            <Skeleton width={34} height={34} borderRadius={10} />
            <Skeleton width="80%" height={14} borderRadius={6} />
          </div>

          <SkeletonCard height={80} />
        </div>
      </div>
    </div>
  );
}

// ── Page 2: Loans View Skeleton ──

export function LoansSkeleton() {
  return (
    <div>
      {/* Desktop */}
      <div className="desktop-only">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width={200} height={26} borderRadius={8} />
            <Skeleton width={260} height={13} borderRadius={5} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Skeleton width={96} height={42} borderRadius={11} />
            <Skeleton width={120} height={42} borderRadius={11} />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card" style={{ padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12 }}>
          <Skeleton width="70%" height={38} borderRadius={10} />
          <Skeleton width="30%" height={38} borderRadius={10} />
        </div>

        {/* Loan Rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((i) => (
            <SkeletonLoanRow key={i} />
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="mobile-only">
        <div
          className="mobile-hero"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width={80} height={11} borderRadius={4} translucent />
              <Skeleton width={160} height={30} borderRadius={8} translucent />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Skeleton width={74} height={34} borderRadius={9} translucent />
              <Skeleton width={40} height={40} borderRadius={12} translucent />
            </div>
          </div>
          <Skeleton width={210} height={13} borderRadius={5} translucent />
        </div>

        <div className="mobile-page-content">
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Skeleton width={240} height={38} borderRadius={12} />
          </div>

          <div className="glass-card" style={{ padding: "10px 14px", marginBottom: 14 }}>
            <Skeleton width="100%" height={38} borderRadius={10} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <SkeletonLoanRow key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page 3: This Month Skeleton ──

export function ThisMonthSkeleton() {
  return (
    <div>
      {/* Desktop */}
      <div className="desktop-only">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width={180} height={26} borderRadius={8} />
            <Skeleton width={230} height={13} borderRadius={5} />
          </div>
          <Skeleton width={96} height={42} borderRadius={11} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Skeleton width={230} height={36} borderRadius={10} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <SkeletonCard height={110} />
          <SkeletonCard height={110} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <SkeletonLoanRow key={i} />
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="mobile-only">
        <div
          className="mobile-hero"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width={110} height={12} borderRadius={4} translucent />
              <Skeleton width={160} height={32} borderRadius={8} translucent />
            </div>
            <Skeleton width={88} height={34} borderRadius={20} translucent />
          </div>
          <Skeleton width={150} height={13} borderRadius={5} translucent />
        </div>

        <div className="mobile-page-content">
          {/* 3 Metric Cards matching ThisMonthView */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton width="45%" height={11} borderRadius={4} />
                <Skeleton width="60%" height={22} borderRadius={6} />
              </div>
            ))}
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <Skeleton width={60} height={32} borderRadius={20} />
            <Skeleton width={70} height={32} borderRadius={20} />
            <Skeleton width={60} height={32} borderRadius={20} />
          </div>

          {/* Loan Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonLoanRow />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page 4: Settings Skeleton ──

export function SettingsSkeleton() {
  return (
    <div>
      {/* Desktop */}
      <div className="desktop-only" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
          <Skeleton width={180} height={26} borderRadius={8} />
          <Skeleton width={260} height={13} borderRadius={5} />
        </div>

        <SkeletonCard height={110} />
        <SkeletonCard height={160} />
        <SkeletonCard height={140} />
      </div>

      {/* Mobile */}
      <div className="mobile-only">
        <div
          className="mobile-hero"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <Skeleton width={140} height={11} borderRadius={4} translucent />
          <Skeleton width={110} height={30} borderRadius={8} translucent />
        </div>

        <div className="mobile-page-content">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SkeletonCard height={96} />
            <SkeletonCard height={150} />
            <SkeletonCard height={130} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab Router for Skeletons ──

export function AppPageSkeleton({ tab }: { tab: NavTab }) {
  switch (tab) {
    case "loans":
      return <LoansSkeleton />;
    case "this-month":
      return <ThisMonthSkeleton />;
    case "settings":
      return <SettingsSkeleton />;
    case "home":
    default:
      return <DashboardSkeleton />;
  }
}

// ── Universal Pre-Hydration & Post-Hydration Skeleton ──
// Renders all 4 tab skeleton trees in the initial HTML so that CSS (html[data-tab])
// displays the EXACT skeleton matching the URL hash on the very first frame (0ms),
// completely eliminating any flash of the Home/Dashboard skeleton on reload!
export function UniversalPageSkeleton() {
  return (
    <div className="universal-skeleton-container">
      <div className="tab-skeleton tab-skeleton-home">
        <DashboardSkeleton />
      </div>
      <div className="tab-skeleton tab-skeleton-loans">
        <LoansSkeleton />
      </div>
      <div className="tab-skeleton tab-skeleton-this-month">
        <ThisMonthSkeleton />
      </div>
      <div className="tab-skeleton tab-skeleton-settings">
        <SettingsSkeleton />
      </div>
    </div>
  );
}

// ── Full Shell Skeleton (Desktop Sidebar + Mobile Bars + Content) ──

export function AppShellSkeleton({ currentTab = "home" }: { currentTab?: NavTab }) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* ── Desktop Sidebar Skeleton ── */}
      <aside
        className="desktop-only"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 220,
          background: "#ffffff",
          borderRight: "1px solid #e8eef4",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          zIndex: 40,
        }}
      >
        <div>
          {/* Logo Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 20 }}>
            <Skeleton width={32} height={32} borderRadius={9} />
            <Skeleton width={90} height={18} borderRadius={6} />
          </div>

          {/* Nav Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Skeleton width="100%" height={40} borderRadius={11} />
            <Skeleton width="100%" height={40} borderRadius={11} />
            <Skeleton width="100%" height={40} borderRadius={11} />
            <Skeleton width="100%" height={40} borderRadius={11} />
          </div>
        </div>

        {/* User Pill */}
        <div style={{ padding: "10px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
          <Skeleton width={32} height={32} borderRadius={100} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <Skeleton width="70%" height={11} borderRadius={4} />
            <Skeleton width="90%" height={9} borderRadius={3} />
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="page-wrapper">
        <div className="page-content" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <AppPageSkeleton tab={currentTab} />
        </div>
      </main>

      {/* ── Mobile Bottom Navigation Bar Skeleton ── */}
      <nav
        className="mobile-bottom-bar mobile-only"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#ffffff",
          borderTop: "1px solid #e8eef4",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <Skeleton width={22} height={22} borderRadius={6} />
            <Skeleton width={32} height={8} borderRadius={3} />
          </div>
        ))}
      </nav>
    </div>
  );
}
