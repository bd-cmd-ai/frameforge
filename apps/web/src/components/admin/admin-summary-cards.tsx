import type { AdminDashboardSummary } from "@radar-domace/types";
import { StatCard } from "../stat-card";

export const AdminSummaryCards = ({ summary }: { summary: AdminDashboardSummary }) => (
  <div className="grid admin-summary-grid">
    <StatCard label="Total providers" value={summary.totalProviders.toString()} hint="All provider rows" />
    <StatCard label="Active" value={summary.activeProviders.toString()} hint="Publicly active" />
    <StatCard label="Pending" value={summary.pendingProviders.toString()} hint="Needs review" />
    <StatCard label="Verified" value={summary.verifiedProviders.toString()} hint="Trust badge" />
    <StatCard label="Suspended" value={summary.suspendedProviders.toString()} hint="Not visible" />
    <StatCard label="Pending claims" value={summary.pendingClaimRequests.toString()} hint="Review queue" />
    <StatCard label="Active offers" value={summary.activeOfferPosts.toString()} hint="Currently live" />
    <StatCard label="Analytics events" value={summary.totalAnalyticsEvents.toString()} hint="Platform activity" />
  </div>
);
