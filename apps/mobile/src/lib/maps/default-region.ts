export const DEFAULT_REGION = {
  latitude: 46.0569,
  longitude: 14.5058,
  latitudeDelta: 0.18,
  longitudeDelta: 0.18,
};

export const radiusKmToRegionDelta = (radiusKm: number) => ({
  latitudeDelta: Math.max(0.015, radiusKm * 0.03),
  longitudeDelta: Math.max(0.015, radiusKm * 0.03),
});
