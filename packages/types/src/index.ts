export type AppRole = "consumer" | "provider" | "admin";

export type SupportedLocale = "sl" | "en" | "de" | "it";

export type LocalizedText = Record<SupportedLocale, string>;

export type BadgeKey = "verified" | "fresh_today" | "discount" | "open_now" | "promoted";

export interface ProviderCategory {
  id: string;
  slug: string;
  label: LocalizedText;
  icon: string;
  isActive?: boolean;
}

export interface OpeningHour {
  id: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
  isClosed: boolean;
}

export interface ProviderImage {
  id: string;
  providerId: string;
  path: string;
  isCover: boolean;
  sortOrder: number;
  alt: LocalizedText;
}

export type OfferType = "fresh_today" | "discount" | "general" | "promoted";

export interface ProductOffer {
  id: string;
  providerId: string;
  type: OfferType;
  title: LocalizedText;
  body: LocalizedText;
  priceLabel?: string | null;
  discountPercent?: number | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSummary {
  id: string;
  slug: string;
  status?: string;
  ownerUserId?: string | null;
  name: LocalizedText;
  shortDescription: LocalizedText;
  address: LocalizedText;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  isOpenNow: boolean;
  isVerified: boolean;
  isPromoted: boolean;
  hasFreshToday: boolean;
  hasDiscount: boolean;
  badges: BadgeKey[];
  categories: ProviderCategory[];
  coverImage?: string | null;
}

export interface ProviderDetail extends ProviderSummary {
  description: LocalizedText;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  openingHours: OpeningHour[];
  images: ProviderImage[];
  offers: ProductOffer[];
}

export interface UserProfile {
  id: string;
  role: AppRole;
  email: string;
  fullName: string;
  favoriteProviderIds: string[];
}

export interface ClaimRequest {
  id: string;
  providerId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string | null;
  requesterUserId?: string | null;
  note: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

export interface AnalyticsEventInput {
  eventName:
    | "app_opened"
    | "explore_viewed"
    | "provider_opened"
    | "navigation_started"
    | "provider_phone_clicked"
    | "provider_website_clicked"
    | "favorite_toggled"
    | "claim_request_created"
    | "offer_post_created"
    | "offer_post_updated"
    | "filter_applied"
    | "portal_profile_saved"
    | "offer_created"
    | "admin_provider_verified";
  actorRole?: AppRole;
  providerId?: string;
  metadata?: Record<string, unknown>;
}

export interface ExploreFilters {
  radiusKm: number;
  categoryKeys: string[];
  onlyOpenNow: boolean;
  onlyVerified: boolean;
  onlyFreshToday: boolean;
  onlyDiscount: boolean;
}

export type ExploreViewMode = "map" | "list";

export interface AnalyticsSummary {
  profileViews: number;
  navigationStarts: number;
  callClicks: number;
  websiteClicks: number;
  favorites: number;
  totalOffers: number;
  activeOffers: number;
}

export interface ProviderFormValues {
  name: LocalizedText;
  shortDescription: LocalizedText;
  description: LocalizedText;
  address: LocalizedText;
  latitude: number;
  longitude: number;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

export interface AdminDashboardSummary {
  totalProviders: number;
  activeProviders: number;
  pendingProviders: number;
  verifiedProviders: number;
  suspendedProviders: number;
  pendingClaimRequests: number;
  activeOfferPosts: number;
  totalAnalyticsEvents: number;
  providersMissingCategories: number;
  providersMissingOpeningHours: number;
  providersMissingImages: number;
  claimRequestsAwaitingReview: number;
}

export interface AdminProviderRecord extends ProviderSummary {
  ownerUserId?: string | null;
  ownerLinked: boolean;
  categoriesCount: number;
  createdAt: string;
  cityLabel: string;
}

export interface AdminClaimRequestDetail extends ClaimRequest {
  providerName: string;
  providerSlug?: string;
}

export interface AdminOfferRecord extends ProductOffer {
  providerName: string;
  providerSlug?: string;
}

export interface AdminTopProviderMetric {
  providerId: string;
  providerName: string;
  count: number;
}

export interface AdminAnalyticsSummary {
  totalProviderViews: number;
  totalNavigationStarts: number;
  totalCallClicks: number;
  totalWebsiteClicks: number;
  totalFavoriteToggles: number;
  totalEvents: number;
  topViewedProviders: AdminTopProviderMetric[];
  topNavigatedProviders: AdminTopProviderMetric[];
  topCallClickProviders: AdminTopProviderMetric[];
  topWebsiteClickProviders: AdminTopProviderMetric[];
}

export * from "./database.generated";
