import Link from "next/link";
import { getAdminProviders } from "@radar-domace/api";
import { AdminTableToolbar } from "../../../components/admin/admin-table-toolbar";
import { EmptyState } from "../../../components/admin/empty-state";
import { AdminStatusBadge } from "../../../components/admin/admin-status-badge";
import { ProviderSectionCard } from "../../../components/provider-portal/provider-section-card";
import { formatProviderStatus, pickLocalizedText } from "../../../lib/admin/format";
import { requireRole } from "../../../lib/auth";

const providerStatuses = ["draft", "pending_verification", "active", "suspended"] as const;
type ProviderStatusFilter = (typeof providerStatuses)[number];

export default async function AdminProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { supabase } = await requireRole("admin");
  const status =
    typeof params.status === "string" && providerStatuses.includes(params.status as ProviderStatusFilter)
      ? (params.status as ProviderStatusFilter)
      : undefined;

  const providers = await getAdminProviders(supabase, {
    status,
    verified:
      params.verified === "true" ? true : params.verified === "false" ? false : undefined,
    search: typeof params.search === "string" ? params.search : undefined,
    citySearch: typeof params.city === "string" ? params.city : undefined,
    sort: typeof params.sort === "string" && params.sort ? (params.sort as "newest" | "oldest" | "name") : "newest",
  });

  return (
    <ProviderSectionCard title="Providers" description="Browse, filter, and inspect provider records across the platform.">
      <div className="stack-lg">
        <AdminTableToolbar
          action="/admin/providers"
          fields={[
            { name: "search", label: "Name search", value: typeof params.search === "string" ? params.search : "", placeholder: "Cheese, honey, orchard..." },
            { name: "city", label: "City search", value: typeof params.city === "string" ? params.city : "", placeholder: "Ljubljana" },
            {
              name: "status",
              label: "Status",
              value: typeof params.status === "string" ? params.status : "",
              options: [
                { value: "", label: "All statuses" },
                { value: "draft", label: "Draft" },
                { value: "pending_verification", label: "Pending" },
                { value: "active", label: "Active" },
                { value: "suspended", label: "Suspended" },
              ],
            },
            {
              name: "verified",
              label: "Verified",
              value: typeof params.verified === "string" ? params.verified : "",
              options: [
                { value: "", label: "All" },
                { value: "true", label: "Verified only" },
                { value: "false", label: "Unverified only" },
              ],
            },
            {
              name: "sort",
              label: "Sort",
              value: typeof params.sort === "string" ? params.sort : "newest",
              options: [
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
                { value: "name", label: "Name" },
              ],
            },
          ]}
        />

        {providers.length === 0 ? (
          <EmptyState title="No providers match the filters" description="Try clearing one or more filters." />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Owner linked</th>
                <th>Categories</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id}>
                  <td>{pickLocalizedText(provider.name)}</td>
                  <td>{provider.cityLabel}</td>
                  <td>
                    <AdminStatusBadge tone={provider.status === "suspended" ? "danger" : provider.status === "active" ? "success" : "warning"}>
                      {formatProviderStatus(provider.status)}
                    </AdminStatusBadge>
                  </td>
                  <td>{provider.isVerified ? "Yes" : "No"}</td>
                  <td>{provider.ownerLinked ? "Linked" : "Unlinked"}</td>
                  <td>{provider.categoriesCount}</td>
                  <td>{new Date(provider.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/admin/providers/${provider.id}`} className="ghost-button">
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </ProviderSectionCard>
  );
}
