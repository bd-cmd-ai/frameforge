const readEnv = (key: string) => process.env[key]?.trim() ?? "";

export const webEnv = {
  supabaseUrl: readEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  googleMapsApiKey: readEnv("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"),
  providerImagesBucket: readEnv("NEXT_PUBLIC_PROVIDER_IMAGES_BUCKET") || "provider-images",
  appUrl: readEnv("NEXT_PUBLIC_APP_URL") || "http://localhost:3000",
  serviceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY"),
};

export const missingWebSupabaseEnv = [
  !webEnv.supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
  !webEnv.supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
].filter(Boolean) as string[];

export const isWebSupabaseConfigured = missingWebSupabaseEnv.length === 0;

export const getMissingWebSupabaseMessage = () =>
  `Web Supabase environment variables are missing: ${missingWebSupabaseEnv.join(", ")}.`;
