import { createServerClient } from "@supabase/ssr";
import type { Database } from "@radar-domace/types";
import { cookies } from "next/headers";
import { getMissingWebSupabaseMessage, isWebSupabaseConfigured, webEnv } from "./env";

type CookieWrite = {
  name: string;
  value: string;
  options?: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[2];
};

export const createWebServerSupabaseClient = async () => {
  if (!isWebSupabaseConfigured) {
    throw new Error(getMissingWebSupabaseMessage());
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(webEnv.supabaseUrl, webEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieWrite[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components can render with refreshed auth state even when cookie writes are deferred.
        }
      },
    },
  });
};
