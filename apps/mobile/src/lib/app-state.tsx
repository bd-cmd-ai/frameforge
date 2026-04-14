import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { createAnalyticsClient } from "@radar-domace/analytics";
import { appConfig } from "@radar-domace/config";
import type { ExploreFilters } from "@radar-domace/types";

const analytics = createAnalyticsClient();

interface MobileAppState {
  filters: ExploreFilters;
  favoriteIds: string[];
  setFilters: (filters: ExploreFilters) => void;
  toggleFavorite: (providerId: string) => Promise<void>;
  trackExploreViewed: () => Promise<void>;
}

const defaultFilters: ExploreFilters = {
  radiusKm: appConfig.defaultRadiusKm,
  categoryIds: [],
  onlyOpenNow: false,
  onlyVerified: false,
  onlyFreshToday: false,
};

const AppStateContext = createContext<MobileAppState | null>(null);

export const MobileAppStateProvider = ({ children }: PropsWithChildren) => {
  const [filters, setFilters] = useState<ExploreFilters>(defaultFilters);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["provider-1"]);

  const value = useMemo<MobileAppState>(
    () => ({
      filters,
      favoriteIds,
      setFilters,
      async toggleFavorite(providerId) {
        setFavoriteIds((current) =>
          current.includes(providerId)
            ? current.filter((item) => item !== providerId)
            : [...current, providerId],
        );
        await analytics.track({ eventName: "favorite_toggled", actorRole: "consumer", providerId });
      },
      async trackExploreViewed() {
        await analytics.track({ eventName: "explore_viewed", actorRole: "consumer" });
      },
    }),
    [favoriteIds, filters],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useMobileAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useMobileAppState must be used inside MobileAppStateProvider");
  }
  return context;
};
