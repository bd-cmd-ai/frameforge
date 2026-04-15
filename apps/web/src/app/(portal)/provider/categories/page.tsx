import { getActiveCategories } from "@radar-domace/api";
import { CategorySelector } from "../../../../components/provider-portal/category-selector";
import { EmptyState } from "../../../../components/provider-portal/empty-state";
import { ProviderSectionCard } from "../../../../components/provider-portal/provider-section-card";
import { getProviderPortalContext } from "../../../../lib/provider/portal";

export default async function ProviderCategoriesPage() {
  const { supabase, provider, pendingClaim } = await getProviderPortalContext();

  if (!provider) {
    return (
      <ProviderSectionCard title="Categories" description="Choose the types of products and specialties you offer.">
        <EmptyState
          title={pendingClaim ? "Claim pending" : "No provider linked yet"}
          description={pendingClaim ? "Categories unlock after claim approval." : "Claim a provider record first to manage categories."}
          ctaHref="/provider/claim"
          ctaLabel="Open claim flow"
        />
      </ProviderSectionCard>
    );
  }

  const categories = await getActiveCategories(supabase);

  return (
    <ProviderSectionCard title="Categories" description="Select the categories that best describe what travelers can buy from you.">
      <CategorySelector providerId={provider.id} categories={categories} selectedIds={provider.categories.map((category) => category.id)} />
    </ProviderSectionCard>
  );
}
