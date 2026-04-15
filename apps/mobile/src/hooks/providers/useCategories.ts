import { getActiveCategories } from "@radar-domace/api";
import type { ProviderCategory } from "@radar-domace/types";
import { useEffect, useState } from "react";
import { getMobileSupabaseClient } from "../../lib/supabase";
import { getMissingMobileSupabaseMessage, isMobileSupabaseConfigured } from "../../lib/env";

export const useCategories = () => {
  const [categories, setCategories] = useState<ProviderCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isMobileSupabaseConfigured) {
      setError(getMissingMobileSupabaseMessage());
      setLoading(false);
      return;
    }

    getActiveCategories(getMobileSupabaseClient())
      .then((rows) => {
        setCategories(rows);
        setLoading(false);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Categories could not be loaded.");
        setLoading(false);
      });
  }, []);

  return { categories, loading, error };
};
