import { getCurrentProfile } from "@radar-domace/api";
import { NextResponse, type NextRequest } from "next/server";
import { getRoleRedirectPath } from "../../../lib/auth";
import { createWebServerSupabaseClient } from "../../../lib/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const fallbackUrl = new URL("/login", requestUrl.origin);

  if (!code) {
    fallbackUrl.searchParams.set("error", "missing_oauth_code");
    return NextResponse.redirect(fallbackUrl);
  }

  try {
    const supabase = await createWebServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      fallbackUrl.searchParams.set("error", "google_auth_failed");
      return NextResponse.redirect(fallbackUrl);
    }

    const profile = await getCurrentProfile(supabase);
    const destination = new URL(profile ? getRoleRedirectPath(profile.role) : "/", requestUrl.origin);
    return NextResponse.redirect(destination);
  } catch {
    fallbackUrl.searchParams.set("error", "google_auth_failed");
    return NextResponse.redirect(fallbackUrl);
  }
}
