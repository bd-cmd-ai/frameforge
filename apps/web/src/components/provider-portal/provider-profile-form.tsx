"use client";

import { trackAnalyticsEvent, updateMyProvider } from "@radar-domace/api";
import type { ProviderDetail, ProviderFormValues } from "@radar-domace/types";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createWebBrowserSupabaseClient } from "../../lib/supabase-browser";
import { providerProfileSchema } from "../../lib/validation/provider";
import { LocalizedTextFields } from "../forms/localized-text-fields";

const clean = (value?: string | null) => value ?? "";

export const ProviderProfileForm = ({ provider }: { provider: ProviderDetail }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<ProviderFormValues>({
    name: provider.name,
    shortDescription: provider.shortDescription,
    description: provider.description,
    address: provider.address,
    latitude: provider.latitude,
    longitude: provider.longitude,
    phone: clean(provider.phone),
    email: clean(provider.email),
    website: clean(provider.website),
  });

  const validationError = useMemo(() => {
    const parsed = providerProfileSchema.safeParse(values);
    return parsed.success ? null : parsed.error.issues[0]?.message ?? "Profile fields are invalid.";
  }, [values]);

  const save = () => {
    const parsed = providerProfileSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Profile fields are invalid.");
      setFeedback(null);
      return;
    }

    startTransition(async () => {
      setError(null);
      setFeedback(null);

      const client = createWebBrowserSupabaseClient();
      const result = await updateMyProvider(client, {
        providerId: provider.id,
        values: parsed.data,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      void trackAnalyticsEvent(client, {
        eventName: "portal_profile_saved",
        actorRole: "provider",
        providerId: provider.id,
        metadata: {
          source: "provider_profile_form",
        },
      });

      setFeedback("Profile saved successfully.");
      router.refresh();
    });
  };

  return (
    <div className="stack-lg">
      <div className="note">
        City, postal code, and country currently live inside the localized address fields in this MVP schema. Slug and verification fields stay system-managed.
      </div>

      <LocalizedTextFields label="Provider name" value={values.name} onChange={(name) => setValues((current) => ({ ...current, name }))} />
      <LocalizedTextFields
        label="Short description"
        value={values.shortDescription}
        onChange={(shortDescription) => setValues((current) => ({ ...current, shortDescription }))}
        multiline
      />
      <LocalizedTextFields
        label="Full description"
        value={values.description}
        onChange={(description) => setValues((current) => ({ ...current, description }))}
        multiline
      />
      <LocalizedTextFields label="Address" value={values.address} onChange={(address) => setValues((current) => ({ ...current, address }))} />

      <div className="form-grid">
        <div className="field">
          <label>Latitude</label>
          <input
            type="number"
            step="0.000001"
            value={values.latitude}
            onChange={(event) => setValues((current) => ({ ...current, latitude: Number(event.target.value) }))}
          />
        </div>
        <div className="field">
          <label>Longitude</label>
          <input
            type="number"
            step="0.000001"
            value={values.longitude}
            onChange={(event) => setValues((current) => ({ ...current, longitude: Number(event.target.value) }))}
          />
        </div>
        <div className="field">
          <label>Phone</label>
          <input value={values.phone ?? ""} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={values.email ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          />
        </div>
        <div className="field full">
          <label>Website</label>
          <input
            value={values.website ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, website: event.target.value }))}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="inline-actions">
        <button className="primary-button" type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </button>
        <span className="muted">Slug: {provider.slug}</span>
      </div>

      {validationError && !error ? <p className="field-error">{validationError}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
      {feedback ? <p className="field-success">{feedback}</p> : null}
    </div>
  );
};
