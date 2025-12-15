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
    console.log('[AuthContext] 📊 Session loaded:', { hasSession: !!s, hasUser: !!s?.user, userEmail: s?.user?.email });
    setSession(s);
    setAuthUser(s?.user ?? null);

    // Only ensure user if we have a session - don't block on this
    if (s?.user) {
      console.log('[AuthContext] 👤 User found in session:', s.user.email);
      // Run ensureAppUser in background without awaiting
      ensureAppUser().catch(e => {
        console.error("[AuthContext] ❌ ensureAppUser error on load:", e);
      });

      // Fetch custom user data in background
      fetchCustomUser(s.user.id).then(customUserData => {
        console.log('[AuthContext] 📝 Setting custom user state:', customUserData);
        setCustomUser(customUserData);
      }).catch(e => {
        console.error("[AuthContext] ❌ fetchCustomUser error on load:", e);
      });
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
        // Set loading to false immediately after initial session load
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthContext] ❌ Error loading initial session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('[AuthContext] 🔔 Auth state changed:', event);
      setSession(newSession ?? null);
      setAuthUser(newSession?.user ?? null);

      // Handle custom user data fetching in background (non-blocking)
      if (newSession?.user) {
        // On first session we ensure the app user row exists (role='entrenador' if first time)
        if (!ensuredRef.current) {
          console.log('[AuthContext] 🆕 First session detected, ensuring user...');
          ensuredRef.current = true;
          // Run ensureAppUser in background without blocking
          ensureAppUser().catch(e => {
            console.error("[AuthContext] ❌ ensureAppUser error:", e);
          });
        }

        // Fetch custom user data in background
        fetchCustomUser(newSession.user.id).then(customUserData => {
          if (mounted) {
            console.log('[AuthContext] 📝 Setting custom user:', customUserData);
            setCustomUser(customUserData);
          }
        }).catch(e => {
          console.error("[AuthContext] ❌ fetchCustomUser error:", e);
        });
      } else {
        console.log('[AuthContext] 🚪 No session, clearing custom user');
        setCustomUser(null);
      }

      // Don't set loading to false here - let the initial load handle it
    });

    return () => {
      mounted = false;
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

  const updateUserProfile = async (data: { name?: string | null; avatar_url?: string | null }): Promise<{ ok: true; data: void } | { ok: false; error: string }> => {
    if (!authUser) {
      return { ok: false, error: "No authenticated user" };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', authUser.id);

      if (error) {
        console.error("Error updating user profile:", error);
        return { ok: false, error: error.message };
      }

      // Update local state
      setCustomUser(prev => prev ? { ...prev, ...data } : null);

      return { ok: true, data: undefined };
    } catch (error: any) {
      console.error("Unexpected error updating profile:", error);
      return { ok: false, error: error.message || "Unknown error" };
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
    isAuthenticated: !!session && !!authUser, // More strict check
    signInWithGoogle,
    signOut,
    refreshUserData,
    updateUserProfile,
    fullUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
