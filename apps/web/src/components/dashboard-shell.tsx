import Link from "next/link";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
}

interface DashboardShellProps {
  title: string;
  eyebrow: string;
  navItems: NavItem[];
  children: ReactNode;
}

export const DashboardShell = ({ title, eyebrow, navItems, children }: DashboardShellProps) => (
  <div className="shell">
    <aside className="sidebar">
      <div>
        <p className="sidebar-eyebrow">{eyebrow}</p>
        <h1 className="sidebar-brand">Radar Domače</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="sidebar-link">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
    <main className="main">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">{eyebrow}</p>
          <h2 className="page-title">{title}</h2>
        </div>
        <Link href="/login" className="ghost-button">
          Switch account
        </Link>
      </header>
      {children}
    </main>
  </div>
);
