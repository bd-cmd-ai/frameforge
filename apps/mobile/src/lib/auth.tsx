import { getCurrentProfile, getCurrentSession, signIn, signOut, signUp } from "@radar-domace/api";
import type { Session } from "@supabase/supabase-js";
import type { AppRole, UserProfile } from "@radar-domace/types";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { getMobileSupabaseClient, isMobileSupabaseConfigured, mobileSupabase } from "./supabase";

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  profile: UserProfile | null;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (input: { email: string; password: string; fullName: string; role?: AppRole }) => Promise<string | null>;
  signOutCurrentUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!isMobileSupabaseConfigured) {
      setLoading(false);
      setError("Supabase mobile environment variables are missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getMobileSupabaseClient();
      const nextSession = await getCurrentSession(client);
      setSession(nextSession);
      setProfile(nextSession ? await getCurrentProfile(client) : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication setup failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mobileSupabase) {
      void load();
      return;
    }
    const client = mobileSupabase;

    void load();

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        void getCurrentProfile(client)
          .then(setProfile)
          .catch((cause) => setError(cause instanceof Error ? cause.message : "Profile loading failed."));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isMobileSupabaseConfigured,
      loading,
      session,
      profile,
      error,
      async signInWithEmail(email, password) {
        const client = getMobileSupabaseClient();
        const result = await signIn(client, { email, password });
        if (result.error) return result.error.message;
        await load();
        return null;
      },
      async signUpWithEmail(input) {
        const client = getMobileSupabaseClient();
        const result = await signUp(client, {
          email: input.email,
          password: input.password,
          fullName: input.fullName,
          role: input.role ?? "consumer",
        });
        if (result.error) return result.error.message;
        await load();
        return null;
      },
      async signOutCurrentUser() {
        const client = getMobileSupabaseClient();
        await signOut(client);
        setSession(null);
        setProfile(null);
      },
      async refreshProfile() {
        const client = getMobileSupabaseClient();
        setProfile(await getCurrentProfile(client));
      },
    }),
    [error, loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export const useProfile = () => useAuth().profile;

export const useRequireRole = (role: AppRole) => {
  const { profile, loading } = useAuth();
  return {
    loading,
    allowed: profile?.role === role,
  };
};
