import { redirect } from "next/navigation";
import { getOptionalAuth, getRoleRedirectPath } from "../lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile } = await getOptionalAuth();

  if (profile) {
    redirect(getRoleRedirectPath(profile.role));
  }

  redirect("/login");
}
