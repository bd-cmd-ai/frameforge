import { searchClaimableProviders } from "@radar-domace/api";
import { ClaimRequestFlow } from "../../../../components/provider-portal/claim-request-flow";
import { EmptyState } from "../../../../components/provider-portal/empty-state";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { formatClaimStatus } from "../../../../lib/provider/format";
import { getProviderPortalContext } from "../../../../lib/provider/portal";

export default async function ProviderClaimPage() {
  const { supabase, profile, provider, claims, pendingClaim } = await getProviderPortalContext();

  if (provider) {
    return (
      <ProviderSectionCard title="Claim" description="This account already owns a provider profile.">
        <EmptyState
          title="Ownership already linked"
          description="You can go straight to the dashboard or edit the linked provider profile."
          ctaHref="/dashboard"
          ctaLabel="Open dashboard"
        />
      </ProviderSectionCard>
    );
  }

  const providers = await searchClaimableProviders(supabase, "", 24);

  return (
    <ProviderSectionCard
      title={pendingClaim ? "Claim status" : "Claim a provider profile"}
      description={
        pendingClaim
          ? "You already have a pending request. You can still review available profiles below."
          : "Search for the producer profile that belongs to you, then submit a verification request."
      }
    >
      <div className="stack-lg">
        {claims.length > 0 ? (
          <div className="list">
            {claims.slice(0, 3).map((claim) => (
              <div className="list-item" key={claim.id}>
                <div>
                  <strong>Claim request</strong>
                  <p className="muted">{claim.requesterEmail}</p>
                </div>
                <span className="badge">{formatClaimStatus(claim)}</span>
              </div>
            ))}
          </div>
        ) : null}

        <ClaimRequestFlow profile={profile} initialProviders={providers} existingClaims={claims} />
      </div>
    </ProviderSectionCard>
  );
}
