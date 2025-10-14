"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/services/database/supabaseClient";
import { signInWithGoogle as doGoogleSignIn, signOut as doSignOut, getCurrentSession } from "./auth";
import { ensureAppUser } from "./ensureAppUser";
import type { CustomUser, FullUserData, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [customUser, setCustomUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Guard to avoid calling ensureAppUser() multiple times on first render + auth event
  const ensuredRef = useRef(false);

  const fetchCustomUser = useCallback(async (userId: string): Promise<CustomUser | null> => {
    try {
      console.log('[AuthContext] 🔍 Fetching custom user for userId:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, avatar_url, created_on')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] ❌ Error fetching custom user:', error);
        return null;
      }

      if (!data) {
        console.warn('[AuthContext] ⚠️ No custom user data found for userId:', userId);
        return null;
      }

      console.log('[AuthContext] ✅ Custom user fetched:', data.name, '| Role:', data.role);
      return data;
    } catch (err) {
      console.error('[AuthContext] ❌ Unexpected error fetching custom user:', err);
      return null;
    }
  }, []);

  const loadInitialSession = useCallback(async () => {
    console.log('[AuthContext] 🚀 Loading initial session...');
    const s = await getCurrentSession();
    setSession(s);
    setAuthUser(s?.user ?? null);
    
    // Ensure user has entrenador role if they have a session
    if (s?.user) {
      console.log('[AuthContext] 👤 User found in session:', s.user.email);
      try {
        await ensureAppUser();
        // After ensuring user, fetch the custom user data
        const customUserData = await fetchCustomUser(s.user.id);
        console.log('[AuthContext] 📝 Setting custom user state:', customUserData);
        setCustomUser(customUserData);
      } catch (e) {
        console.error("[AuthContext] ❌ ensureAppUser error on load:", e);
      }
    } else {
      console.log('[AuthContext] ⚠️ No user in initial session');
    }
  }, [fetchCustomUser]);

  const refreshUserData = useCallback(async () => {
    console.log('[AuthContext] 🔄 Refreshing user data...');
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session ?? null);
    setAuthUser(session?.user ?? null);
    
    // Fetch custom user data if we have a session
    if (session?.user) {
      console.log('[AuthContext] 👤 User found, fetching custom data...');
      const customUserData = await fetchCustomUser(session.user.id);
      console.log('[AuthContext] 📝 Setting custom user state:', customUserData);
      setCustomUser(customUserData);
    } else {
      console.log('[AuthContext] ⚠️ No session found, clearing custom user');
      setCustomUser(null);
    }
  }, [fetchCustomUser]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await loadInitialSession();
      } finally {
        // We don't set loading=false yet; wait for the first auth event or small timeout
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('[AuthContext] 🔔 Auth state changed:', event);
      setSession(newSession ?? null);
      setAuthUser(newSession?.user ?? null);

      // On first session we ensure the app user row exists (role='entrenador' if first time)
      if (newSession?.user && !ensuredRef.current) {
        console.log('[AuthContext] 🆕 First session detected, ensuring user...');
        ensuredRef.current = true;
        try {
          await ensureAppUser();
          // After ensuring user, fetch the custom user data
          const customUserData = await fetchCustomUser(newSession.user.id);
          console.log('[AuthContext] 📝 Setting custom user from first session:', customUserData);
          setCustomUser(customUserData);
        } catch (e) {
          // non-fatal
          console.error("[AuthContext] ❌ ensureAppUser error:", e);
        }
      } else if (newSession?.user) {
        console.log('[AuthContext] 🔄 Session exists, fetching custom user data...');
        // If already ensured, still fetch custom user data
        const customUserData = await fetchCustomUser(newSession.user.id);
        console.log('[AuthContext] 📝 Setting custom user from existing session:', customUserData);
        setCustomUser(customUserData);
      } else {
        console.log('[AuthContext] 🚪 No session, clearing custom user');
        // No user, clear custom user
        setCustomUser(null);
      }

      setLoading(false);
    });

    // Fallback: if no auth event arrives (e.g., already signed in), end loading
    const t = setTimeout(() => setLoading(false), 400);

    return () => {
      mounted = false;
      clearTimeout(t);
      subscription.unsubscribe();
    };
  }, [loadInitialSession, fetchCustomUser]);

  useEffect(() => {
    const startAutoRefresh = () => {
      console.log('[AuthContext] 🔁 Starting Supabase auto-refresh');
      supabase.auth.startAutoRefresh();
    };

    const stopAutoRefresh = () => {
      console.log('[AuthContext] ⏸️ Stopping Supabase auto-refresh');
      supabase.auth.stopAutoRefresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[AuthContext] 👁️ Tab visible - resuming session refresh');
        startAutoRefresh();
        refreshUserData();
      } else {
        console.log('[AuthContext] 💤 Tab hidden - pausing session refresh');
        stopAutoRefresh();
      }
    };

    const handleWindowFocus = () => {
      console.log('[AuthContext] 🔄 Window focus - ensuring session freshness');
      startAutoRefresh();
      refreshUserData();
    };

    startAutoRefresh();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      stopAutoRefresh();
    };
  }, [refreshUserData]);

  const signInWithGoogle = async (redirectTo?: string): Promise<void> => {
    // Do not set loading to false here, OAuth will redirect
    setLoading(true);
    try {
      await doGoogleSignIn(redirectTo);
      // OAuth will redirect, so we don't need to handle the response here
    } catch (error) {
      console.error("Error signing in:", error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await doSignOut();
      setAuthUser(null);
      setCustomUser(null);
      setSession(null);
      ensuredRef.current = false;
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const fullUserData: FullUserData | null = session ? {
    authUser,
    customUser,
    isAuthenticated: !!session,
    session,
  } : null;

  const value: AuthContextType = {
    authUser,
    customUser,
    session,
    loading,
    isAuthenticated: !!session, // session is the source of truth
    signInWithGoogle,
    signOut,
    refreshUserData,
    fullUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
