export const formatDistance = (distanceMeters: number) => {
  if (!Number.isFinite(distanceMeters)) {
    return "Distance unavailable";
  }

  if (distanceMeters <= 0) {
    return "< 1 m";
  }

  if (distanceMeters < 1000) {
    return `${Math.max(1, Math.round(distanceMeters))} m`;
  }

  return `${(distanceMeters / 1000).toFixed(distanceMeters < 10000 ? 1 : 0)} km`;
};
