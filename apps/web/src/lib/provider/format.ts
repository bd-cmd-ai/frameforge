import type { ClaimRequest, LocalizedText, ProductOffer } from "@radar-domace/types";

export const pickLocalizedText = (value?: Partial<LocalizedText> | null) =>
  value?.sl?.trim() || value?.en?.trim() || value?.de?.trim() || value?.it?.trim() || "";

export const formatProviderStatus = (status: string) => {
  if (status === "pending_verification") return "Pending verification";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const getOfferStatus = (offer: ProductOffer) => {
  const now = Date.now();
  const startsAt = new Date(offer.startsAt).getTime();
  const endsAt = new Date(offer.endsAt).getTime();

  if (!offer.isApproved) return "draft";
  if (!offer.isActive) return "archived";
  if (endsAt < now) return "expired";
  if (startsAt <= now && endsAt >= now) return "active";
  return "scheduled";
};

export const formatOfferStatus = (offer: ProductOffer) =>
  getOfferStatus(offer)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const formatClaimStatus = (claim: ClaimRequest) =>
  claim.status.charAt(0).toUpperCase() + claim.status.slice(1);
