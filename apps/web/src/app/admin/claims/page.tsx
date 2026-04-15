import { getAdminClaimRequests } from "@radar-domace/api";
import { AdminTableToolbar } from "../../../components/admin/admin-table-toolbar";
import { ClaimRequestReviewCard } from "../../../components/admin/claims/claim-request-review-card";
import { EmptyState } from "../../../components/admin/empty-state";
import { ProviderSectionCard } from "../../../components/provider-portal/provider-section-card";
import { formatClaimStatus } from "../../../lib/admin/format";
import { requireRole } from "../../../lib/auth";

const claimStatuses = ["pending", "approved", "rejected"] as const;
type ClaimStatusFilter = (typeof claimStatuses)[number];

export default async function ClaimRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase, profile } = await requireRole("admin");
  const status =
    typeof params.status === "string" && claimStatuses.includes(params.status as ClaimStatusFilter)
      ? (params.status as ClaimStatusFilter)
      : undefined;

  const claims = await getAdminClaimRequests(supabase, {
    status,
    providerSearch: typeof params.provider === "string" ? params.provider : undefined,
  });
  const pendingClaim = claims.find((claim) => claim.status === "pending") ?? null;

  return (
    <div className="grid provider-two-col">
      <ProviderSectionCard title="Claim requests" description="Review ownership requests and link provider records safely.">
        <div className="stack-lg">
          <AdminTableToolbar
            action="/admin/claims"
            fields={[
              { name: "provider", label: "Provider search", value: typeof params.provider === "string" ? params.provider : "", placeholder: "Farm, dairy, orchard..." },
              {
                name: "status",
                label: "Status",
                value: typeof params.status === "string" ? params.status : "",
                options: [
                  { value: "", label: "All statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ],
              },
            ]}
          />

          {claims.length === 0 ? (
            <EmptyState title="No claim requests found" description="The current filters returned no claim requests." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Requester</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id}>
                    <td>{claim.providerName}</td>
                    <td>
                      {claim.requesterName}
                      <br />
                      <span className="muted">{claim.requesterEmail}</span>
                    </td>
                    <td>{claim.requesterPhone || "—"}</td>
                    <td>{formatClaimStatus(claim)}</td>
                    <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ProviderSectionCard>

      <ProviderSectionCard title="Review panel" description="Approve or reject the next pending request.">
        {pendingClaim ? (
          <ClaimRequestReviewCard claim={pendingClaim} reviewerId={profile.id} />
        ) : (
          <EmptyState title="No pending review" description="All visible claim requests are already resolved." />
        )}
      </ProviderSectionCard>
    </div>
  );
}
