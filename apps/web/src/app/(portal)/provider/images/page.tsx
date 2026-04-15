import { EmptyState } from "../../../../components/provider-portal/empty-state";
import { ImageUploader } from "../../../../components/provider-portal/image-uploader";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { getProviderPortalContext } from "../../../../lib/provider/portal";

export default async function ProviderImagesPage() {
  const { provider, pendingClaim } = await getProviderPortalContext();

  return (
    <ProviderSectionCard title="Images" description="Upload a small gallery, reorder it, and choose which image becomes the primary cover.">
      {!provider ? (
        <EmptyState
          title={pendingClaim ? "Claim pending" : "No provider linked yet"}
          description={pendingClaim ? "Image management unlocks after approval." : "Claim a provider record first to upload images."}
          ctaHref="/provider/claim"
          ctaLabel="Open claim flow"
        />
      ) : (
        <ImageUploader providerId={provider.id} initialImages={provider.images} />
      )}
    </ProviderSectionCard>
  );
}
