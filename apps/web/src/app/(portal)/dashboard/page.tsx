import { providerApi } from "@radar-domace/api";
import { Badge } from "../../../components/badge";
import { SectionCard } from "../../../components/section-card";
import { StatCard } from "../../../components/stat-card";

export default async function ProviderDashboardPage() {
  const provider = await providerApi.getProvider("provider-1");
  const analytics = await providerApi.getProviderAnalytics();

  if (!provider) return null;

  return (
    <div className="grid">
      <div className="grid stats-grid">
        <StatCard label="Profile views" value={analytics.profileViews.toString()} hint="Last 30 days" />
        <StatCard label="Navigation starts" value={analytics.navigationStarts.toString()} hint="Tap-through intent" />
        <StatCard label="Favorites" value={analytics.favorites.toString()} hint="Saved by consumers" />
        <StatCard label="Active offers" value={analytics.activeOffers.toString()} hint="Visible today" />
      </div>

      <div className="grid two-col">
        <SectionCard title={provider.name.sl} description={provider.shortDescription.sl}>
          <div className="list">
            <div className="list-item">
              <div>
                <strong>Status</strong>
                <p className="muted">Public visibility requirements are satisfied.</p>
              </div>
              <Badge>{provider.isVerified ? "Verified" : "Pending verification"}</Badge>
            </div>
            <div className="list-item">
              <div>
                <strong>Categories</strong>
                <p className="muted">{provider.categories.map((category) => category.label.sl).join(", ")}</p>
              </div>
              <a className="ghost-button" href="/provider/categories">
                Manage
              </a>
            </div>
            <div className="list-item">
              <div>
                <strong>Live badges</strong>
                <p className="muted">{provider.badges.join(", ")}</p>
              </div>
              <a className="ghost-button" href="/provider/offers">
                Update offers
              </a>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="MVP roadmap hooks" description="Prepared for Stripe and richer analytics later.">
          <div className="note">
            The architecture separates discovery from commerce. Provider plans, sponsored placement, and Stripe billing can be
            added without redesigning the provider profile or explore flow.
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
