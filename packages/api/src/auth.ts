import type { AuthResponse, Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database, UserProfile } from "@radar-domace/types";
import { mapProfile } from "./mappers";

export type AuthSupabaseClient = SupabaseClient<Database, "public", any>;

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput extends SignInInput {
  fullName?: string;
  role?: "consumer" | "provider" | "admin";
  preferredLocale?: "sl" | "en" | "de" | "it";
}

export interface OAuthSignInInput {
  redirectTo: string;
}

const isAuthSessionMissingError = (error: { name?: string; message?: string } | null) =>
  error?.name === "AuthSessionMissingError" || error?.message?.toLowerCase().includes("auth session missing");

export const getCurrentUser = async (client: AuthSupabaseClient): Promise<User | null> => {
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (isAuthSessionMissingError(error)) return null;
    throw error;
  }
  return data.user;
};

export const getCurrentSession = async (client: AuthSupabaseClient): Promise<Session | null> => {
  const { data, error } = await client.auth.getSession();
  if (error) {
    if (isAuthSessionMissingError(error)) return null;
    throw error;
  }
  return data.session;
};

export const getCurrentProfile = async (client: AuthSupabaseClient): Promise<UserProfile | null> => {
  const user = await getCurrentUser(client);
  if (!user) return null;

  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return mapProfile(data);
};

export const signIn = async (client: AuthSupabaseClient, input: SignInInput): Promise<AuthResponse> =>
  client.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

export const signUp = async (client: AuthSupabaseClient, input: SignUpInput): Promise<AuthResponse> =>
  client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName ?? "",
        role: input.role ?? "consumer",
        preferred_locale: input.preferredLocale ?? "sl",
      },
    },
  });

export const signInWithGoogle = async (client: AuthSupabaseClient, input: OAuthSignInInput) =>
  client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: input.redirectTo,
    },
  });

export const signOut = async (client: AuthSupabaseClient) => client.auth.signOut();
