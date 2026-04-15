import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@radar-domace/types";
import { getMissingWebSupabaseMessage, isWebSupabaseConfigured, webEnv } from "./env";

export const createWebBrowserSupabaseClient = () => {
  if (!isWebSupabaseConfigured) {
    throw new Error(getMissingWebSupabaseMessage());
  }

  return createBrowserClient<Database>(webEnv.supabaseUrl, webEnv.supabaseAnonKey);
};
