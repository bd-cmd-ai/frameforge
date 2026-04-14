import { useEffect } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { AppScreen } from "../../src/components/AppScreen";
import { EmptyState, ErrorState, LoadingState } from "../../src/components/StatefulPanel";
import { ProviderCard } from "../../src/components/ProviderCard";
import { mobileTheme } from "../../src/constants/theme";
import { useExploreProviders } from "../../src/hooks/useExploreProviders";
import { useMobileAppState } from "../../src/lib/app-state";

export default function ExploreScreen() {
  const { providers, loading, error } = useExploreProviders();
  const { favoriteIds, toggleFavorite, filters, trackExploreViewed } = useMobileAppState();

  useEffect(() => {
    trackExploreViewed();
  }, [trackExploreViewed]);

  return (
    <AppScreen scrollable={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Nearby producers</Text>
          <Text style={styles.subtitle}>Radius {filters.radiusKm} km • map + quick card scan</Text>
        </View>
        <Pressable style={styles.filterButton} onPress={() => router.push("/filter-modal")}>
          <Text style={styles.filterButtonLabel}>Filters</Text>
        </Pressable>
      </View>

      <View style={styles.mapShell}>
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={{
            latitude: 46.33,
            longitude: 14.2,
            latitudeDelta: 0.22,
            longitudeDelta: 0.22,
          }}
        >
          {providers.map((provider) => (
            <Marker
              key={provider.id}
              coordinate={{ latitude: provider.latitude, longitude: provider.longitude }}
              title={provider.name.sl}
              description={provider.shortDescription.sl}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.bottomSheet}>
        {loading ? <LoadingState label="Loading nearby producers..." /> : null}
        {error ? <ErrorState description={error} /> : null}
        {!loading && !error && providers.length === 0 ? (
          <EmptyState
            title="No producers match these filters"
            description="Try a larger radius or clear one of the status filters."
          />
        ) : null}
        {!loading && !error && providers.slice(0, 3).map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isFavorite={favoriteIds.includes(provider.id)}
            onToggleFavorite={() => toggleFavorite(provider.id)}
            onPress={() => router.push(`/provider/${provider.id}`)}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: mobileTheme.colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: mobileTheme.colors.muted,
    marginTop: 4,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
  },
  filterButtonLabel: {
    fontWeight: "700",
    color: mobileTheme.colors.ink,
  },
  mapShell: {
    flex: 1,
    minHeight: 260,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#dbe8ce",
  },
  bottomSheet: {
    marginTop: -36,
    backgroundColor: mobileTheme.colors.cream,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 18,
    gap: 12,
  },
});
