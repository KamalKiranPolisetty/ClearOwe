'use client';

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  displayName: string;
  greeting: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  signInAsGuest: (name?: string, email?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<{ error?: string }>;
  updateEmail: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
}

const LOCAL_USER_KEY = "clearowe_auth_user";
const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const AuthContext = createContext<AuthContextType>({
  user: null,
  displayName: "Demo",
  greeting: "Good morning",
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signInAsGuest: async () => {},
  signOut: async () => {},
  updateDisplayName: async () => ({}),
  updateEmail: async () => ({}),
  updatePassword: async () => ({}),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Compute time-aware greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Compute clean display first name
  const displayName = useMemo(() => {
    if (!user) return "Demo";
    if (user.display_name && user.display_name.trim()) {
      const clean = user.display_name.includes("@")
        ? user.display_name.split("@")[0]
        : user.display_name;
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    if (user.email) {
      const clean = user.email.split("@")[0];
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return "Demo";
  }, [user]);

  // Load initial session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      // 1. Check Supabase session if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && isMounted) {
            let customName = session.user.user_metadata?.full_name || session.user.email?.split("@")[0];
            try {
              const { data: prof } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('user_id', session.user.id)
                .maybeSingle();
              if (prof?.display_name) {
                customName = prof.display_name;
              }
            } catch {}

            setUser({
              id: session.user.id,
              email: session.user.email || "",
              display_name: customName,
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Supabase auth check failed:", err);
        }
      }

      // 2. Fallback to localStorage session
      try {
        const stored = localStorage.getItem(LOCAL_USER_KEY);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            if (parsed.email === "kamal@example.com" || parsed.email === "kamalkiranpolisetty@gmail.com") {
              parsed.email = "demo@example.com";
              parsed.display_name = "Demo";
              localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(parsed));
            }
            setUser(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed reading local user session:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth events if active
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || "",
            display_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
        } else {
          // If signed out from Supabase
          if (!localStorage.getItem(LOCAL_USER_KEY + "_is_guest")) {
            setUser(null);
            localStorage.removeItem(LOCAL_USER_KEY);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });

        if (error) {
          // If the account does not exist or invalid credentials, attempt seamless auto-sign-up
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            const signUpRes = await supabase.auth.signUp({
              email: trimmedEmail,
              password,
            });

            // If sign-up succeeded and created an active session, log them straight in
            if (signUpRes.data?.session?.user) {
              const authUser: AuthUser = {
                id: signUpRes.data.session.user.id,
                email: signUpRes.data.session.user.email || trimmedEmail,
                display_name: signUpRes.data.session.user.user_metadata?.full_name || trimmedEmail.split("@")[0],
              };
              setUser(authUser);
              localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
              localStorage.removeItem(LOCAL_USER_KEY + "_is_guest");
              return {};
            }

            // If account was already registered, then the password was wrong
            if (signUpRes.error?.message?.toLowerCase().includes("already registered")) {
              return { error: "Incorrect password for this account. Please try again." };
            }

            // If Supabase has email confirmation turned on
            if (signUpRes.data?.user && !signUpRes.data?.session) {
              return { error: "Account created! Please check your email to confirm, or disable 'Confirm email' in Supabase Auth to log in instantly." };
            }

            if (signUpRes.error) {
              return { error: signUpRes.error.message };
            }
          }

          if (error.message.toLowerCase().includes("email not confirmed")) {
            return { error: "Email not confirmed yet. Disable 'Confirm email' in Supabase -> Authentication -> Providers -> Email for instant login." };
          }

          return { error: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || trimmedEmail,
            display_name: data.user.user_metadata?.full_name || trimmedEmail.split("@")[0],
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
          localStorage.removeItem(LOCAL_USER_KEY + "_is_guest");
          return {};
        }
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Failed to sign in" };
      }
    }

    // Local / Offline Sign In
    const authUser: AuthUser = {
      id: "local-" + Math.abs(trimmedEmail.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
      email: trimmedEmail,
      display_name: trimmedEmail.split("@")[0],
    };
    setUser(authUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
    localStorage.removeItem(LOCAL_USER_KEY + "_is_guest");
    return {};
  };

  const signUp = async (email: string, password: string): Promise<{ error?: string; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });

        // If user already exists, sign them in directly!
        if (error && error.message.toLowerCase().includes("already registered")) {
          return signIn(trimmedEmail, password);
        }

        if (error) return { error: error.message };

        if (data.session?.user) {
          const authUser: AuthUser = {
            id: data.session.user.id,
            email: data.session.user.email || trimmedEmail,
            display_name: data.session.user.user_metadata?.full_name || trimmedEmail.split("@")[0],
          };
          setUser(authUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
          localStorage.removeItem(LOCAL_USER_KEY + "_is_guest");
          return {};
        }

        return { message: "Account created! If you have email confirmation enabled in Supabase, check your inbox." };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Failed to create account" };
      }
    }

    // Local / Offline Sign Up
    const authUser: AuthUser = {
      id: "local-" + Date.now(),
      email: trimmedEmail,
      display_name: trimmedEmail.split("@")[0],
    };
    setUser(authUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authUser));
    localStorage.removeItem(LOCAL_USER_KEY + "_is_guest");
    return {};
  };

  const signInAsGuest = async (name = "Demo", email = "demo@example.com") => {
    const guestUser: AuthUser = {
      id: "guest-user-1",
      email,
      display_name: name,
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    localStorage.setItem(LOCAL_USER_KEY + "_is_guest", "true");
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_USER_KEY + "_is_guest");
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Sign out error:", err);
      }
    }
  };

  const updateDisplayName = async (name: string): Promise<{ error?: string }> => {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Name cannot be empty" };

    const updatedUser: AuthUser = user
      ? { ...user, display_name: trimmed }
      : { id: "local-user", email: "kamal@example.com", display_name: trimmed };

    setUser(updatedUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: trimmed },
        });
        if (error) return { error: error.message };

        if (isUuid(user.id)) {
          await supabase.from('profiles').upsert({
            user_id: user.id,
            display_name: trimmed,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
        }
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Failed to update profile name" };
      }
    }
    return {};
  };

  const updateEmail = async (newEmail: string): Promise<{ error?: string }> => {
    const trimmed = newEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { error: "Please enter a valid email address" };
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase.auth.updateUser({ email: trimmed });
        if (error) return { error: error.message };
        return {};
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Failed to update email" };
      }
    } else {
      const updatedUser: AuthUser = user
        ? { ...user, email: trimmed }
        : { id: "local-user", email: trimmed, display_name: "Demo" };
      setUser(updatedUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
      return {};
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return { error: "Password must be at least 6 characters" };
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };
        return {};
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Failed to update password" };
      }
    }
    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        displayName,
        greeting,
        loading,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        updateDisplayName,
        updateEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
