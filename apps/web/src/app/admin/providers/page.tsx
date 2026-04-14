import { providerApi } from "@radar-domace/api";
import { Badge } from "../../../components/badge";
import { SectionCard } from "../../../components/section-card";

export default async function AdminProvidersPage() {
  const providers = await providerApi.listProviders({
    radiusKm: 500,
    categoryIds: [],
    onlyOpenNow: false,
    onlyVerified: false,
    onlyFreshToday: false,
  });

  return (
    <SectionCard title="Providers list" description="Public listing eligibility and moderation posture in one place.">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Distance bucket</th>
            <th>Categories</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id}>
              <td>{provider.name.sl}</td>
              <td>{(provider.distanceMeters / 1000).toFixed(1)} km</td>
              <td>{provider.categories.map((category) => category.label.sl).join(", ")}</td>
              <td>
                <Badge>{provider.isVerified ? "Verified" : "Needs review"}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SectionCard>
  );
}
