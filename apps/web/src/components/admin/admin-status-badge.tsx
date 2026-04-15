import type { ReactNode } from "react";

export const AdminStatusBadge = ({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger";
  children: ReactNode;
}) => <span className={`badge admin-badge ${tone}`}>{children}</span>;
