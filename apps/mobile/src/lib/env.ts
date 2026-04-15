const readEnv = (key: string) => process.env[key]?.trim() ?? "";

export const mobileEnv = {
  supabaseUrl: readEnv("EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  googleMapsApiKey: readEnv("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"),
  providerImagesBucket: readEnv("EXPO_PUBLIC_PROVIDER_IMAGES_BUCKET") || "provider-images",
  webUrl: readEnv("EXPO_PUBLIC_WEB_URL") || "http://localhost:3000",
  appScheme: readEnv("EXPO_PUBLIC_APP_SCHEME") || "radardomace",
};

export const missingMobileSupabaseEnv = [
  !mobileEnv.supabaseUrl ? "EXPO_PUBLIC_SUPABASE_URL" : null,
  !mobileEnv.supabaseAnonKey ? "EXPO_PUBLIC_SUPABASE_ANON_KEY" : null,
].filter(Boolean) as string[];

export const isMobileSupabaseConfigured = missingMobileSupabaseEnv.length === 0;

export const getMissingMobileSupabaseMessage = () =>
  `Mobile Supabase environment variables are missing: ${missingMobileSupabaseEnv.join(", ")}.`;
