"use client";

import { createAdminCategory, updateAdminCategory } from "@radar-domace/api";
import type { ProviderCategory } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../../lib/supabase-browser";
import { adminCategorySchema } from "../../../lib/validation/admin";
import { LocalizedTextFields } from "../../forms/localized-text-fields";

const emptyText = { sl: "", en: "", de: "", it: "" };

export const CategoryForm = ({
  category,
}: {
  category?: ProviderCategory | null;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    slug: category?.slug ?? "",
    label: category?.label ?? emptyText,
    icon: category?.icon ?? "leaf",
    isActive: category?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      slug: category?.slug ?? "",
      label: category?.label ?? emptyText,
      icon: category?.icon ?? "leaf",
      isActive: category?.isActive ?? true,
    });
  }, [category]);

  const save = () => {
    const parsed = adminCategorySchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Category is invalid.");
      setFeedback(null);
      return;
    }

    if (category && category.slug !== parsed.data.slug) {
      const confirmed = window.confirm(
        "Change this category key? Existing references depend on stable category keys.",
      );
      if (!confirmed) return;
    }

    startTransition(async () => {
      setError(null);
      setFeedback(null);
      const client = createWebBrowserSupabaseClient();
      const result = category
        ? await updateAdminCategory(client, {
            id: category.id,
            slug: parsed.data.slug,
            label: parsed.data.label,
            icon: parsed.data.icon,
            isActive: parsed.data.isActive,
          })
        : await createAdminCategory(client, {
            slug: parsed.data.slug,
            label: parsed.data.label,
            icon: parsed.data.icon,
            isActive: parsed.data.isActive,
          });

      if (result.error) {
        setError(result.error);
        return;
      }

      setFeedback(category ? "Category updated." : "Category created.");
      router.refresh();
    });
  };

  return (
    <div className="stack-lg">
      <div className="form-grid">
        <div className="field">
          <label>Key</label>
          <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
        </div>
        <div className="field">
          <label>Icon</label>
          <input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} />
        </div>
      </div>
      <LocalizedTextFields label="Category name" value={form.label} onChange={(label) => setForm((current) => ({ ...current, label }))} />
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
        />
        Category is active
      </label>
      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : category ? "Save category" : "Create category"}
        </button>
      </div>
      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};
