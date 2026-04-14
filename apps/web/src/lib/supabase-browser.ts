import { createBrowserClient } from "@supabase/ssr";
import { webEnv } from "./env";

export const createWebBrowserSupabaseClient = () =>
  createBrowserClient(webEnv.supabaseUrl, webEnv.supabaseAnonKey);
