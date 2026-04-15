import { useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import type { LocationPoint, ProviderSummary } from "@radar-domace/types";
import { pickLocalizedText } from "../../lib/formatting/localized-text";
import { DEFAULT_REGION, radiusKmToRegionDelta } from "../../lib/maps/default-region";

interface ProviderMapProps {
  userLocation: LocationPoint | null;
  providers: ProviderSummary[];
  radiusKm: number;
  selectedProviderSlug: string | null;
  onSelectProvider: (slug: string) => void;
}

export const ProviderMap = ({
  userLocation,
  providers,
  radiusKm,
  selectedProviderSlug,
  onSelectProvider,
}: ProviderMapProps) => {
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedProviderSlug) {
      const selected = providers.find((provider) => provider.slug === selectedProviderSlug);
      if (selected) {
        mapRef.current.animateToRegion({
          latitude: selected.latitude,
          longitude: selected.longitude,
          ...radiusKmToRegionDelta(radiusKm),
        });
        return;
      }
    }

    if (userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...radiusKmToRegionDelta(radiusKm),
      });
    }
  }, [providers, radiusKm, selectedProviderSlug, userLocation]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={
        userLocation
          ? {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              ...radiusKmToRegionDelta(radiusKm),
            }
          : DEFAULT_REGION
      }
      showsUserLocation={Boolean(userLocation)}
      showsMyLocationButton
    >
      {providers.map((provider) => (
        <Marker
          key={provider.id}
          coordinate={{ latitude: provider.latitude, longitude: provider.longitude }}
          title={pickLocalizedText(provider.name)}
          description={pickLocalizedText(provider.shortDescription)}
          pinColor={provider.slug === selectedProviderSlug ? "#d6643b" : "#2e5b2c"}
          onPress={() => onSelectProvider(provider.slug)}
        />
      ))}
    </MapView>
  );
};
