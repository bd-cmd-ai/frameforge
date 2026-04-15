import type { AdminAnalyticsSummary } from "@radar-domace/types";
import { ProviderSectionCard } from "../provider-portal/provider-section-card";

const MetricList = ({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ providerId: string; providerName: string; count: number }>;
}) => (
  <ProviderSectionCard title={title}>
    {rows.length === 0 ? (
      <div className="empty-state compact">
        <h3>No events yet</h3>
        <p>This leaderboard will fill once user activity starts coming in.</p>
      </div>
    ) : (
      <div className="list">
        {rows.map((row) => (
          <div key={row.providerId} className="list-item">
            <strong>{row.providerName}</strong>
            <span className="badge">{row.count}</span>
          </div>
        ))}
      </div>
    )}
  </ProviderSectionCard>
);

export const AnalyticsSummaryBlock = ({ analytics }: { analytics: AdminAnalyticsSummary }) => (
  <div className="grid">
    <div className="grid admin-summary-grid">
      <div className="stat-card">
        <p className="stat-label">Provider views</p>
        <p className="stat-value">{analytics.totalProviderViews}</p>
        <p className="stat-hint">provider_opened</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Navigation starts</p>
        <p className="stat-value">{analytics.totalNavigationStarts}</p>
        <p className="stat-hint">navigation_started</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Call clicks</p>
        <p className="stat-value">{analytics.totalCallClicks}</p>
        <p className="stat-hint">provider_phone_clicked</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Website clicks</p>
        <p className="stat-value">{analytics.totalWebsiteClicks}</p>
        <p className="stat-hint">provider_website_clicked</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Favorite toggles</p>
        <p className="stat-value">{analytics.totalFavoriteToggles}</p>
        <p className="stat-hint">favorite_toggled</p>
      </div>
      <div className="stat-card">
        <p className="stat-label">All events</p>
        <p className="stat-value">{analytics.totalEvents}</p>
        <p className="stat-hint">analytics_events</p>
      </div>
    </div>

    <div className="grid provider-two-col">
      <MetricList title="Top viewed providers" rows={analytics.topViewedProviders} />
      <MetricList title="Top navigated providers" rows={analytics.topNavigatedProviders} />
      <MetricList title="Top phone-clicked providers" rows={analytics.topCallClickProviders} />
      <MetricList title="Top website-clicked providers" rows={analytics.topWebsiteClickProviders} />
    </div>
  </div>
);
