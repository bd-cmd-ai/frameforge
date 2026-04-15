import { getMyProviderOffers } from "@radar-domace/api";
import { EmptyState } from "../../../../components/provider-portal/empty-state";
import { OfferPostsManager } from "../../../../components/provider-portal/offer-posts-manager";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { getProviderPortalContext } from "../../../../lib/provider/portal";

export default async function ProviderOffersPage() {
  const { supabase, provider, pendingClaim } = await getProviderPortalContext();

  if (!provider) {
    return (
      <ProviderSectionCard title="Offers" description="Create time-based posts that later feed Fresh Today or Discount badges in the mobile app.">
        <EmptyState
          title={pendingClaim ? "Claim pending" : "No provider linked yet"}
          description={pendingClaim ? "Offer management unlocks after claim approval." : "Claim a provider record first to create offers."}
          ctaHref="/provider/claim"
          ctaLabel="Open claim flow"
        />
      </ProviderSectionCard>
    );
  }

  const offers = await getMyProviderOffers(supabase, provider.id);

  return (
    <OfferPostsManager providerId={provider.id} offers={offers} />
  );
}
