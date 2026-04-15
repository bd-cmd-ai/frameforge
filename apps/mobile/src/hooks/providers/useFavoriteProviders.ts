import { getUserFavorites } from "@radar-domace/api";
import type { ProviderSummary } from "@radar-domace/types";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { getMobileSupabaseClient } from "../../lib/supabase";
import { getMissingMobileSupabaseMessage, isMobileSupabaseConfigured } from "../../lib/env";
import { useDiscoverySession } from "./useDiscoverySession";

export const useFavoriteProviders = () => {
  const { profile } = useAuth();
  const { favoriteIds } = useDiscoverySession();
  const [providers, setProviders] = useState<ProviderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      setProviders([]);
      setLoading(false);
      return;
    }

    if (!isMobileSupabaseConfigured) {
      setProviders([]);
      setError(getMissingMobileSupabaseMessage());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getUserFavorites(getMobileSupabaseClient(), profile.id)
      .then((rows) => {
        setProviders(rows);
        setLoading(false);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Favorites could not be loaded.");
        setLoading(false);
      });
  }, [favoriteIds, profile]);

  return { providers, loading, error };
};
