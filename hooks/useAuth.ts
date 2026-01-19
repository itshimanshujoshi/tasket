"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  expiresAt: number | null;
}

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo, redirectIfFound = false } = options;
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    expiresAt: null,
  });
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAuthState({ user: null, loading: false, expiresAt: null });
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const setupAutoLogout = useCallback(
    (expiresAt: number) => {
      clearTimers();

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry <= 0) {
        logout();
        return;
      }

      // Set timeout for auto-logout
      logoutTimerRef.current = setTimeout(() => {
        logout();
      }, timeUntilExpiry * 1000);

      // Set warning 5 minutes before expiry (if session > 5 min remaining)
      const warningTime = timeUntilExpiry - 300; // 5 minutes before
      if (warningTime > 0) {
        warningTimerRef.current = setTimeout(() => {
          // Dispatch custom event for components to show warning
          window.dispatchEvent(
            new CustomEvent("session-expiring", {
              detail: { expiresIn: 300 },
            })
          );
        }, warningTime * 1000);
      }
    },
    [clearTimers, logout]
  );

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (data.user && data.expiresAt) {
        setAuthState({
          user: data.user,
          loading: false,
          expiresAt: data.expiresAt,
        });
        setupAutoLogout(data.expiresAt);
      } else {
        setAuthState({ user: null, loading: false, expiresAt: null });
        clearTimers();
      }

      return data;
    } catch (error) {
      console.error("Session check error:", error);
      setAuthState({ user: null, loading: false, expiresAt: null });
      clearTimers();
      return { user: null, expiresAt: null };
    }
  }, [setupAutoLogout, clearTimers]);

  // Check session on mount and pathname change
  useEffect(() => {
    checkSession();
  }, [pathname, checkSession]);

  // Handle redirects
  useEffect(() => {
    if (authState.loading) return;

    if (redirectTo) {
      if (!redirectIfFound && !authState.user) {
        router.push(redirectTo);
      } else if (redirectIfFound && authState.user) {
        router.push(redirectTo);
      }
    }
  }, [authState.loading, authState.user, redirectTo, redirectIfFound, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Calculate time remaining
  const getTimeRemaining = useCallback(() => {
    if (!authState.expiresAt) return null;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, authState.expiresAt - now);
  }, [authState.expiresAt]);

  return {
    user: authState.user,
    loading: authState.loading,
    expiresAt: authState.expiresAt,
    logout,
    checkSession,
    getTimeRemaining,
  };
}
