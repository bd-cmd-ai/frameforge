import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@radar-domace/types";

export type AppSupabaseClient = SupabaseClient<Database, "public", any>;

export type MutationResult<T> = {
  data: T | null;
  error: string | null;
};
