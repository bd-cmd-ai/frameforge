import { getProviderBySlug } from "@radar-domace/api";
import type { ProviderDetail } from "@radar-domace/types";
import { useEffect, useState } from "react";
import { getMobileSupabaseClient } from "../../lib/supabase";
import { getMissingMobileSupabaseMessage, isMobileSupabaseConfigured } from "../../lib/env";

export const useProviderDetail = (slug: string | undefined) => {
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setProvider(null);
      setLoading(false);
      return;
    }

    if (!isMobileSupabaseConfigured) {
      setProvider(null);
      setError(getMissingMobileSupabaseMessage());
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getProviderBySlug(getMobileSupabaseClient(), slug)
      .then((row) => {
        if (!active) return;
        setProvider(row);
        setLoading(false);
      })
      .catch((cause) => {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Provider detail could not be loaded.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return { provider, loading, error };
};
