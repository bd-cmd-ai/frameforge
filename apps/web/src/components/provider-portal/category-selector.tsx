"use client";

import { replaceProviderCategories } from "@radar-domace/api";
import type { ProviderCategory } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { pickLocalizedText } from "../../lib/provider/format";
import { createWebBrowserSupabaseClient } from "../../lib/supabase-browser";

export const CategorySelector = ({
  providerId,
  categories,
  selectedIds,
}: {
  providerId: string;
  categories: ProviderCategory[];
  selectedIds: string[];
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [nextIds, setNextIds] = useState<string[]>(selectedIds);

  const toggleCategory = (categoryId: string) =>
    setNextIds((current) =>
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId],
    );

  const save = () =>
    startTransition(async () => {
      setError(null);
      setFeedback(null);
      const client = createWebBrowserSupabaseClient();
      const result = await replaceProviderCategories(client, { providerId, categoryIds: nextIds });
      if (result.error) {
        setError(result.error);
        return;
      }
      setFeedback("Categories updated.");
      router.refresh();
    });

  return (
    <div className="stack-lg">
      {nextIds.length === 0 ? (
        <div className="note">Select at least one category so the provider can appear correctly in discovery results.</div>
      ) : null}

      <div className="chip-grid">
        {categories.map((category) => {
          const active = nextIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              className={`toggle-chip ${active ? "active" : ""}`}
              onClick={() => toggleCategory(category.id)}
            >
              {pickLocalizedText(category.label)}
            </button>
          );
        })}
      </div>

      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save categories"}
        </button>
        <span className="muted">{nextIds.length} selected</span>
      </div>

      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};
