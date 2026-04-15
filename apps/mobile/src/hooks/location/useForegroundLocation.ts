import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import type { LocationPoint } from "@radar-domace/types";

export type LocationPermissionState = "undetermined" | "granted" | "denied";

export const useForegroundLocation = () => {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>("undetermined");
  const [location, setLocation] = useState<LocationPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
      setPermissionState("granted");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Current location could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await Location.requestForegroundPermissionsAsync();
      const nextState: LocationPermissionState = result.status === "granted" ? "granted" : "denied";
      setPermissionState(nextState);

      if (nextState === "granted") {
        await refreshLocation();
      } else {
        setLoading(false);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Location permission request failed.");
      setLoading(false);
    }
  }, [refreshLocation]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const result = await Location.getForegroundPermissionsAsync();
        if (!active) return;

        const nextState: LocationPermissionState = result.status === "granted" ? "granted" : result.status === "denied" ? "denied" : "undetermined";
        setPermissionState(nextState);

        if (nextState === "granted") {
          await refreshLocation();
        } else {
          setLoading(false);
        }
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Location permission state could not be loaded.");
        setLoading(false);
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [refreshLocation]);

  return {
    permissionState,
    location,
    loading,
    error,
    requestPermission,
    refreshLocation,
  };
};
