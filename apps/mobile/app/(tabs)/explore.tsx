import { router } from "expo-router";
import { useMemo } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { ErrorState } from "../../src/components/StatefulPanel";
import { EmptyState } from "../../src/components/explore/EmptyState";
import { ExploreHeader } from "../../src/components/explore/ExploreHeader";
import { LoadingBlock } from "../../src/components/explore/LoadingBlock";
import { PermissionState } from "../../src/components/explore/PermissionState";
import { ProviderMap } from "../../src/components/explore/ProviderMap";
import { ProviderCard } from "../../src/components/provider/ProviderCard";
import { mobileTheme } from "../../src/constants/theme";
import { useAuth } from "../../src/lib/auth";
import { useCategories } from "../../src/hooks/providers/useCategories";
import { useDiscoverySession } from "../../src/hooks/providers/useDiscoverySession";
import { useNearbyProviders } from "../../src/hooks/providers/useNearbyProviders";

export default function ExploreScreen() {
  const { loading: authLoading } = useAuth();
  const { categories, error: categoriesError } = useCategories();
  const {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    activeFilterCount,
    selectedProviderSlug,
    setSelectedProviderSlug,
    favoriteIds,
    locationState,
    toggleFavoriteForProvider,
  } = useDiscoverySession();
  const { providers, selectedProvider, loading, error } = useNearbyProviders();

  const quickCategories = useMemo(() => categories.slice(0, 5), [categories]);
  const highlightedProviders = useMemo(() => {
    if (!selectedProvider) return providers;
    return [selectedProvider, ...providers.filter((provider) => provider.id !== selectedProvider.id)];
  }, [providers, selectedProvider]);

  const handleToggleQuickCategory = (categoryKey: string) =>
    setFilters({
      ...filters,
      categoryKeys: filters.categoryKeys.includes(categoryKey)
        ? filters.categoryKeys.filter((item) => item !== categoryKey)
        : [...filters.categoryKeys, categoryKey],
    });

  const openProvider = (slug: string) => router.push(`/provider/${slug}`);

  const renderSheetContent = () => {
    if (loading && providers.length === 0) {
      return <LoadingBlock label="Loading nearby producers..." />;
    }

    if (error) {
      return <ErrorState description={error} />;
    }

    if (providers.length === 0) {
      return (
        <EmptyState
          title={activeFilterCount > 0 || searchQuery ? "No matches in this area" : "No producers nearby yet"}
          description={
            activeFilterCount > 0 || searchQuery
              ? "Try widening the radius or clearing one of the active filters."
              : "We could not find active producers in the selected radius. Try 20 km or another location."
          }
        />
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.sheetList} showsVerticalScrollIndicator={false}>
        {highlightedProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isFavorite={favoriteIds.includes(provider.id)}
            isSelected={provider.slug === selectedProviderSlug}
            onToggleFavorite={() => toggleFavoriteForProvider(provider.id)}
            onPress={() => openProvider(provider.slug)}
          />
        ))}
      </ScrollView>
    );
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.headerWrap}>
          <LoadingBlock label="Loading your session..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrap}>
        <ExploreHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          radiusKm={filters.radiusKm}
          onRadiusChange={(radiusKm) => setFilters({ ...filters, radiusKm })}
          activeFilterCount={activeFilterCount}
          onOpenFilters={() => router.push("/filter-modal")}
          quickCategories={quickCategories}
          selectedCategoryKeys={filters.categoryKeys}
          onToggleQuickCategory={handleToggleQuickCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </View>

      {categoriesError ? (
        <View style={styles.feedbackWrap}>
          <ErrorState description={categoriesError} />
        </View>
      ) : null}

      {locationState.permissionState === "undetermined" ? (
        <View style={styles.feedbackWrap}>
          <PermissionState
            title="Allow location to discover nearby farms"
            description="Radar Domače uses foreground location only, so travelers can quickly see producers around their route."
            ctaLabel="Share current location"
            onPress={() => void locationState.requestPermission()}
          />
        </View>
      ) : null}

      {locationState.permissionState === "denied" ? (
        <View style={styles.feedbackWrap}>
          <PermissionState
            title="Location access is turned off"
            description="Enable location to see distance-aware results, map pins, and navigation shortcuts."
            ctaLabel="Try again"
            onPress={() => void locationState.requestPermission()}
          />
        </View>
      ) : null}

      {locationState.loading && locationState.permissionState === "granted" ? (
        <View style={styles.feedbackWrap}>
          <LoadingBlock label="Fetching your current location..." />
        </View>
      ) : null}

      {locationState.error && !locationState.location ? (
        <View style={styles.feedbackWrap}>
          <PermissionState
            title="Location is temporarily unavailable"
            description={locationState.error}
            ctaLabel="Retry location"
            onPress={() => void locationState.refreshLocation()}
          />
        </View>
      ) : null}

      {locationState.location && locationState.permissionState === "granted" ? (
        viewMode === "map" ? (
          <View style={styles.mapStage}>
            <ProviderMap
              userLocation={locationState.location}
              providers={providers}
              radiusKm={filters.radiusKm}
              selectedProviderSlug={selectedProviderSlug}
              onSelectProvider={setSelectedProviderSlug}
            />

            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {providers.length} producers within {filters.radiusKm} km
                </Text>
                <Text style={styles.sheetSubtitle}>Tap a marker to highlight the matching card.</Text>
              </View>
              {renderSheetContent()}
            </View>
          </View>
        ) : (
          <View style={styles.listStage}>
            <View style={styles.listSummary}>
              <Text style={styles.sheetTitle}>
                {providers.length} producers within {filters.radiusKm} km
              </Text>
              <Text style={styles.sheetSubtitle}>Switch back to map view anytime to inspect pins and route context.</Text>
            </View>
            <View style={styles.listContent}>{renderSheetContent()}</View>
          </View>
        )
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: mobileTheme.colors.cream,
  },
  headerWrap: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 12,
  },
  feedbackWrap: {
    paddingHorizontal: 18,
    gap: 12,
  },
  mapStage: {
    flex: 1,
    marginTop: 4,
  },
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    maxHeight: "52%",
    backgroundColor: "rgba(252, 249, 241, 0.97)",
    borderRadius: 28,
    padding: 14,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    gap: 12,
  },
  sheetHeader: {
    gap: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: mobileTheme.colors.ink,
  },
  sheetSubtitle: {
    color: mobileTheme.colors.muted,
  },
  sheetList: {
    gap: 12,
    paddingBottom: 6,
  },
  listStage: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },
  listSummary: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: mobileTheme.colors.panel,
    borderWidth: 1,
    borderColor: mobileTheme.colors.border,
    gap: 4,
  },
  listContent: {
    flex: 1,
  },
});
