import { getUserFavorites, toggleFavorite, trackAnalyticsEvent } from "@radar-domace/api";
import type { ExploreFilters, ExploreViewMode } from "@radar-domace/types";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useAuth } from "../../lib/auth";
import { getMobileSupabaseClient } from "../../lib/supabase";
import { getMissingMobileSupabaseMessage, isMobileSupabaseConfigured } from "../../lib/env";
import { useForegroundLocation } from "../location/useForegroundLocation";

const defaultFilters: ExploreFilters = {
  radiusKm: 10,
  categoryKeys: [],
  onlyOpenNow: false,
  onlyVerified: false,
  onlyFreshToday: false,
  onlyDiscount: false,
};

interface DiscoverySessionValue {
  filters: ExploreFilters;
  setFilters: (filters: ExploreFilters) => void;
  resetFilters: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  viewMode: ExploreViewMode;
  setViewMode: (mode: ExploreViewMode) => void;
  selectedProviderSlug: string | null;
  setSelectedProviderSlug: (slug: string | null) => void;
  activeFilterCount: number;
  favoriteIds: string[];
  favoritesLoading: boolean;
  toggleFavoriteForProvider: (providerId: string) => Promise<void>;
  locationState: ReturnType<typeof useForegroundLocation>;
}

const DiscoverySessionContext = createContext<DiscoverySessionValue | null>(null);

export const DiscoverySessionProvider = ({ children }: PropsWithChildren) => {
  const { profile } = useAuth();
  const locationState = useForegroundLocation();
  const [filters, setFilters] = useState<ExploreFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ExploreViewMode>("map");
  const [selectedProviderSlug, setSelectedProviderSlug] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    if (!profile) {
      setFavoriteIds([]);
      setFavoritesLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    if (!isMobileSupabaseConfigured) {
      setFavoritesLoading(false);
      return;
    }

    let active = true;
    setFavoritesLoading(true);

    getUserFavorites(getMobileSupabaseClient(), profile.id)
      .then((rows) => {
        if (!active) return;
        setFavoriteIds(rows.map((row) => row.id));
        setFavoritesLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setFavoritesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profile]);

  const value = useMemo<DiscoverySessionValue>(
    () => ({
      filters,
      setFilters,
      resetFilters: () => setFilters(defaultFilters),
      searchQuery,
      setSearchQuery,
      viewMode,
      setViewMode,
      selectedProviderSlug,
      setSelectedProviderSlug,
      activeFilterCount:
        filters.categoryKeys.length +
        Number(filters.onlyOpenNow) +
        Number(filters.onlyVerified) +
        Number(filters.onlyFreshToday) +
        Number(filters.onlyDiscount) +
        Number(filters.radiusKm !== defaultFilters.radiusKm),
      favoriteIds,
      favoritesLoading,
      async toggleFavoriteForProvider(providerId) {
        if (!profile || !isMobileSupabaseConfigured) {
          if (!isMobileSupabaseConfigured) {
            console.warn(getMissingMobileSupabaseMessage());
          }
          return;
        }

        let shouldRevert = false;
        try {
          const wasFavorite = favoriteIds.includes(providerId);
          setFavoritesLoading(true);
          setFavoriteIds((current) =>
            current.includes(providerId)
              ? current.filter((item) => item !== providerId)
              : [...current, providerId],
          );

          const client = getMobileSupabaseClient();
          const result = await toggleFavorite(client, profile.id, providerId);
          if (!result.data) {
            shouldRevert = true;
            return;
          }

          void trackAnalyticsEvent(client, {
            eventName: "favorite_toggled",
            actorUserId: profile.id,
            actorRole: profile.role,
            providerId,
            metadata: {
              action: result.data.isFavorite ? "added" : "removed",
              previousState: wasFavorite ? "favorite" : "not_favorite",
            },
          });
        } catch {
          shouldRevert = true;
        } finally {
          if (shouldRevert) {
            setFavoriteIds((current) =>
              current.includes(providerId)
                ? current.filter((item) => item !== providerId)
                : [...current, providerId],
            );
          }
          setFavoritesLoading(false);
        }
      },
      locationState,
    }),
    [favoriteIds, favoritesLoading, filters, locationState, profile, searchQuery, selectedProviderSlug, viewMode],
  );

  return <DiscoverySessionContext.Provider value={value}>{children}</DiscoverySessionContext.Provider>;
};

export const useDiscoverySession = () => {
  const context = useContext(DiscoverySessionContext);
  if (!context) {
    throw new Error("useDiscoverySession must be used inside DiscoverySessionProvider");
  }
  return context;
};
