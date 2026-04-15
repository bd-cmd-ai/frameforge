import Link from "next/link";
import { getAdminProviders } from "@radar-domace/api";
import { EmptyState } from "../../../components/admin/empty-state";
import { ProviderSectionCard } from "../../../components/provider-portal/provider-section-card";
import { pickLocalizedText } from "../../../lib/admin/format";
import { requireRole } from "../../../lib/auth";

export default async function VerificationPage() {
  const { supabase } = await requireRole("admin");
  const providers = await getAdminProviders(supabase, { verified: false });

  return (
    <ProviderSectionCard title="Verification queue" description="Providers that are still missing the verified flag.">
      {providers.length === 0 ? (
        <EmptyState title="No verification queue" description="Every visible provider is already verified." />
      ) : (
        <div className="list">
          {providers.map((provider) => (
            <div key={provider.id} className="list-item">
              <div>
                <strong>{pickLocalizedText(provider.name)}</strong>
                <p className="muted">{provider.cityLabel}</p>
              </div>
              <div className="inline-actions">
                <span className="badge">Pending</span>
                <Link href={`/admin/providers/${provider.id}`} className="ghost-button">
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProviderSectionCard>
  );
}
