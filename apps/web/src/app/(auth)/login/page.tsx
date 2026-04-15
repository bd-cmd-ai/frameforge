import { LoginForm } from "../../../components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <div className="auth-wrap">
      <LoginForm />
    </div>
  );
}
