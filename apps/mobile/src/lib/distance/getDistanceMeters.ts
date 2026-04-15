import type { LocationPoint } from "@radar-domace/types";

const toRadians = (value: number) => (value * Math.PI) / 180;

export const getDistanceMeters = (from: LocationPoint, to: LocationPoint) => {
  const earthRadiusMeters = 6371000;
  const latDelta = toRadians(to.latitude - from.latitude);
  const lngDelta = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(haversine));
};
