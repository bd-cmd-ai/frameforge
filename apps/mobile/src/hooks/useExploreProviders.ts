import { useEffect, useState } from "react";
import { providerApi } from "@radar-domace/api";
import type { ProviderSummary } from "@radar-domace/types";
import { useMobileAppState } from "../lib/app-state";

export const useExploreProviders = () => {
  const { filters } = useMobileAppState();
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    providerApi
      .listProviders(filters)
      .then((response) => {
        if (!cancelled) {
          setProviders(response);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Nearby producers could not be loaded.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return { providers, loading, error };
};
