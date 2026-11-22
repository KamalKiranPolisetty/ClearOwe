'use client';

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import type { NavTab } from "@/types";

type NavIcon = React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;

interface NavigationProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOnline?: boolean;
  unpaidThisMonthCount?: number;
  user?: { email?: string; display_name?: string } | null;
  displayName?: string;
  onSignOut?: () => void;
}

const EXPANDED_W = 220;
const COLLAPSED_W = 72;

export function Navigation({
  currentTab,
  onTabChange,
  user,
  displayName,
  onSignOut,
}: NavigationProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  const menuTabs: { id: NavTab; label: string; icon: NavIcon; badge?: number }[] = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "loans", label: "Loans", icon: Building2 },
  ];

  const toolsTabs: { id: NavTab; label: string; icon: NavIcon }[] = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const sectionLabel = (text: string) =>
    !collapsed ? (
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          letterSpacing: "1px",
          textTransform: "uppercase",
          padding: "16px 20px 4px",
          margin: 0,
        }}
      >
        {text}
      </p>
    ) : (
      <div style={{ height: 16 }} />
    );

  const renderNavItem = (tab: { id: NavTab; label: string; icon: NavIcon; badge?: number }) => {
    const active = currentTab === tab.id;
    const Icon = tab.icon;

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        title={collapsed ? tab.label : undefined}
        aria-label={tab.label}
        aria-current={active ? "page" : undefined}
        className={`sidebar-tab-btn sidebar-tab-${tab.id} ${active ? "is-active" : ""}`}
        suppressHydrationWarning
        style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? "center" : "flex-start",
          width: "calc(100% - 16px)",
          margin: "2px 8px",
          padding: collapsed ? "11px 0" : "10px 14px",
          borderRadius: 10,
          border: "none",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
          transition: "background-color 150ms, color 150ms, transform 150ms",
          overflow: "hidden",
          whiteSpace: "nowrap",
          position: "relative",
        }}
      >
        <div className="sidebar-tab-indicator" />
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Icon size={18} />
          {tab.badge && tab.badge > 0 ? (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -6,
                minWidth: 16,
                height: 16,
                padding: "0 4px",
                borderRadius: 8,
                backgroundColor: "#ef4444",
                color: "#ffffff",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {tab.badge}
            </span>
          ) : null}
        </div>
        {!collapsed && <span className="sidebar-tab-label">{tab.label}</span>}
      </button>
    );
  };

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="sidebar-desktop desktop-only"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          width: w,
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          fontFamily: "inherit",
          transition: "width 220ms cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          minWidth: w,
          maxWidth: w,
        }}
      >
        {/* Header: Logo + collapse toggle */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "0 10px" : "0 12px 0 16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.45)",
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <div
              onClick={() => onTabChange("home")}
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1, overflow: "hidden" }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "var(--logo-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px hsl(var(--primary) / 0.30)",
                  flexShrink: 0,
                }}
              >
                <AppLogo size={18} color="#ffffff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#0c1a2e", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
                ClearOwe
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              width: collapsed ? 44 : 28,
              height: collapsed ? 44 : 28,
              borderRadius: collapsed ? 12 : 8,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            {collapsed ? <ChevronRight size={16} color="#374151" /> : <ChevronLeft size={13} color="#374151" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, paddingTop: 8, overflowY: "auto", overflowX: "hidden" }}>
          {sectionLabel("Menu")}
          {menuTabs.map((t) => renderNavItem(t))}
          {sectionLabel("Tools")}
          {toolsTabs.map((t) => renderNavItem(t))}
        </nav>

        {/* User + sign out — matching SimpleSpend BottomNav.tsx */}
        {user && (
          <div style={{ padding: "16px 12px", borderTop: "1px solid #e8eef4", flexShrink: 0 }}>
            {collapsed ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "var(--logo-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    boxShadow: "0 2px 8px hsl(var(--primary) / 0.25)",
                    flexShrink: 0,
                  }}
                >
                  {(displayName || user.email || "ME").slice(0, 2).toUpperCase()}
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    title="Sign out"
                    aria-label="Sign out"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "rgba(239,68,68,0.08)",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.16)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                    padding: "8px 10px",
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "var(--logo-gradient)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      boxShadow: "0 2px 8px hsl(var(--primary) / 0.25)",
                      flexShrink: 0,
                    }}
                  >
                    {(displayName || user.email || "ME").slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {displayName && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0c1a2e",
                          lineHeight: 1.3,
                          wordBreak: "break-word",
                        }}
                      >
                        {displayName}
                      </p>
                    )}
                    <p
                      title={user.email}
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "#64748b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    style={{
                      width: "100%",
                      height: 36,
                      borderRadius: 10,
                      background: "rgba(239,68,68,0.07)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      color: "#ef4444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      transition: "background 150ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.14)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ── Mobile Bottom Tab Bar (4 Essential Tabs) ── */}
      <nav
        className="mobile-bottom-bar mobile-only"
        aria-label="Mobile Navigation"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#ffffff",
          borderTop: "1px solid #e8eef4",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            width: "100%",
          }}
        >
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => onTabChange("home")}
            aria-label="Dashboard"
            aria-current={currentTab === "home" ? "page" : undefined}
            className={`mobile-tab-btn mobile-tab-home ${currentTab === "home" ? "is-active" : ""}`}
            suppressHydrationWarning
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flex: 1,
              height: 64,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              position: "relative",
              transition: "color 150ms, transform 150ms",
            }}
          >
            <LayoutDashboard size={20} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Dashboard</span>
            <div className="mobile-tab-active-line" />
          </button>

          {/* Tab 2: Loans */}
          <button
            onClick={() => onTabChange("loans")}
            aria-label="Loans"
            aria-current={currentTab === "loans" ? "page" : undefined}
            className={`mobile-tab-btn mobile-tab-loans ${currentTab === "loans" ? "is-active" : ""}`}
            suppressHydrationWarning
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flex: 1,
              height: 64,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              position: "relative",
              transition: "color 150ms, transform 150ms",
            }}
          >
            <Building2 size={20} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Loans</span>
            <div className="mobile-tab-active-line" />
          </button>

          {/* Tab 3: Settings */}
          <button
            onClick={() => onTabChange("settings")}
            aria-label="Settings"
            aria-current={currentTab === "settings" ? "page" : undefined}
            className={`mobile-tab-btn mobile-tab-settings ${currentTab === "settings" ? "is-active" : ""}`}
            suppressHydrationWarning
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flex: 1,
              height: 64,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              position: "relative",
              transition: "color 150ms, transform 150ms",
            }}
          >
            <Settings size={20} />
            <span style={{ fontSize: 11, fontWeight: 600 }}>Settings</span>
            <div className="mobile-tab-active-line" />
          </button>
        </div>
      </nav>
    </>
  );
}
