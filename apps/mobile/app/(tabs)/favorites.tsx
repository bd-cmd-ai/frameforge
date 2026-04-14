import { router } from "expo-router";
import { providerApi } from "@radar-domace/api";
import { AppScreen } from "../../src/components/AppScreen";
import { EmptyState } from "../../src/components/StatefulPanel";
import { ProviderCard } from "../../src/components/ProviderCard";
import { useMobileAppState } from "../../src/lib/app-state";

export default function FavoritesScreen() {
  const { favoriteIds, toggleFavorite } = useMobileAppState();
  const favorites = providerApi.listProviders({
    radiusKm: 50,
    categoryIds: [],
    onlyOpenNow: false,
    onlyVerified: false,
    onlyFreshToday: false,
  });

  return (
    <AppScreen title="Favorites" subtitle="Quick access to places you want to revisit.">
      {favoriteIds.length === 0 ? (
        <EmptyState title="No favorites yet" description="Save producers from Explore and they’ll appear here." />
      ) : null}
      {/* eslint-disable-next-line @typescript-eslint/no-floating-promises */}
      {(await favorites).filter((provider) => favoriteIds.includes(provider.id)).map((provider) => (
        <ProviderCard
          key={provider.id}
          provider={provider}
          isFavorite
          onToggleFavorite={() => toggleFavorite(provider.id)}
          onPress={() => router.push(`/provider/${provider.id}`)}
        />
      ))}
    </AppScreen>
  );
}
