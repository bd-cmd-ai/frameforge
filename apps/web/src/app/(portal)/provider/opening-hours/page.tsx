import { EmptyState } from "../../../../components/provider-portal/empty-state";
import { OpeningHoursEditor } from "../../../../components/provider-portal/opening-hours-editor";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { getProviderPortalContext } from "../../../../lib/provider/portal";

export default async function ProviderOpeningHoursPage() {
  const { provider, pendingClaim } = await getProviderPortalContext();

  return (
    <ProviderSectionCard title="Opening hours" description="Set a simple weekly schedule so travelers can see whether you are open now.">
      {!provider ? (
        <EmptyState
          title={pendingClaim ? "Claim pending" : "No provider linked yet"}
          description={pendingClaim ? "Opening hours unlock after claim approval." : "Claim a provider record first to manage your weekly schedule."}
          ctaHref="/provider/claim"
          ctaLabel="Open claim flow"
        />
      ) : (
        <OpeningHoursEditor providerId={provider.id} openingHours={provider.openingHours} />
      )}
    </ProviderSectionCard>
  );
}
