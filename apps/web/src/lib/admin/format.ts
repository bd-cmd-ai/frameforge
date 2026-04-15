import type {
  AdminClaimRequestDetail,
  AdminOfferRecord,
  AdminProviderRecord,
  LocalizedText,
  ProviderCategory,
} from "@radar-domace/types";

export const pickLocalizedText = (value?: Partial<LocalizedText> | null) =>
  value?.sl?.trim() || value?.en?.trim() || value?.de?.trim() || value?.it?.trim() || "";

export const formatProviderStatus = (status?: string) => {
  if (status === "pending_verification") return "Pending";
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const formatClaimStatus = (claim: AdminClaimRequestDetail) =>
  claim.status.charAt(0).toUpperCase() + claim.status.slice(1);

export const formatOfferStatus = (offer: AdminOfferRecord) => {
  const now = Date.now();
  const startsAt = new Date(offer.startsAt).getTime();
  const endsAt = new Date(offer.endsAt).getTime();

  if (!offer.isApproved) return "Draft";
  if (!offer.isActive) return "Archived";
  if (endsAt < now) return "Expired";
  if (startsAt <= now && endsAt >= now) return "Active";
  return "Scheduled";
};

export const formatCategoryList = (categories: ProviderCategory[]) =>
  categories.length > 0 ? categories.map((category) => pickLocalizedText(category.label)).join(", ") : "No categories";

export const parseProviderOperationalState = (provider: AdminProviderRecord) => ({
  missingCategories: provider.categoriesCount === 0,
});
