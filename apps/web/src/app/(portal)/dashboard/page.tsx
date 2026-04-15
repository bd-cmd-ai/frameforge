import Link from "next/link";
import { getDashboardAnalyticsSummary, getMyProviderOffers } from "@radar-domace/api";
import { AnalyticsSummaryCards } from "../../../components/provider-portal/analytics-summary-cards";
import { EmptyState } from "../../../components/provider-portal/empty-state";
import { ProviderChecklist } from "../../../components/provider-portal/provider-checklist";
import { ProviderDashboardHeader } from "../../../components/provider-portal/provider-dashboard-header";
import { ProviderSectionCard } from "../../../components/provider-portal/provider-section-card";
import { ProviderStatusCard } from "../../../components/provider-portal/provider-status-card";
import { buildProviderChecklist } from "../../../lib/provider/checklist";
import { formatOfferStatus, pickLocalizedText } from "../../../lib/provider/format";
import { getProviderPortalContext } from "../../../lib/provider/portal";
import { Badge } from "../../../components/badge";

export default async function ProviderDashboardPage() {
  const { supabase, provider, pendingClaim } = await getProviderPortalContext();

  if (!provider) {
    return (
      <div className="grid">
        <ProviderDashboardHeader provider={null} pendingClaim={Boolean(pendingClaim)} />
        <ProviderSectionCard
          title={pendingClaim ? "Claim under review" : "No provider profile linked yet"}
          description={
            pendingClaim
              ? "An admin still needs to verify your ownership before editing access is granted."
              : "Claim an existing producer profile to unlock editing tools."
          }
        >
          <EmptyState
            title={pendingClaim ? "Your claim is pending" : "Start with the claim flow"}
            description={
              pendingClaim
                ? "You can review the claim page for the latest status and next steps."
                : "Search for your producer profile, add a short verification note, and submit the request."
            }
            ctaHref="/provider/claim"
            ctaLabel={pendingClaim ? "View claim status" : "Open claim flow"}
          />
        </ProviderSectionCard>
      </div>
    );
  }

  const [analytics, offers] = await Promise.all([
    getDashboardAnalyticsSummary(supabase, provider.id),
    getMyProviderOffers(supabase, provider.id),
  ]);
  const checklist = buildProviderChecklist(provider, offers);

  return (
    <div className="grid">
      <ProviderDashboardHeader provider={provider} pendingClaim={false} />
      <AnalyticsSummaryCards analytics={analytics} />

      <div className="grid provider-two-col">
        <ProviderStatusCard provider={provider} />

        <ProviderSectionCard title="Latest offers" description="Your most recent promotional posts and their current system status.">
          {offers.length === 0 ? (
            <EmptyState
              title="No offers yet"
              description="Create your first fresh or discount post to stand out on the traveler map."
              ctaHref="/provider/offers"
              ctaLabel="Create offer"
            />
          ) : (
            <div className="list">
              {offers.slice(0, 4).map((offer) => (
                <div key={offer.id} className="list-item">
                  <div>
                    <strong>{pickLocalizedText(offer.title)}</strong>
                    <p className="muted">{pickLocalizedText(offer.body)}</p>
                  </div>
                  <div className="inline-actions">
                    <Badge>{formatOfferStatus(offer)}</Badge>
                    <Link href="/provider/offers" className="ghost-button">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ProviderSectionCard>

        <ProviderSectionCard title="Completion checklist" description="A quick way to see what still needs attention before travelers get the full experience.">
          <ProviderChecklist items={checklist} />
        </ProviderSectionCard>
      </div>
    </div>
  );
}
