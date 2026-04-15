import { getAdminOfferPosts } from "@radar-domace/api";
import { AdminTableToolbar } from "../../../components/admin/admin-table-toolbar";
import { EmptyState } from "../../../components/admin/empty-state";
import { OfferModerationTable } from "../../../components/admin/offers/offer-moderation-table";
import { ProviderSectionCard } from "../../../components/provider-portal/provider-section-card";
import { requireRole } from "../../../lib/auth";

const offerStatuses = ["active", "archived", "expired", "draft"] as const;
type OfferStatusFilter = (typeof offerStatuses)[number];

export default async function AdminOffersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase } = await requireRole("admin");
  const status =
    typeof params.status === "string" && offerStatuses.includes(params.status as OfferStatusFilter)
      ? (params.status as OfferStatusFilter)
      : undefined;

  const offers = await getAdminOfferPosts(supabase, {
    providerSearch: typeof params.provider === "string" ? params.provider : undefined,
    status,
    onlyFreshToday: params.fresh === "true",
    onlyDiscount: params.discount === "true",
  });

  return (
    <ProviderSectionCard title="Offer moderation" description="Inspect active, archived, expired, and draft offers across all providers.">
      <div className="stack-lg">
        <AdminTableToolbar
          action="/admin/offers"
          fields={[
            { name: "provider", label: "Provider search", value: typeof params.provider === "string" ? params.provider : "", placeholder: "Honey, cheese..." },
            {
              name: "status",
              label: "Status",
              value: typeof params.status === "string" ? params.status : "",
              options: [
                { value: "", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
                { value: "expired", label: "Expired" },
                { value: "draft", label: "Draft" },
              ],
            },
            {
              name: "fresh",
              label: "Fresh Today",
              value: typeof params.fresh === "string" ? params.fresh : "",
              options: [
                { value: "", label: "All" },
                { value: "true", label: "Fresh Today only" },
              ],
            },
            {
              name: "discount",
              label: "Discount",
              value: typeof params.discount === "string" ? params.discount : "",
              options: [
                { value: "", label: "All" },
                { value: "true", label: "Discount only" },
              ],
            },
          ]}
        />

        {offers.length === 0 ? (
          <EmptyState title="No offers found" description="The current moderation filters returned no offer posts." />
        ) : (
          <OfferModerationTable offers={offers} />
        )}
      </div>
    </ProviderSectionCard>
  );
}
