import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@radar-domace/types";
import { getMissingMobileSupabaseMessage, isMobileSupabaseConfigured, mobileEnv } from "./env";

const supabaseUrl = mobileEnv.supabaseUrl;
const supabaseAnonKey = mobileEnv.supabaseAnonKey;

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const mobileSupabase = isMobileSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const getMobileSupabaseClient = () => {
  if (!mobileSupabase) {
    throw new Error(getMissingMobileSupabaseMessage());
  }
  return mobileSupabase;
};

export { isMobileSupabaseConfigured };
