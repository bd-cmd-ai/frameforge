import Link from "next/link";
import { getAdminAnalyticsSummary, getAdminClaimRequests, getAdminDashboardSummary, getAdminOfferPosts, getAdminProviders } from "@radar-domace/api";
import { AdminSummaryCards } from "../../../components/admin/admin-summary-cards";
import { EmptyState } from "../../../components/admin/empty-state";
import { ProviderSectionCard } from "../../../components/provider-portal/provider-section-card";
import { formatClaimStatus, formatOfferStatus, formatProviderStatus, pickLocalizedText } from "../../../lib/admin/format";
import { requireRole } from "../../../lib/auth";

export default async function AdminDashboardPage() {
  const { supabase } = await requireRole("admin");
  const [summary, providers, claims, offers, analytics] = await Promise.all([
    getAdminDashboardSummary(supabase),
    getAdminProviders(supabase, { sort: "newest" }),
    getAdminClaimRequests(supabase, { status: "pending" }),
    getAdminOfferPosts(supabase),
    getAdminAnalyticsSummary(supabase),
  ]);

  return (
    <div className="grid">
      <AdminSummaryCards summary={summary} />

      <div className="grid provider-two-col">
        <ProviderSectionCard title="Recent providers" description="Newest provider records entering the moderation queue.">
          {providers.length === 0 ? (
            <EmptyState title="No providers yet" description="Provider records will appear here once seeded or created." />
          ) : (
            <div className="list">
              {providers.slice(0, 5).map((provider) => (
                <div key={provider.id} className="list-item">
                  <div>
                    <strong>{pickLocalizedText(provider.name)}</strong>
                    <p className="muted">{provider.cityLabel}</p>
                  </div>
                  <div className="inline-actions">
                    <span className="badge">{formatProviderStatus(provider.status)}</span>
                    <Link href={`/admin/providers/${provider.id}`} className="ghost-button">
                      Inspect
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ProviderSectionCard>

        <ProviderSectionCard title="Recent claim requests" description="Claims that still need an approval or rejection decision.">
          {claims.length === 0 ? (
            <EmptyState title="No pending claims" description="The review queue is empty right now." />
          ) : (
            <div className="list">
              {claims.slice(0, 5).map((claim) => (
                <div key={claim.id} className="list-item">
                  <div>
                    <strong>{claim.providerName}</strong>
                    <p className="muted">
                      {claim.requesterName} • {claim.requesterEmail}
                    </p>
                  </div>
                  <div className="inline-actions">
                    <span className="badge">{formatClaimStatus(claim)}</span>
                    <Link href="/admin/claims" className="ghost-button">
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ProviderSectionCard>
      </div>

      <div className="grid provider-two-col">
        <ProviderSectionCard title="Recent offer posts" description="Latest offer posts waiting for activation, expiry, or moderation cleanup.">
          {offers.length === 0 ? (
            <EmptyState title="No offers yet" description="Offer posts will appear here once providers start publishing them." />
          ) : (
            <div className="list">
              {offers.slice(0, 5).map((offer) => (
                <div key={offer.id} className="list-item">
                  <div>
                    <strong>{offer.providerName}</strong>
                    <p className="muted">{offer.title.sl || offer.title.en}</p>
                  </div>
                  <div className="inline-actions">
                    <span className="badge">{formatOfferStatus(offer)}</span>
                    <Link href="/admin/offers" className="ghost-button">
                      Moderate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ProviderSectionCard>

        <ProviderSectionCard title="Operational health" description="Quick indicators for records that still need platform ops attention.">
          <div className="list">
            <div className="list-item compact">
              <strong>Providers missing categories</strong>
              <span className="badge">{summary.providersMissingCategories}</span>
            </div>
            <div className="list-item compact">
              <strong>Providers missing opening hours</strong>
              <span className="badge">{summary.providersMissingOpeningHours}</span>
            </div>
            <div className="list-item compact">
              <strong>Providers missing images</strong>
              <span className="badge">{summary.providersMissingImages}</span>
            </div>
            <div className="list-item compact">
              <strong>Claims awaiting review</strong>
              <span className="badge">{summary.claimRequestsAwaitingReview}</span>
            </div>
            <div className="list-item compact">
              <strong>Total provider views tracked</strong>
              <span className="badge">{analytics.totalProviderViews}</span>
            </div>
          </div>
        </ProviderSectionCard>
      </div>
    </div>
  );
}
