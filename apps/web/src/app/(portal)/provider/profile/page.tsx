import { EmptyState } from "../../../../components/provider-portal/empty-state";
import { ProviderProfileForm } from "../../../../components/provider-portal/provider-profile-form";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { getProviderPortalContext } from "../../../../lib/provider/portal";

export default async function ProviderProfilePage() {
  const { provider, pendingClaim } = await getProviderPortalContext();

  return (
    <ProviderSectionCard title="Provider profile" description="Edit the public-facing details travelers see in the app.">
      {!provider ? (
        <EmptyState
          title={pendingClaim ? "Claim pending" : "No provider linked yet"}
          description={
            pendingClaim
              ? "You can edit the profile once the pending claim is approved."
              : "Claim a provider record first, then return here to edit the profile."
          }
          ctaHref="/provider/claim"
          ctaLabel="Open claim flow"
        />
      ) : (
        <ProviderProfileForm provider={provider} />
      )}
    </ProviderSectionCard>
  );
}
