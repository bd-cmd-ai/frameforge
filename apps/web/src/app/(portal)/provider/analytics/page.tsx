import { getDashboardAnalyticsSummary } from "@radar-domace/api";
import { AnalyticsSummaryCards } from "../../../../components/provider-portal/analytics-summary-cards";
import { EmptyState } from "../../../../components/provider-portal/empty-state";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { getProviderPortalContext } from "../../../../lib/provider/portal";

export default async function ProviderAnalyticsPage() {
  const { supabase, provider, pendingClaim } = await getProviderPortalContext();

  if (!provider) {
    return (
      <ProviderSectionCard title="Analytics" description="See how often travelers view, save, and act on your profile.">
        <EmptyState
          title={pendingClaim ? "Claim pending" : "No provider linked yet"}
          description={pendingClaim ? "Analytics unlock after claim approval." : "Claim a provider record first to see analytics."}
          ctaHref="/provider/claim"
          ctaLabel="Open claim flow"
        />
      </ProviderSectionCard>
    );
  }

  const analytics = await getDashboardAnalyticsSummary(supabase, provider.id);

  return (
    <ProviderSectionCard title="Analytics" description="Simple aggregated counts from the current MVP analytics tables.">
      <AnalyticsSummaryCards analytics={analytics} />
    </ProviderSectionCard>
  );
}
