import { getActiveProvidersNearby } from "@radar-domace/api";
import type { ProviderSummary } from "@radar-domace/types";
import { useEffect, useMemo, useState } from "react";
import { getMobileSupabaseClient } from "../../lib/supabase";
import { getMissingMobileSupabaseMessage, isMobileSupabaseConfigured } from "../../lib/env";
import { useDiscoverySession } from "./useDiscoverySession";

const useDebouncedValue = <T,>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debounced;
};

export const useNearbyProviders = () => {
  const {
    filters,
    searchQuery,
    selectedProviderSlug,
    setSelectedProviderSlug,
    locationState: { location, permissionState },
  } = useDiscoverySession();

  const debouncedSearch = useDebouncedValue(searchQuery, 250);
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location || permissionState !== "granted") {
      setProviders([]);
      setLoading(false);
      return;
    }

    if (!isMobileSupabaseConfigured) {
      setProviders([]);
      setError(getMissingMobileSupabaseMessage());
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getActiveProvidersNearby(getMobileSupabaseClient(), {
      lat: location.latitude,
      lng: location.longitude,
      radiusKm: filters.radiusKm,
      categoryKeys: filters.categoryKeys,
      openNow: filters.onlyOpenNow,
      onlyVerified: filters.onlyVerified,
      onlyFreshToday: filters.onlyFreshToday,
      onlyDiscount: filters.onlyDiscount,
      search: debouncedSearch,
    })
      .then((rows) => {
        if (!active) return;
        setProviders(rows);
        if (rows.length > 0 && (!selectedProviderSlug || !rows.some((row) => row.slug === selectedProviderSlug))) {
          setSelectedProviderSlug(rows[0].slug);
        }
        setLoading(false);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Nearby providers could not be loaded.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    debouncedSearch,
    filters.categoryKeys,
    filters.onlyDiscount,
    filters.onlyFreshToday,
    filters.onlyOpenNow,
    filters.onlyVerified,
    filters.radiusKm,
    location,
    permissionState,
    selectedProviderSlug,
    setSelectedProviderSlug,
  ]);

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.slug === selectedProviderSlug) ?? null,
    [providers, selectedProviderSlug],
  );

  return {
    providers,
    selectedProvider,
    loading,
    error,
  };
};
