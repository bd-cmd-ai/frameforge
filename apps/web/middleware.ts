import { createServerClient } from "@supabase/ssr";
import type { Database } from "@radar-domace/types";
import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/provider", "/admin"];

const getRoleRedirectPath = (role: Database["public"]["Enums"]["app_role"]) => {
  if (role === "admin") return "/admin";
  if (role === "provider") return "/dashboard";
  return "/";
};

const isAuthSessionMissingError = (error: { name?: string; message?: string } | null) =>
  error?.name === "AuthSessionMissingError" || error?.message?.toLowerCase().includes("auth session missing");

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    if (!isAuthSessionMissingError(error as { name?: string; message?: string })) {
      if (isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      return response;
    }
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role;

    if (role === "consumer" && (pathname.startsWith("/dashboard") || pathname.startsWith("/provider") || pathname.startsWith("/admin"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (role === "provider" && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleRedirectPath(role);
      return NextResponse.redirect(url);
    }

    if (role === "admin" && (pathname === "/dashboard" || pathname.startsWith("/provider"))) {
      const url = request.nextUrl.clone();
      url.pathname = getRoleRedirectPath(role);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
