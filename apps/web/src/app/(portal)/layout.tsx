import { DashboardShell } from "../../components/dashboard-shell";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/provider/profile", label: "Provider profile" },
  { href: "/provider/categories", label: "Categories" },
  { href: "/provider/opening-hours", label: "Opening hours" },
  { href: "/provider/images", label: "Images" },
  { href: "/provider/offers", label: "Offer posts" },
  { href: "/provider/analytics", label: "Analytics" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Provider Portal" eyebrow="Provider workspace" navItems={navItems}>
      {children}
    </DashboardShell>
  );
}
