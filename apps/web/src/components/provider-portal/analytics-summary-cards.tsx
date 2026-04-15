import type { AnalyticsSummary } from "@radar-domace/types";
import { StatCard } from "../stat-card";

export const AnalyticsSummaryCards = ({ analytics }: { analytics: AnalyticsSummary }) => (
  <div className="grid stats-grid provider-stats-grid">
    <StatCard label="Profile views" value={analytics.profileViews.toString()} hint="Profile opens" />
    <StatCard label="Navigation starts" value={analytics.navigationStarts.toString()} hint="Maps CTA" />
    <StatCard label="Call clicks" value={analytics.callClicks.toString()} hint="Phone CTA" />
    <StatCard label="Website clicks" value={analytics.websiteClicks.toString()} hint="Website CTA" />
    <StatCard label="Favorites" value={analytics.favorites.toString()} hint="Saved by travelers" />
    <StatCard label="All offers" value={analytics.totalOffers.toString()} hint="Total posts" />
    <StatCard label="Active offers" value={analytics.activeOffers.toString()} hint="Live now" />
  </div>
);
