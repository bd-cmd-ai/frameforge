import { useEffect, useState } from "react";
import { getActiveProvidersNearby } from "@radar-domace/api";
import type { ProviderSummary } from "@radar-domace/types";
import { getMobileSupabaseClient } from "../lib/supabase";

export const useExploreProviders = () => {
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveProvidersNearby(getMobileSupabaseClient(), {
      lat: 46.0569,
      lng: 14.5058,
      radiusKm: 25,
    })
      .then((rows) => {
        setProviders(rows);
        setLoading(false);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Nearby provider query failed.");
        setLoading(false);
      });
  }, []);

  return { providers, loading, error };
};
