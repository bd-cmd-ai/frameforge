import { getCurrentProfile, getCurrentUser } from "@radar-domace/api";
import type { AppRole, UserProfile } from "@radar-domace/types";
import { redirect } from "next/navigation";
import { createWebServerSupabaseClient } from "./supabase-server";

export const getRoleRedirectPath = (role: AppRole) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "provider") return "/dashboard";
  return "/consumer";
};

export const requireAuth = async () => {
  const supabase = await createWebServerSupabaseClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile(supabase);

  if (!profile) {
    redirect("/login");
  }

  return { supabase, user, profile };
};

export const requireRole = async (role: AppRole | AppRole[]) => {
  const auth = await requireAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!allowedRoles.includes(auth.profile.role)) {
    redirect("/unauthorized");
  }

  return auth;
};

export const getOptionalAuth = async (): Promise<{
  profile: UserProfile | null;
}> => {
  const supabase = await createWebServerSupabaseClient();
  const profile = await getCurrentProfile(supabase);
  return { profile };
};
