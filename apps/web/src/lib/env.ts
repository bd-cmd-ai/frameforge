const trimEnv = (value?: string) => value?.trim() ?? "";

export const webEnv = {
  supabaseUrl: trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  googleMapsApiKey: trimEnv(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
  providerImagesBucket: trimEnv(process.env.NEXT_PUBLIC_PROVIDER_IMAGES_BUCKET) || "provider-images",
  appUrl: trimEnv(process.env.NEXT_PUBLIC_APP_URL) || "http://localhost:3000",
  serviceRoleKey: trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
};

export const missingWebSupabaseEnv = [
  !webEnv.supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
  !webEnv.supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
].filter(Boolean) as string[];

export const isWebSupabaseConfigured = missingWebSupabaseEnv.length === 0;

export const getMissingWebSupabaseMessage = () =>
  `Web Supabase environment variables are missing: ${missingWebSupabaseEnv.join(", ")}.`;
