import type { ReactNode } from "react";
import { DashboardShell } from "../../components/dashboard-shell";
import { requireRole } from "../../lib/auth";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/claims", label: "Claim requests" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/offers", label: "Offer moderation" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/analytics", label: "Analytics" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("admin");

  return (
    <DashboardShell title="Admin Dashboard" eyebrow="Moderation workspace" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
