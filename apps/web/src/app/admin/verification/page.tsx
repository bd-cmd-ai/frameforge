import { providerApi } from "@radar-domace/api";
import { SectionCard } from "../../../components/section-card";

export default async function VerificationPage() {
  const providers = await providerApi.listProviders({
    radiusKm: 500,
    categoryIds: [],
    onlyOpenNow: false,
    onlyVerified: false,
    onlyFreshToday: false,
  });

  const unverified = providers.filter((provider) => !provider.isVerified);

  return (
    <SectionCard title="Verify providers" description="Verification controls the trust badge in the consumer app.">
      <div className="list">
        {unverified.map((provider) => (
          <div key={provider.id} className="list-item">
            <div>
              <strong>{provider.name.sl}</strong>
              <p className="muted">{provider.address.sl}</p>
            </div>
            <button className="primary-button" type="button">Verify provider</button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
