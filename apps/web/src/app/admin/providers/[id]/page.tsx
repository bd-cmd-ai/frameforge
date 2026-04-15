import { getAdminClaimRequests, getAdminProviderById, getDashboardAnalyticsSummary, getMyProviderOffers } from "@radar-domace/api";
import { EmptyState } from "../../../../components/admin/empty-state";
import { ClaimRequestReviewCard } from "../../../../components/admin/claims/claim-request-review-card";
import { ProviderStatusPanel } from "../../../../components/admin/providers/provider-status-panel";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { formatClaimStatus, formatOfferStatus, pickLocalizedText } from "../../../../lib/admin/format";
import { requireRole } from "../../../../lib/auth";

export default async function AdminProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await requireRole("admin");
  const provider = await getAdminProviderById(supabase, id);

  if (!provider) {
    return <EmptyState title="Provider not found" description="The selected provider does not exist or is no longer available." />;
  }

  const [offers, analytics, claims] = await Promise.all([
    getMyProviderOffers(supabase, provider.id),
    getDashboardAnalyticsSummary(supabase, provider.id),
    getAdminClaimRequests(supabase),
  ]);
  const relatedClaims = claims.filter((claim) => claim.providerId === provider.id);

  return (
    <div className="grid">
      <div className="grid provider-two-col">
        <ProviderSectionCard title="Provider core info" description="Admin detail view for one provider record.">
          <div className="list">
            <div className="list-item compact">
              <div>
                <strong>{pickLocalizedText(provider.name)}</strong>
                <p className="muted">{pickLocalizedText(provider.address)}</p>
              </div>
              <span className="badge">{provider.isVerified ? "Verified" : "Unverified"}</span>
            </div>
            <div className="list-item compact">
              <div>
                <strong>Owner account</strong>
                <p className="muted">{provider.ownerUserId ?? "No owner linked"}</p>
              </div>
              <span className="badge">{provider.status ?? "unknown"}</span>
            </div>
            <div className="list-item compact">
              <div>
                <strong>Categories</strong>
                <p className="muted">
                  {provider.categories.length > 0
                    ? provider.categories.map((category) => pickLocalizedText(category.label)).join(", ")
                    : "No categories"}
                </p>
              </div>
            </div>
            <div className="list-item compact">
              <div>
                <strong>Analytics snapshot</strong>
                <p className="muted">
                  {analytics.profileViews} views • {analytics.navigationStarts} navigation starts • {analytics.favorites} favorites
                </p>
              </div>
            </div>
          </div>
        </ProviderSectionCard>

        <ProviderSectionCard title="Moderation actions" description="Admin-controlled status and verification state.">
          <ProviderStatusPanel provider={provider} reviewerId={profile.id} />
        </ProviderSectionCard>
      </div>

      <div className="grid provider-two-col">
        <ProviderSectionCard title="Opening hours and images" description="Quick completeness snapshot.">
          <div className="list">
            <div className="list-item compact">
              <strong>Opening hours configured</strong>
              <span className="badge">{provider.openingHours.length}</span>
            </div>
            <div className="list-item compact">
              <strong>Uploaded images</strong>
              <span className="badge">{provider.images.length}</span>
            </div>
            <div className="list-item compact">
              <strong>Current offers</strong>
              <span className="badge">{offers.length}</span>
            </div>
          </div>
        </ProviderSectionCard>

        <ProviderSectionCard title="Related claim requests" description="Claims connected to this provider profile.">
          {relatedClaims.length === 0 ? (
            <EmptyState title="No claim requests" description="No user has submitted a claim for this provider." />
          ) : (
            <div className="list">
              {relatedClaims.map((claim) => (
                <div key={claim.id} className="list-item">
                  <div>
                    <strong>{claim.requesterName}</strong>
                    <p className="muted">{claim.requesterEmail}</p>
                  </div>
                  <span className="badge">{formatClaimStatus(claim)}</span>
                </div>
              ))}
            </div>
          )}
        </ProviderSectionCard>
      </div>

      <div className="grid provider-two-col">
        <ProviderSectionCard title="Current offers" description="All offer posts attached to this provider.">
          {offers.length === 0 ? (
            <EmptyState title="No offers" description="This provider has not published any offers yet." />
          ) : (
            <div className="list">
              {offers.map((offer) => (
                <div key={offer.id} className="list-item">
                  <div>
                    <strong>{offer.title.sl || offer.title.en}</strong>
                    <p className="muted">{offer.body.sl || offer.body.en}</p>
                  </div>
                  <span className="badge">{formatOfferStatus({ ...offer, providerName: pickLocalizedText(provider.name) })}</span>
                </div>
              ))}
            </div>
          )}
        </ProviderSectionCard>

        {relatedClaims.find((claim) => claim.status === "pending") ? (
          <ProviderSectionCard title="Pending claim review" description="Approve or reject the latest pending claim from here.">
            <ClaimRequestReviewCard
              claim={relatedClaims.find((claim) => claim.status === "pending")!}
              reviewerId={profile.id}
            />
          </ProviderSectionCard>
        ) : null}
      </div>
    </div>
  );
}
