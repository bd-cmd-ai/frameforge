import { requireRole } from "../../lib/auth";
import { DashboardShell } from "../../components/dashboard-shell";

const navItems = [
  { href: "/consumer", label: "Account" },
  { href: "/login", label: "Switch account" },
];

export default async function ConsumerPage() {
  const { profile } = await requireRole("consumer");

  return (
    <DashboardShell eyebrow="Consumer Web" title="Welcome back" navItems={navItems}>
      <section className="section-card">
        <div className="section-head">
          <h3>{profile.fullName?.trim() || "Consumer account"}</h3>
          <p>
            Your consumer account is active. The full consumer discovery experience is mobile-first, but your web sign-in is
            working correctly now.
          </p>
        </div>
      </section>
      <section className="section-card" style={{ marginTop: 18 }}>
        <div className="section-head">
          <h3>What to do next</h3>
          <p>Use the mobile app for explore, favorites, and nearby producer discovery. Use this page to confirm your account works.</p>
        </div>
      </section>
    </DashboardShell>
  );
}
