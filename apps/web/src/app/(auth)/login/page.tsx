import { redirect } from "next/navigation";
import { LoginForm } from "../../../components/login-form";
import { getOptionalAuth, getRoleRedirectPath } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { profile } = await getOptionalAuth();

  if (profile) {
    redirect(getRoleRedirectPath(profile.role));
  }

  return (
    <div className="auth-wrap">
      <LoginForm />
    </div>
  );
}
