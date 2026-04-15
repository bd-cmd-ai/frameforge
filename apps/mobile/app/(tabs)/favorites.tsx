import { router } from "expo-router";
import { useMemo } from "react";
import { AppScreen } from "../../src/components/AppScreen";
import { ErrorState } from "../../src/components/StatefulPanel";
import { EmptyState } from "../../src/components/explore/EmptyState";
import { LoadingBlock } from "../../src/components/explore/LoadingBlock";
import { ProviderCard } from "../../src/components/provider/ProviderCard";
import { getDistanceMeters } from "../../src/lib/distance/getDistanceMeters";
import { useDiscoverySession } from "../../src/hooks/providers/useDiscoverySession";
import { useFavoriteProviders } from "../../src/hooks/providers/useFavoriteProviders";

export default function FavoritesScreen() {
  const { providers, loading, error } = useFavoriteProviders();
  const { favoriteIds, locationState, toggleFavoriteForProvider } = useDiscoverySession();

  const resolvedProviders = useMemo(
    () =>
      providers.map((provider) => ({
        ...provider,
        distanceMeters: locationState.location
          ? getDistanceMeters(locationState.location, {
              latitude: provider.latitude,
              longitude: provider.longitude,
            })
          : Number.NaN,
      })),
    [locationState.location, providers],
  );

  return (
    <AppScreen title="Saved producers" subtitle="Keep a shortlist of places worth the detour while you travel.">
      {loading ? <LoadingBlock label="Loading saved producers..." /> : null}
      {error ? <ErrorState description={error} /> : null}
      {!loading && !error && resolvedProviders.length === 0 ? (
        <EmptyState title="No saved producers yet" description="Save a few farms or specialty shops from Explore and they will appear here." />
      ) : null}
      {!loading && !error && resolvedProviders.map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          isFavorite={favoriteIds.includes(provider.id)}
          onToggleFavorite={() => toggleFavoriteForProvider(provider.id)}
          onPress={() => router.push(`/provider/${provider.slug}`)}
        />
      ))}
    </AppScreen>
  );
}
