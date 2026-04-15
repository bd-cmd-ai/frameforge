import type { ReactNode } from "react";
import { DashboardShell } from "../../components/dashboard-shell";
import { requireRole } from "../../lib/auth";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/provider/claim", label: "Claim" },
  { href: "/provider/profile", label: "Provider profile" },
  { href: "/provider/categories", label: "Categories" },
  { href: "/provider/opening-hours", label: "Opening hours" },
  { href: "/provider/images", label: "Images" },
  { href: "/provider/offers", label: "Offer posts" },
  { href: "/provider/analytics", label: "Analytics" },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireRole("provider");

  return (
    <DashboardShell title="Provider Portal" eyebrow="Provider workspace" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
