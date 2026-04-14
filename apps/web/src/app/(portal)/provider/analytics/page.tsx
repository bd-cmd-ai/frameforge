import { providerApi } from "@radar-domace/api";
import { SectionCard } from "../../../../components/section-card";
import { StatCard } from "../../../../components/stat-card";

export default async function ProviderAnalyticsPage() {
  const analytics = await providerApi.getProviderAnalytics();

  return (
    <div className="grid">
      <div className="grid stats-grid">
        <StatCard label="Views" value={analytics.profileViews.toString()} hint="Provider profile opens" />
        <StatCard label="Navigation" value={analytics.navigationStarts.toString()} hint="Directions started" />
        <StatCard label="Favorites" value={analytics.favorites.toString()} hint="Consumer saves" />
        <StatCard label="Offers" value={analytics.activeOffers.toString()} hint="Live offer posts" />
      </div>
      <SectionCard title="Tracked event model" description="Basic analytics is ready for expansion into retention and campaign attribution.">
        <div className="note">
          Current MVP events: `app_opened`, `explore_viewed`, `provider_opened`, `navigation_started`, `favorite_toggled`,
          `filter_applied`, `portal_profile_saved`, `offer_created`, and `admin_provider_verified`.
        </div>
      </SectionCard>
    </div>
  );
}
