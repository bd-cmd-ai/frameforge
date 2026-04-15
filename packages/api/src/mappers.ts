import type {
  BadgeKey,
  ClaimRequest,
  Database,
  LocalizedText,
  ProductOffer,
  ProviderCategory,
  ProviderDetail,
  ProviderImage,
  ProviderSummary,
  UserProfile,
} from "@radar-domace/types";

type ProviderRow = Database["public"]["Tables"]["providers"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type OfferRow = Database["public"]["Tables"]["product_offers"]["Row"];
type ClaimRequestRow = Database["public"]["Tables"]["claim_requests"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProviderImageRow = Database["public"]["Tables"]["provider_images"]["Row"];
type OpeningHoursRow = Database["public"]["Tables"]["opening_hours"]["Row"];

const emptyText: LocalizedText = { sl: "", en: "", de: "", it: "" };

export const mapLocalizedText = (value: unknown): LocalizedText => {
  if (!value || typeof value !== "object") return emptyText;
  const record = value as Record<string, unknown>;
  return {
    sl: typeof record.sl === "string" ? record.sl : "",
    en: typeof record.en === "string" ? record.en : "",
    de: typeof record.de === "string" ? record.de : "",
    it: typeof record.it === "string" ? record.it : "",
  };
};

export const mapProfile = (row: ProfileRow): UserProfile => ({
  id: row.id,
  role: row.role,
  email: row.email ?? "",
  fullName: row.full_name ?? "",
  favoriteProviderIds: [],
});

export const mapCategory = (row: CategoryRow): ProviderCategory => ({
  id: row.id,
  slug: row.slug,
  label: mapLocalizedText(row.label_i18n),
  icon: row.icon_key,
  isActive: row.is_active,
});

export const mapOffer = (row: OfferRow): ProductOffer => ({
  id: row.id,
  providerId: row.provider_id,
  type: row.type,
  title: mapLocalizedText(row.title_i18n),
  body: mapLocalizedText(row.body_i18n),
  priceLabel: row.price_label,
  discountPercent: row.discount_percent,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  isActive: row.is_active,
  isApproved: row.is_approved,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapProviderImage = (row: ProviderImageRow): ProviderImage => ({
  id: row.id,
  providerId: row.provider_id,
  path: row.storage_path,
  isCover: row.is_cover,
  sortOrder: row.sort_order,
  alt: mapLocalizedText(row.alt_i18n),
});

export const mapOpeningHour = (row: OpeningHoursRow) => ({
  id: row.id,
  dayOfWeek: row.day_of_week,
  opensAt: row.opens_at ?? "",
  closesAt: row.closes_at ?? "",
  isClosed: row.is_closed,
});

export const mapClaimRequest = (row: ClaimRequestRow): ClaimRequest => ({
  id: row.id,
  providerId: row.provider_id,
  requesterName: row.requester_name,
  requesterEmail: row.requester_email,
  requesterPhone: row.requester_phone,
  requesterUserId: row.requester_user_id,
  note: row.note ?? "",
  status: row.status,
  createdAt: row.created_at,
  reviewedAt: row.reviewed_at,
  reviewedBy: row.reviewed_by,
});

export const buildBadges = (input: {
  isVerified: boolean;
  isPromoted: boolean;
  hasFreshToday: boolean;
  hasDiscount: boolean;
  isOpenNow: boolean;
}): BadgeKey[] => {
  const badges: BadgeKey[] = [];
  if (input.isVerified) badges.push("verified");
  if (input.hasFreshToday) badges.push("fresh_today");
  if (input.hasDiscount) badges.push("discount");
  if (input.isOpenNow) badges.push("open_now");
  if (input.isPromoted) badges.push("promoted");
  return badges;
};

export const mapProviderSummary = (
  row: Pick<
    ProviderRow,
    | "id"
    | "slug"
    | "name_i18n"
    | "short_description_i18n"
    | "address_i18n"
    | "latitude"
    | "longitude"
    | "is_verified"
    | "hero_image_path"
  > & {
    status?: string;
    owner_user_id?: string | null;
    distance_meters?: number | null;
    is_open_now: boolean;
    is_promoted: boolean;
    has_fresh_today: boolean;
    has_discount: boolean;
    categories?: ProviderCategory[];
    badges?: string[] | null;
  },
): ProviderSummary => ({
  id: row.id,
  slug: row.slug,
  status: row.status,
  ownerUserId: row.owner_user_id,
  name: mapLocalizedText(row.name_i18n),
  shortDescription: mapLocalizedText(row.short_description_i18n),
  address: mapLocalizedText(row.address_i18n),
  latitude: row.latitude ?? 0,
  longitude: row.longitude ?? 0,
  distanceMeters: row.distance_meters ?? 0,
  isOpenNow: row.is_open_now,
  isVerified: row.is_verified,
  isPromoted: row.is_promoted,
  hasFreshToday: row.has_fresh_today,
  hasDiscount: row.has_discount,
  badges:
    row.badges?.filter(Boolean).map((badge) => badge as BadgeKey) ??
    buildBadges({
      isVerified: row.is_verified,
      isPromoted: row.is_promoted,
      hasFreshToday: row.has_fresh_today,
      hasDiscount: row.has_discount,
      isOpenNow: row.is_open_now,
    }),
  categories: row.categories ?? [],
  coverImage: row.hero_image_path,
});

export const mapProviderDetail = (input: {
  provider: ProviderRow & {
    is_open_now: boolean;
    is_promoted_now: boolean;
    has_fresh_today: boolean;
    has_discount: boolean;
  };
  categories: ProviderCategory[];
  images: ProviderImage[];
  offers: ProductOffer[];
  openingHours: ReturnType<typeof mapOpeningHour>[];
}): ProviderDetail => ({
  ...mapProviderSummary({
    ...input.provider,
    is_open_now: input.provider.is_open_now,
    is_promoted: input.provider.is_promoted_now,
    has_fresh_today: input.provider.has_fresh_today,
    has_discount: input.provider.has_discount,
    categories: input.categories,
  }),
  description: mapLocalizedText(input.provider.description_i18n),
  phone: input.provider.phone,
  email: input.provider.email,
  website: input.provider.website_url,
  openingHours: input.openingHours,
  images: input.images,
  offers: input.offers,
});
