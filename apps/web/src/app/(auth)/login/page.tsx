import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <p className="page-eyebrow">Provider & admin access</p>
        <h1>Manage your producer profile with confidence.</h1>
        <p className="muted">
          Supabase Auth backs the real login flow. This MVP ships with provider and admin routes already separated so claims,
          moderation, and profile management scale cleanly.
        </p>
        <div className="form-grid">
          <div className="field full">
            <label>Email</label>
            <input placeholder="owner@producer.si" />
          </div>
          <div className="field full">
            <label>Password</label>
            <input placeholder="••••••••" type="password" />
          </div>
        </div>
        <div className="auth-actions">
          <Link href="/dashboard" className="primary-button">
            Continue as provider
          </Link>
          <Link href="/admin/providers" className="ghost-button">
            Continue as admin
          </Link>
        </div>
      </div>
    </div>
  );
}
