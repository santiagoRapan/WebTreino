"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/services/database/supabaseClient";
import { signInWithGoogle as doGoogleSignIn, signOut as doSignOut, getCurrentSession } from "./auth";
import { ensureAppUser } from "./ensureAppUser";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<{ error?: unknown }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Guard to avoid calling ensureAppUser() multiple times on first render + auth event
  const ensuredRef = useRef(false);

  const loadInitialSession = async () => {
    const s = await getCurrentSession();
    setSession(s);
    setUser(s?.user ?? null);
    
    // Ensure user has entrenador role if they have a session
    if (s?.user) {
      try {
        await ensureAppUser();
      } catch (e) {
        console.error("ensureAppUser error on load:", e);
      }
    }
  };

  const refreshUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session ?? null);
    setUser(session?.user ?? null);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await loadInitialSession();
      } finally {
        // We don’t set loading=false yet; wait for the first auth event or small timeout
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);

      // On first session we ensure the app user row exists (role='entrenador' if first time)
      if (newSession?.user && !ensuredRef.current) {
        ensuredRef.current = true;
        try {
          await ensureAppUser();
        } catch (e) {
          // non-fatal
          console.error("ensureAppUser error:", e);
        }
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
  }, []);

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
      const result = await doSignOut();
      setUser(null);
      setSession(null);
      ensuredRef.current = false;
      return result;
    } catch (error) {
      console.error("Error signing out:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!session, // session is the source of truth
    signInWithGoogle,
    signOut,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
