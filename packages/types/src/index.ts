export type AppRole = "consumer" | "provider" | "admin";

export type SupportedLocale = "sl" | "en" | "de" | "it";

export type LocalizedText = Record<SupportedLocale, string>;

export type BadgeKey = "verified" | "fresh_today" | "discount" | "open_now" | "promoted";

export interface ProviderCategory {
  id: string;
  slug: string;
  label: LocalizedText;
  icon: string;
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
}

export interface ProviderSummary {
  id: string;
  slug: string;
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
  note: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AnalyticsEventInput {
  eventName:
    | "app_opened"
    | "explore_viewed"
    | "provider_opened"
    | "navigation_started"
    | "favorite_toggled"
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
  categoryIds: string[];
  onlyOpenNow: boolean;
  onlyVerified: boolean;
  onlyFreshToday: boolean;
}

export interface AnalyticsSummary {
  profileViews: number;
  navigationStarts: number;
  favorites: number;
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
