import type { PostgrestError } from "@supabase/supabase-js";
import type {
  AnalyticsEventInput,
  AdminAnalyticsSummary,
  AdminClaimRequestDetail,
  AdminDashboardSummary,
  AdminOfferRecord,
  AdminProviderRecord,
  AnalyticsSummary,
  ClaimRequest,
  Database,
  Json,
  LocalizedText,
  ProductOffer,
  ProviderDetail,
  ProviderFormValues,
  ProviderSummary,
  UserProfile,
} from "@radar-domace/types";
import { mapCategory, mapClaimRequest, mapOffer, mapOpeningHour, mapProviderDetail, mapProviderImage, mapProviderSummary } from "./mappers";
import type { AppSupabaseClient, MutationResult } from "./supabase";

const asErrorMessage = (error: PostgrestError | Error | null) => error?.message ?? null;

const loadProviderCategories = async (client: AppSupabaseClient, providerIds: string[]) => {
  if (providerIds.length === 0) return new Map<string, ReturnType<typeof mapCategory>[]>();

  const { data, error } = await client
    .from("provider_categories")
    .select("provider_id, categories!inner(*)")
    .in("provider_id", providerIds);

  if (error) throw error;

  const map = new Map<string, ReturnType<typeof mapCategory>[]>();

  for (const row of data) {
    const existing = map.get(row.provider_id) ?? [];
    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    if (category) {
      existing.push(mapCategory(category));
      map.set(row.provider_id, existing);
    }
  }

  return map;
};

const loadProviderSupportData = async (client: AppSupabaseClient, providerId: string) => {
  const [categoriesMap, { data: imageRows, error: imageError }, { data: hoursRows, error: hoursError }, { data: offerRows, error: offerError }] =
    await Promise.all([
      loadProviderCategories(client, [providerId]),
      client
        .from("provider_images")
        .select("*")
        .eq("provider_id", providerId)
        .order("sort_order", { ascending: true }),
      client
        .from("opening_hours")
        .select("*")
        .eq("provider_id", providerId)
        .order("day_of_week", { ascending: true }),
      client
        .from("product_offers")
        .select("*")
        .eq("provider_id", providerId)
        .eq("is_active", true)
        .order("starts_at", { ascending: false }),
    ]);

  if (imageError) throw imageError;
  if (hoursError) throw hoursError;
  if (offerError) throw offerError;

  return {
    categories: categoriesMap.get(providerId) ?? [],
    images: (imageRows ?? []).map(mapProviderImage),
    openingHours: (hoursRows ?? []).map(mapOpeningHour),
    offers: (offerRows ?? []).map(mapOffer),
  };
};

const buildProviderDetailFromBase = async (
  client: AppSupabaseClient,
  provider: Database["public"]["Tables"]["providers"]["Row"] & {
    is_open_now: boolean;
    is_promoted_now: boolean;
    has_fresh_today: boolean;
    has_discount: boolean;
  },
): Promise<ProviderDetail> => {
  const support = await loadProviderSupportData(client, provider.id);
  const activePublicOffers = support.offers.filter((offer) => {
    const now = Date.now();
    const startsAt = new Date(offer.startsAt).getTime();
    const endsAt = new Date(offer.endsAt).getTime();
    return offer.isActive && offer.isApproved && startsAt <= now && endsAt >= now;
  });

  return mapProviderDetail({
    provider,
    categories: support.categories,
    images: support.images,
    offers: activePublicOffers,
    openingHours: support.openingHours,
  });
};

const getPrimaryLocaleText = (value: unknown) => {
  const text = JSON.stringify(value ?? {});
  try {
    const record = value as Record<string, unknown>;
    return [record.sl, record.en, record.de, record.it].find((entry) => typeof entry === "string" && entry.trim()) as string | undefined;
  } catch {
    return text;
  }
};

const deriveCityLabel = (value: unknown) => {
  const text = getPrimaryLocaleText(value) ?? "";
  const segments = text.split(",").map((segment) => segment.trim()).filter(Boolean);
  return segments[segments.length - 1] ?? "Unknown";
};

export interface NearbyParams {
  lat: number;
  lng: number;
  radiusKm: number;
  categoryKeys?: string[];
  openNow?: boolean;
  search?: string;
  onlyVerified?: boolean;
  onlyFreshToday?: boolean;
  onlyDiscount?: boolean;
}

interface SearchProviderRow {
  id: string;
  slug: string;
  name_i18n: Json;
  short_description_i18n: Json;
  address_i18n: Json;
  latitude: number;
  longitude: number;
  distance_meters: number;
  is_open_now: boolean;
  is_verified: boolean;
  is_promoted: boolean;
  has_fresh_today: boolean;
  has_discount: boolean;
  badges: string[] | null;
  hero_image_path: string | null;
}

export const trackAnalyticsEvent = async (
  client: AppSupabaseClient,
  input: AnalyticsEventInput & {
    actorUserId?: string | null;
    happenedAt?: string;
  },
): Promise<MutationResult<{ id: number }>> => {
  const { data, error } = await client
    .from("analytics_events")
    .insert({
      actor_user_id: input.actorUserId ?? null,
      actor_role: input.actorRole ?? null,
      provider_id: input.providerId ?? null,
      event_name: input.eventName,
      metadata: (input.metadata ?? {}) as Json,
      happened_at: input.happenedAt ?? new Date().toISOString(),
    })
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const getActiveCategories = async (client: AppSupabaseClient) => {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
};

export const getActiveProvidersNearby = async (
  client: AppSupabaseClient,
  params: NearbyParams,
): Promise<ProviderSummary[]> => {
  let categoryIds: string[] | null = null;

  if (params.categoryKeys?.length) {
    const { data: categoryRows, error: categoryError } = await client
      .from("categories")
      .select("id")
      .in("slug", params.categoryKeys)
      .eq("is_active", true);

    if (categoryError) throw categoryError;
    categoryIds = categoryRows.map((row) => row.id);
  }

  const { data, error } = await client.rpc("search_providers", {
    search_lat: params.lat,
    search_lng: params.lng,
    radius_meters: params.radiusKm * 1000,
    category_ids: categoryIds,
    only_open_now: params.openNow ?? false,
    only_verified: params.onlyVerified ?? false,
    only_fresh_today: params.onlyFreshToday ?? false,
    result_limit: 50,
  });

  if (error) throw error;

  const rpcRows = (data ?? []) as SearchProviderRow[];

  const filtered = rpcRows.filter((row) => {
    if (params.onlyDiscount && !row.has_discount) return false;

    if (!params.search) return true;
    const needle = params.search.toLowerCase().trim();
    return (
      JSON.stringify(row.name_i18n).toLowerCase().includes(needle) ||
      JSON.stringify(row.short_description_i18n).toLowerCase().includes(needle)
    );
  });

  const categoriesMap = await loadProviderCategories(
    client,
    filtered.map((row) => row.id),
  );

  return filtered.map((row) =>
    mapProviderSummary({
      id: row.id,
      slug: row.slug,
      name_i18n: row.name_i18n,
      short_description_i18n: row.short_description_i18n,
      address_i18n: row.address_i18n,
      latitude: row.latitude,
      longitude: row.longitude,
      distance_meters: row.distance_meters,
      is_open_now: row.is_open_now,
      is_verified: row.is_verified,
      is_promoted: row.is_promoted,
      has_fresh_today: row.has_fresh_today,
      has_discount: row.has_discount,
      badges: row.badges,
      hero_image_path: row.hero_image_path,
      categories: categoriesMap.get(row.id) ?? [],
    }),
  );
};

export const getProviderBySlug = async (
  client: AppSupabaseClient,
  slug: string,
): Promise<ProviderDetail | null> => {
  const { data: provider, error: providerError } = await client
    .from("provider_public_profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (providerError) {
    if (providerError.code === "PGRST116") return null;
    throw providerError;
  }
  if (!provider.id || !provider.slug) {
    return null;
  }

  const support = await loadProviderSupportData(client, provider.id);
  const activePublicOffers = support.offers.filter((offer) => {
    const now = Date.now();
    const startsAt = new Date(offer.startsAt).getTime();
    const endsAt = new Date(offer.endsAt).getTime();
    return offer.isActive && offer.isApproved && startsAt <= now && endsAt >= now;
  });

  return mapProviderDetail({
    provider: {
      id: provider.id,
      slug: provider.slug,
      owner_user_id: null,
      status: "active",
      is_verified: provider.is_verified ?? false,
      verified_at: null,
      verified_by: null,
      is_promoted: provider.is_promoted ?? false,
      source_place_id: null,
      source_type: "manual",
      promoted_until: null,
      timezone: "Europe/Ljubljana",
      name_i18n: provider.name_i18n ?? {},
      short_description_i18n: provider.short_description_i18n ?? {},
      description_i18n: provider.description_i18n ?? {},
      address_i18n: provider.address_i18n ?? {},
      phone: provider.phone,
      email: provider.email,
      website_url: provider.website_url,
      location: null,
      latitude: provider.latitude,
      longitude: provider.longitude,
      hero_image_path: provider.hero_image_path,
      created_at: new Date(0).toISOString(),
      updated_at: new Date(0).toISOString(),
      is_open_now: provider.is_open_now ?? false,
      is_promoted_now: provider.is_promoted ?? false,
      has_fresh_today: provider.has_fresh_today ?? false,
      has_discount: provider.has_discount ?? false,
    },
    categories: support.categories,
    images: support.images,
    offers: activePublicOffers,
    openingHours: support.openingHours,
  });
};

export const getUserFavorites = async (
  client: AppSupabaseClient,
  userId: string,
): Promise<ProviderSummary[]> => {
  const { data, error } = await client
    .from("favorites")
    .select("provider_id")
    .eq("user_id", userId);

  if (error) throw error;
  if (!data.length) return [];

  const favoriteIds = data.map((row) => row.provider_id);
  const { data: providerRows, error: providerError } = await client
    .from("provider_public_cards")
    .select("*")
    .in("id", favoriteIds);

  if (providerError) throw providerError;

  const categoriesMap = await loadProviderCategories(client, favoriteIds);

  return (providerRows ?? []).map((row) =>
    mapProviderSummary({
      id: row.id ?? "",
      slug: row.slug ?? "",
      name_i18n: row.name_i18n ?? {},
      short_description_i18n: row.short_description_i18n ?? {},
      address_i18n: row.address_i18n ?? {},
      latitude: row.latitude,
      longitude: row.longitude,
      distance_meters: 0,
      is_open_now: row.is_open_now ?? false,
      is_verified: row.is_verified ?? false,
      is_promoted: row.is_promoted ?? false,
      has_fresh_today: row.has_fresh_today ?? false,
      has_discount: row.has_discount ?? false,
      badges: row.badges,
      hero_image_path: row.hero_image_path,
      categories: categoriesMap.get(row.id ?? "") ?? [],
    }),
  );
};

export const toggleFavorite = async (
  client: AppSupabaseClient,
  userId: string,
  providerId: string,
): Promise<MutationResult<{ isFavorite: boolean }>> => {
  const { data: existing, error: existingError } = await client
    .from("favorites")
    .select("provider_id")
    .eq("user_id", userId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (existingError) {
    return { data: null, error: existingError.message };
  }

  if (existing) {
    const { error } = await client
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("provider_id", providerId);

    return { data: error ? null : { isFavorite: false }, error: asErrorMessage(error) };
  }

  const { error } = await client.from("favorites").insert({
    user_id: userId,
    provider_id: providerId,
  });

  return { data: error ? null : { isFavorite: true }, error: asErrorMessage(error) };
};

export interface ClaimRequestInput {
  providerId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  message: string;
  requesterUserId?: string;
}

export const createClaimRequest = async (
  client: AppSupabaseClient,
  input: ClaimRequestInput,
): Promise<MutationResult<ClaimRequest>> => {
  const { data, error } = await client
    .from("claim_requests")
    .insert({
      provider_id: input.providerId,
      requester_name: input.requesterName,
      requester_email: input.requesterEmail,
      requester_phone: input.requesterPhone ?? null,
      note: input.message,
      requester_user_id: input.requesterUserId ?? null,
    })
    .select("*")
    .single();

  return { data: data ? mapClaimRequest(data) : null, error: asErrorMessage(error) };
};

export const getMyClaimRequests = async (
  client: AppSupabaseClient,
  requesterUserId: string,
): Promise<ClaimRequest[]> => {
  const { data, error } = await client
    .from("claim_requests")
    .select("*")
    .eq("requester_user_id", requesterUserId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapClaimRequest);
};

export const searchClaimableProviders = async (
  client: AppSupabaseClient,
  search = "",
  limit = 20,
): Promise<ProviderSummary[]> => {
  const { data, error } = await client
    .from("provider_public_cards")
    .select("*")
    .limit(limit);

  if (error) throw error;

  const rows = (data ?? []).filter((row) => {
    if (!search.trim()) return true;
    const needle = search.toLowerCase().trim();
    return (
      JSON.stringify(row.name_i18n ?? {}).toLowerCase().includes(needle) ||
      JSON.stringify(row.address_i18n ?? {}).toLowerCase().includes(needle)
    );
  });

  const categoriesMap = await loadProviderCategories(
    client,
    rows.map((row) => row.id ?? "").filter(Boolean),
  );

  return rows.map((row) =>
    mapProviderSummary({
      id: row.id ?? "",
      slug: row.slug ?? "",
      name_i18n: row.name_i18n ?? {},
      short_description_i18n: row.short_description_i18n ?? {},
      address_i18n: row.address_i18n ?? {},
      latitude: row.latitude,
      longitude: row.longitude,
      distance_meters: 0,
      is_open_now: row.is_open_now ?? false,
      is_verified: row.is_verified ?? false,
      is_promoted: row.is_promoted ?? false,
      has_fresh_today: row.has_fresh_today ?? false,
      has_discount: row.has_discount ?? false,
      badges: row.badges,
      hero_image_path: row.hero_image_path,
      categories: categoriesMap.get(row.id ?? "") ?? [],
    }),
  );
};

export const getMyProvider = async (
  client: AppSupabaseClient,
  ownerUserId: string,
): Promise<ProviderDetail | null> => {
  const { data, error } = await client
    .from("providers")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [{ data: open }, { data: fresh }, { data: discount }, { data: promoted }] = await Promise.all([
    client.rpc("provider_is_open_now", { provider_uuid: data.id }),
    client.rpc("provider_has_active_offer", { provider_uuid: data.id, offer_kind: "fresh_today" }),
    client.rpc("provider_has_active_offer", { provider_uuid: data.id, offer_kind: "discount" }),
    client.rpc("provider_is_currently_promoted", { provider_uuid: data.id }),
  ]);

  return buildProviderDetailFromBase(client, {
    ...data,
    is_open_now: Boolean(open),
    is_promoted_now: Boolean(promoted),
    has_fresh_today: Boolean(fresh),
    has_discount: Boolean(discount),
  });
};

export const updateMyProvider = async (
  client: AppSupabaseClient,
  input: { providerId: string; values: ProviderFormValues },
): Promise<MutationResult<{ id: string }>> => {
  const payload: Database["public"]["Tables"]["providers"]["Update"] = {
    name_i18n: input.values.name,
    short_description_i18n: input.values.shortDescription,
    description_i18n: input.values.description,
    address_i18n: input.values.address,
    latitude: input.values.latitude,
    longitude: input.values.longitude,
    phone: input.values.phone ?? null,
    email: input.values.email ?? null,
    website_url: input.values.website ?? null,
  };

  const { data, error } = await client
    .from("providers")
    .update(payload)
    .eq("id", input.providerId)
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const getMyProviderOffers = async (
  client: AppSupabaseClient,
  providerId: string,
): Promise<ProductOffer[]> => {
  const { data, error } = await client
    .from("product_offers")
    .select("*")
    .eq("provider_id", providerId)
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapOffer);
};

export const replaceProviderCategories = async (
  client: AppSupabaseClient,
  input: { providerId: string; categoryIds: string[] },
): Promise<MutationResult<{ providerId: string }>> => {
  const { data: existingRows, error: existingError } = await client
    .from("provider_categories")
    .select("category_id")
    .eq("provider_id", input.providerId);

  if (existingError) {
    return { data: null, error: existingError.message };
  }

  const existingIds = new Set((existingRows ?? []).map((row) => row.category_id));
  const nextIds = new Set(input.categoryIds);
  const toDelete = [...existingIds].filter((id) => !nextIds.has(id));
  const toInsert = [...nextIds].filter((id) => !existingIds.has(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("provider_categories")
      .delete()
      .eq("provider_id", input.providerId)
      .in("category_id", toDelete);

    if (error) return { data: null, error: error.message };
  }

  if (toInsert.length > 0) {
    const { error } = await client.from("provider_categories").insert(
      toInsert.map((categoryId) => ({
        provider_id: input.providerId,
        category_id: categoryId,
      })),
    );

    if (error) return { data: null, error: error.message };
  }

  return { data: { providerId: input.providerId }, error: null };
};

export const listProviderImages = async (
  client: AppSupabaseClient,
  providerId: string,
) => {
  const { data, error } = await client
    .from("provider_images")
    .select("*")
    .eq("provider_id", providerId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProviderImage);
};

export interface ProviderImageInput {
  providerId: string;
  storagePath: string;
  sortOrder?: number;
  isCover?: boolean;
  alt?: LocalizedText;
}

export const createProviderImage = async (
  client: AppSupabaseClient,
  input: ProviderImageInput,
) => {
  const { data, error } = await client
    .from("provider_images")
    .insert({
      provider_id: input.providerId,
      storage_path: input.storagePath,
      sort_order: input.sortOrder ?? 0,
      is_cover: input.isCover ?? false,
      alt_i18n: input.alt ?? { sl: "", en: "", de: "", it: "" },
    })
    .select("*")
    .single();

  return { data: data ? mapProviderImage(data) : null, error: asErrorMessage(error) };
};

export const updateProviderImage = async (
  client: AppSupabaseClient,
  input: {
    id: string;
    sortOrder?: number;
    isCover?: boolean;
    alt?: LocalizedText;
  },
) => {
  const payload: Database["public"]["Tables"]["provider_images"]["Update"] = {
    sort_order: input.sortOrder,
    is_cover: input.isCover,
    alt_i18n: input.alt,
  };

  const { data, error } = await client
    .from("provider_images")
    .update(payload)
    .eq("id", input.id)
    .select("*")
    .single();

  return { data: data ? mapProviderImage(data) : null, error: asErrorMessage(error) };
};

export const deleteProviderImage = async (
  client: AppSupabaseClient,
  imageId: string,
): Promise<MutationResult<{ id: string }>> => {
  const { error } = await client.from("provider_images").delete().eq("id", imageId);
  return { data: error ? null : { id: imageId }, error: asErrorMessage(error) };
};

export const setProviderHeroImage = async (
  client: AppSupabaseClient,
  input: { providerId: string; storagePath: string | null },
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("providers")
    .update({ hero_image_path: input.storagePath })
    .eq("id", input.providerId)
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const replaceOpeningHours = async (
  client: AppSupabaseClient,
  input: {
    providerId: string;
    hours: Array<{
      dayOfWeek: number;
      opensAt: string | null;
      closesAt: string | null;
      isClosed: boolean;
    }>;
  },
): Promise<MutationResult<{ providerId: string }>> => {
  const { error: deleteError } = await client
    .from("opening_hours")
    .delete()
    .eq("provider_id", input.providerId);

  if (deleteError) return { data: null, error: deleteError.message };

  const { error: insertError } = await client.from("opening_hours").insert(
    input.hours.map((entry) => ({
      provider_id: input.providerId,
      day_of_week: entry.dayOfWeek,
      opens_at: entry.isClosed ? null : entry.opensAt,
      closes_at: entry.isClosed ? null : entry.closesAt,
      is_closed: entry.isClosed,
    })),
  );

  return {
    data: insertError ? null : { providerId: input.providerId },
    error: asErrorMessage(insertError),
  };
};

export interface OfferPostInput {
  providerId: string;
  type: Database["public"]["Enums"]["offer_type"];
  title: LocalizedText;
  body: LocalizedText;
  startsAt: string;
  endsAt: string;
  priceLabel?: string | null;
  discountPercent?: number | null;
  createdBy?: string | null;
  isActive?: boolean;
}

export const createOfferPost = async (
  client: AppSupabaseClient,
  input: OfferPostInput,
): Promise<MutationResult<ProductOffer>> => {
  const { data, error } = await client
    .from("product_offers")
    .insert({
      provider_id: input.providerId,
      type: input.type,
      title_i18n: input.title,
      body_i18n: input.body,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      price_label: input.priceLabel ?? null,
      discount_percent: input.discountPercent ?? null,
      created_by: input.createdBy ?? null,
      is_active: input.isActive ?? true,
    })
    .select("*")
    .single();

  return { data: data ? mapOffer(data) : null, error: asErrorMessage(error) };
};

export const updateOfferPost = async (
  client: AppSupabaseClient,
  input: Partial<OfferPostInput> & { id: string; isActive?: boolean },
): Promise<MutationResult<ProductOffer>> => {
  const payload: Database["public"]["Tables"]["product_offers"]["Update"] = {
    type: input.type,
    title_i18n: input.title,
    body_i18n: input.body,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    price_label: input.priceLabel,
    discount_percent: input.discountPercent,
    is_active: input.isActive,
  };

  const { data, error } = await client
    .from("product_offers")
    .update(payload)
    .eq("id", input.id)
    .select("*")
    .single();

  return { data: data ? mapOffer(data) : null, error: asErrorMessage(error) };
};

export const getAdminProviders = async (
  client: AppSupabaseClient,
  filters: {
    status?: Database["public"]["Enums"]["provider_status"];
    verified?: boolean;
    search?: string;
    citySearch?: string;
    sort?: "newest" | "oldest" | "name";
  } = {},
): Promise<AdminProviderRecord[]> => {
  let query = client.from("providers").select("*");
  if (filters.status) query = query.eq("status", filters.status);
  if (typeof filters.verified === "boolean") query = query.eq("is_verified", filters.verified);
  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (filters.sort === "name") {
    query = query.order("slug", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  const { data, error } = await query.limit(100);
  if (error) throw error;

  const baseRows = (data ?? []).filter((row) => {
    const searchNeedle = filters.search?.trim().toLowerCase();
    const cityNeedle = filters.citySearch?.trim().toLowerCase();
    const nameMatch = !searchNeedle || JSON.stringify(row.name_i18n ?? {}).toLowerCase().includes(searchNeedle);
    const cityMatch = !cityNeedle || deriveCityLabel(row.address_i18n).toLowerCase().includes(cityNeedle);
    return nameMatch && cityMatch;
  });

  const categoriesMap = await loadProviderCategories(client, baseRows.map((row) => row.id));

  const summaries = await Promise.all(
    baseRows.map(async (row) => {
      const [{ data: open }, { data: fresh }, { data: discount }, { data: promoted }] = await Promise.all([
        client.rpc("provider_is_open_now", { provider_uuid: row.id }),
        client.rpc("provider_has_active_offer", { provider_uuid: row.id, offer_kind: "fresh_today" }),
        client.rpc("provider_has_active_offer", { provider_uuid: row.id, offer_kind: "discount" }),
        client.rpc("provider_is_currently_promoted", { provider_uuid: row.id }),
      ]);

      const summary = mapProviderSummary({
        ...row,
        distance_meters: 0,
        is_open_now: Boolean(open),
        is_promoted: Boolean(promoted),
        has_fresh_today: Boolean(fresh),
        has_discount: Boolean(discount),
        categories: categoriesMap.get(row.id) ?? [],
      });

      return {
        ...summary,
        ownerUserId: row.owner_user_id,
        ownerLinked: Boolean(row.owner_user_id),
        categoriesCount: categoriesMap.get(row.id)?.length ?? 0,
        createdAt: row.created_at,
        cityLabel: deriveCityLabel(row.address_i18n),
      };
    }),
  );

  return summaries;
};

export const getAdminClaimRequests = async (
  client: AppSupabaseClient,
  filters: {
    status?: Database["public"]["Enums"]["claim_request_status"];
    providerSearch?: string;
  } = {},
): Promise<AdminClaimRequestDetail[]> => {
  let query = client.from("claim_requests").select("*").order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  const { data, error } = await query.limit(100);
  if (error) throw error;

  const providerIds = [...new Set((data ?? []).map((row) => row.provider_id))];
  const { data: providerRows, error: providerError } = await client
    .from("providers")
    .select("id, slug, name_i18n")
    .in("id", providerIds);

  if (providerError) throw providerError;

  const providerMap = new Map(
    (providerRows ?? []).map((row) => [row.id, { name: getPrimaryLocaleText(row.name_i18n) ?? "Unknown provider", slug: row.slug }]),
  );

  return (data ?? [])
    .map((row) => {
      const base = mapClaimRequest(row);
      const provider = providerMap.get(row.provider_id);
      return {
        ...base,
        providerName: provider?.name ?? "Unknown provider",
        providerSlug: provider?.slug,
      };
    })
    .filter((row) =>
      !filters.providerSearch ||
      row.providerName.toLowerCase().includes(filters.providerSearch.toLowerCase().trim()),
    );
};

export const getAdminClaimRequestById = async (
  client: AppSupabaseClient,
  claimRequestId: string,
): Promise<AdminClaimRequestDetail | null> => {
  const rows = await getAdminClaimRequests(client);
  return rows.find((row) => row.id === claimRequestId) ?? null;
};

export const verifyProvider = async (
  client: AppSupabaseClient,
  providerId: string,
  verified: boolean,
  status: Database["public"]["Enums"]["provider_status"],
  reviewerId?: string,
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("providers")
    .update({
      is_verified: verified,
      status,
      verified_at: verified ? new Date().toISOString() : null,
      verified_by: verified ? reviewerId ?? null : null,
    })
    .eq("id", providerId)
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const getAdminProviderById = async (
  client: AppSupabaseClient,
  providerId: string,
): Promise<ProviderDetail | null> => {
  const { data, error } = await client
    .from("providers")
    .select("*")
    .eq("id", providerId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [{ data: open }, { data: fresh }, { data: discount }, { data: promoted }] = await Promise.all([
    client.rpc("provider_is_open_now", { provider_uuid: data.id }),
    client.rpc("provider_has_active_offer", { provider_uuid: data.id, offer_kind: "fresh_today" }),
    client.rpc("provider_has_active_offer", { provider_uuid: data.id, offer_kind: "discount" }),
    client.rpc("provider_is_currently_promoted", { provider_uuid: data.id }),
  ]);

  return buildProviderDetailFromBase(client, {
    ...data,
    is_open_now: Boolean(open),
    is_promoted_now: Boolean(promoted),
    has_fresh_today: Boolean(fresh),
    has_discount: Boolean(discount),
  });
};

export const updateAdminProviderStatus = async (
  client: AppSupabaseClient,
  input: {
    providerId: string;
    status: Database["public"]["Enums"]["provider_status"];
  },
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("providers")
    .update({ status: input.status })
    .eq("id", input.providerId)
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const updateAdminProviderVerified = async (
  client: AppSupabaseClient,
  input: {
    providerId: string;
    verified: boolean;
    reviewerId?: string;
  },
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("providers")
    .update({
      is_verified: input.verified,
      verified_at: input.verified ? new Date().toISOString() : null,
      verified_by: input.verified ? input.reviewerId ?? null : null,
    })
    .eq("id", input.providerId)
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const approveClaimRequest = async (
  client: AppSupabaseClient,
  input: {
    claimRequestId: string;
    reviewerId: string;
  },
): Promise<MutationResult<{ id: string }>> => {
  const { data: claim, error: claimError } = await client
    .from("claim_requests")
    .select("*")
    .eq("id", input.claimRequestId)
    .single();

  if (claimError) return { data: null, error: claimError.message };
  if (claim.status !== "pending") return { data: null, error: "This claim request has already been reviewed." };
  if (!claim.requester_user_id) return { data: null, error: "Claim request is missing a requester account." };

  const { data: provider, error: providerError } = await client
    .from("providers")
    .select("id, owner_user_id")
    .eq("id", claim.provider_id)
    .single();

  if (providerError) return { data: null, error: providerError.message };
  if (provider.owner_user_id && provider.owner_user_id !== claim.requester_user_id) {
    return { data: null, error: "This provider is already linked to another account." };
  }

  const { error: providerUpdateError } = await client
    .from("providers")
    .update({
      owner_user_id: claim.requester_user_id,
      status: "active",
    })
    .eq("id", claim.provider_id);

  if (providerUpdateError) return { data: null, error: providerUpdateError.message };

  const { data, error } = await client
    .from("claim_requests")
    .update({
      status: "approved",
      reviewed_by: input.reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.claimRequestId)
    .eq("status", "pending")
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const rejectClaimRequest = async (
  client: AppSupabaseClient,
  input: {
    claimRequestId: string;
    reviewerId: string;
  },
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("claim_requests")
    .update({
      status: "rejected",
      reviewed_by: input.reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.claimRequestId)
    .eq("status", "pending")
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const getAdminOfferPosts = async (
  client: AppSupabaseClient,
  filters: {
    providerSearch?: string;
    status?: "active" | "archived" | "expired" | "draft";
    onlyFreshToday?: boolean;
    onlyDiscount?: boolean;
  } = {},
): Promise<AdminOfferRecord[]> => {
  const { data, error } = await client
    .from("product_offers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const providerIds = [...new Set((data ?? []).map((row) => row.provider_id))];
  const { data: providerRows, error: providerError } = await client
    .from("providers")
    .select("id, slug, name_i18n")
    .in("id", providerIds);

  if (providerError) throw providerError;

  const providerMap = new Map(
    (providerRows ?? []).map((row) => [row.id, { name: getPrimaryLocaleText(row.name_i18n) ?? "Unknown provider", slug: row.slug }]),
  );

  return (data ?? [])
    .map((row) => {
      const mapped = mapOffer(row);
      const provider = providerMap.get(row.provider_id);
      const now = Date.now();
      const startsAt = new Date(mapped.startsAt).getTime();
      const endsAt = new Date(mapped.endsAt).getTime();
      const status = !mapped.isApproved
        ? "draft"
        : !mapped.isActive
          ? "archived"
          : endsAt < now
            ? "expired"
            : startsAt <= now && endsAt >= now
              ? "active"
              : "draft";

      return {
        ...mapped,
        providerName: provider?.name ?? "Unknown provider",
        providerSlug: provider?.slug,
        _status: status,
      } as AdminOfferRecord & { _status: string };
    })
    .filter((row) => {
      if (filters.providerSearch && !row.providerName.toLowerCase().includes(filters.providerSearch.toLowerCase().trim())) {
        return false;
      }
      if (filters.status && row._status !== filters.status) return false;
      if (filters.onlyFreshToday && row.type !== "fresh_today") return false;
      if (filters.onlyDiscount && row.type !== "discount") return false;
      return true;
    })
    .map(({ _status, ...row }) => row);
};

export const updateAdminOfferStatus = async (
  client: AppSupabaseClient,
  input: {
    offerId: string;
    isActive?: boolean;
    isApproved?: boolean;
  },
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("product_offers")
    .update({
      is_active: input.isActive,
      is_approved: input.isApproved,
      approved_at:
        typeof input.isApproved === "boolean"
          ? input.isApproved
            ? new Date().toISOString()
            : null
          : undefined,
    })
    .eq("id", input.offerId)
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const getAdminCategories = async (client: AppSupabaseClient) => {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCategory);
};

export const createAdminCategory = async (
  client: AppSupabaseClient,
  input: {
    slug: string;
    label: LocalizedText;
    icon: string;
    isActive: boolean;
  },
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("categories")
    .insert({
      slug: input.slug,
      label_i18n: input.label,
      icon_key: input.icon,
      is_active: input.isActive,
    })
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const updateAdminCategory = async (
  client: AppSupabaseClient,
  input: {
    id: string;
    slug?: string;
    label?: LocalizedText;
    icon?: string;
    isActive?: boolean;
  },
): Promise<MutationResult<{ id: string }>> => {
  const { data, error } = await client
    .from("categories")
    .update({
      slug: input.slug,
      label_i18n: input.label,
      icon_key: input.icon,
      is_active: input.isActive,
    })
    .eq("id", input.id)
    .select("id")
    .single();

  return { data, error: asErrorMessage(error) };
};

export const getAdminDashboardSummary = async (
  client: AppSupabaseClient,
): Promise<AdminDashboardSummary> => {
  const [providers, claims, offers, analyticsEvents, providerCategories, openingHours, providerImages] = await Promise.all([
    client.from("providers").select("id, status, is_verified", { count: "exact" }),
    client.from("claim_requests").select("id, status", { count: "exact" }),
    client
      .from("product_offers")
      .select("id, is_active, is_approved, starts_at, ends_at", { count: "exact" }),
    client.from("analytics_events").select("id", { count: "exact" }),
    client.from("provider_categories").select("provider_id"),
    client.from("opening_hours").select("provider_id"),
    client.from("provider_images").select("provider_id"),
  ]);

  const providerRows = providers.data ?? [];
  const claimRows = claims.data ?? [];
  const offerRows = offers.data ?? [];
  const now = Date.now();
  const providerIds = providerRows.map((row) => row.id);
  const categorizedProviders = new Set((providerCategories.data ?? []).map((row) => row.provider_id));
  const providersWithHours = new Set((openingHours.data ?? []).map((row) => row.provider_id));
  const providersWithImages = new Set((providerImages.data ?? []).map((row) => row.provider_id));

  return {
    totalProviders: providers.count ?? providerRows.length,
    activeProviders: providerRows.filter((row) => row.status === "active").length,
    pendingProviders: providerRows.filter((row) => row.status === "pending_verification").length,
    verifiedProviders: providerRows.filter((row) => row.is_verified).length,
    suspendedProviders: providerRows.filter((row) => row.status === "suspended").length,
    pendingClaimRequests: claimRows.filter((row) => row.status === "pending").length,
    activeOfferPosts: offerRows.filter((row) => {
      const startsAt = new Date(row.starts_at).getTime();
      const endsAt = new Date(row.ends_at).getTime();
      return row.is_active && row.is_approved && startsAt <= now && endsAt >= now;
    }).length,
    totalAnalyticsEvents: analyticsEvents.count ?? 0,
    providersMissingCategories: providerIds.filter((id) => !categorizedProviders.has(id)).length,
    providersMissingOpeningHours: providerIds.filter((id) => !providersWithHours.has(id)).length,
    providersMissingImages: providerIds.filter((id) => !providersWithImages.has(id)).length,
    claimRequestsAwaitingReview: claimRows.filter((row) => row.status === "pending").length,
  };
};

const getTopProviderMetrics = async (
  client: AppSupabaseClient,
  eventName: string,
) => {
  const { data, error } = await client
    .from("analytics_events")
    .select("provider_id")
    .eq("event_name", eventName)
    .not("provider_id", "is", null);

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.provider_id) continue;
    counts.set(row.provider_id, (counts.get(row.provider_id) ?? 0) + 1);
  }

  const providerIds = [...counts.keys()];
  if (providerIds.length === 0) return [];

  const { data: providers, error: providersError } = await client
    .from("providers")
    .select("id, name_i18n")
    .in("id", providerIds);

  if (providersError) throw providersError;

  const providerMap = new Map(
    (providers ?? []).map((row) => [row.id, getPrimaryLocaleText(row.name_i18n) ?? "Unknown provider"]),
  );

  return [...counts.entries()]
    .map(([providerId, count]) => ({
      providerId,
      providerName: providerMap.get(providerId) ?? "Unknown provider",
      count,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
};

export const getAdminAnalyticsSummary = async (
  client: AppSupabaseClient,
): Promise<AdminAnalyticsSummary> => {
  const [providerViews, navigationStarts, callClicks, websiteClicks, favoriteToggles, totalEvents, topViewedProviders, topNavigatedProviders, topCallClickProviders, topWebsiteClickProviders] =
    await Promise.all([
      client.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "provider_opened"),
      client.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "navigation_started"),
      client.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "provider_phone_clicked"),
      client.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "provider_website_clicked"),
      client.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "favorite_toggled"),
      client.from("analytics_events").select("id", { count: "exact", head: true }),
      getTopProviderMetrics(client, "provider_opened"),
      getTopProviderMetrics(client, "navigation_started"),
      getTopProviderMetrics(client, "provider_phone_clicked"),
      getTopProviderMetrics(client, "provider_website_clicked"),
    ]);

  return {
    totalProviderViews: providerViews.count ?? 0,
    totalNavigationStarts: navigationStarts.count ?? 0,
    totalCallClicks: callClicks.count ?? 0,
    totalWebsiteClicks: websiteClicks.count ?? 0,
    totalFavoriteToggles: favoriteToggles.count ?? 0,
    totalEvents: totalEvents.count ?? 0,
    topViewedProviders,
    topNavigatedProviders,
    topCallClickProviders,
    topWebsiteClickProviders,
  };
};

export const getDashboardAnalyticsSummary = async (
  client: AppSupabaseClient,
  providerId: string,
): Promise<AnalyticsSummary> => {
  const { count: profileViews } = await client
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("event_name", "provider_opened");

  const { count: navigationStarts } = await client
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("event_name", "navigation_started");

  const { count: callClicks } = await client
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("event_name", "provider_phone_clicked");

  const { count: websiteClicks } = await client
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("event_name", "provider_website_clicked");

  const { count: favorites } = await client
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId);

  const { count: totalOffers } = await client
    .from("product_offers")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId);

  const { count: activeOffers } = await client
    .from("product_offers")
    .select("*", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("is_active", true);

  return {
    profileViews: profileViews ?? 0,
    navigationStarts: navigationStarts ?? 0,
    callClicks: callClicks ?? 0,
    websiteClicks: websiteClicks ?? 0,
    favorites: favorites ?? 0,
    totalOffers: totalOffers ?? 0,
    activeOffers: activeOffers ?? 0,
  };
};
